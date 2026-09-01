import pool from '../config/db.js';

export const initiateBooking = async (req, res) => {
  const { seatId, userId } = req.body;

  if (!seatId || !userId) {
    return res.status(400).json({ error: 'seatId and userId are required' });
  }

  // To use transactions, we must check out a specific client from the pool
  const client = await pool.connect();

  try {
    // 1. Start the transaction
    await client.query('BEGIN');

    // 2. Fetch the seat's current status WITH A PESSIMISTIC LOCK (FOR UPDATE)
    // This tells PostgreSQL: "Lock this row. Nobody else can read or write to it until I COMMIT or ROLLBACK."
    const seatResult = await client.query('SELECT status FROM seats WHERE id = $1 FOR UPDATE', [seatId]);
    
    if (seatResult.rows.length === 0) {
      await client.query('ROLLBACK'); // Always rollback if we exit early!
      return res.status(404).json({ error: 'Seat not found' });
    }

    const seat = seatResult.rows[0];

    // 3. Check if the seat is available
    if (seat.status !== 'AVAILABLE') {
      await client.query('ROLLBACK'); // Another user beat us to it.
      return res.status(409).json({ error: 'Seat is no longer available' });
    }

    // 4. Simulate a tiny processing delay (e.g., verifying user details)
    // Notice how even with this delay, the race condition is impossible now, 
    // because all other 99 requests are waiting at line 18 for the lock to be released!
    await new Promise(resolve => setTimeout(resolve, 50));

    // 5. Update the seat status to RESERVED
    await client.query('UPDATE seats SET status = $1 WHERE id = $2', ['RESERVED', seatId]);

    // 6. Create the pending booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, seat_id, status) 
       VALUES ($1, $2, 'PENDING_OTP') 
       RETURNING id, status`,
      [userId, seatId]
    );

    // 7. Commit the transaction! This saves the changes and releases the lock for the next person in line.
    await client.query('COMMIT');

    res.status(200).json({
      message: 'Booking initiated successfully',
      booking: bookingResult.rows[0]
    });
  } catch (error) {
    // If absolutely anything goes wrong (network failure, bad query, etc), undo everything we did in this transaction.
    await client.query('ROLLBACK');
    req.log.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // We MUST return the client back to the pool, otherwise our app will eventually run out of connections and crash!
    client.release();
  }
};
