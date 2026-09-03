import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { sendOtpEmail } from '../services/emailService.js';

export const initiateBooking = async (req, res) => {
  const { seatId } = req.body;
  const userId = req.user.userId;

  if (!seatId) {
    return res.status(400).json({ error: 'seatId is required' });
  }

  // To use transactions, we must check out a specific client from the pool
  const client = await pool.connect();

  try {
    // 1. Start the transaction
    await client.query('BEGIN');

    // 2. Fetch the seat's current status WITH A PESSIMISTIC LOCK (FOR UPDATE)
    const seatResult = await client.query('SELECT status FROM seats WHERE id = $1 FOR UPDATE', [seatId]);
    
    if (seatResult.rows.length === 0) {
      await client.query('ROLLBACK'); // Always rollback if we exit early!
      return res.status(404).json({ error: 'Seat not found' });
    }

    const seat = seatResult.rows[0];

    // 3. Check if the seat is available
    if (seat.status !== 'AVAILABLE') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Seat is no longer available' });
    }

    // 4. Simulate a tiny processing delay (e.g., verifying user details)
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
    const bookingId = bookingResult.rows[0].id;

    // 7. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 8. Hash the OTP (Security best practice)
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(otp, saltRounds);

    // 9. Save the hashed OTP to the database, expiring in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await client.query(
      `INSERT INTO otp_verifications (booking_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [bookingId, otpHash, expiresAt]
    );

    // 10. Fetch the user's email and name so we can send the OTP
    const userResult = await client.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // 11. Dispatch the email via Brevo
    if (user && user.email) {
      await sendOtpEmail(user.email, user.name, otp);
    }

    // 12. Commit the transaction!
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

export const verifyOtp = async (req, res) => {
  const { bookingId, otp } = req.body;
  const userId = req.user.userId;

  if (!bookingId || !otp) {
    return res.status(400).json({ error: 'bookingId and otp are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify the booking belongs to the user and is pending
    const bookingRes = await client.query(
      'SELECT seat_id, status FROM bookings WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [bookingId, userId]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const booking = bookingRes.rows[0];

    if (booking.status !== 'PENDING_OTP') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Booking is not awaiting OTP verification' });
    }

    // 2. Fetch the OTP record
    const otpRes = await client.query(
      'SELECT otp_hash, expires_at FROM otp_verifications WHERE booking_id = $1',
      [bookingId]
    );

    if (otpRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'OTP record not found' });
    }

    const otpRecord = otpRes.rows[0];

    // 3. Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      // If expired, the booking fails. We should free up the seat!
      await client.query("UPDATE bookings SET status = 'FAILED' WHERE id = $1", [bookingId]);
      await client.query("UPDATE seats SET status = 'AVAILABLE' WHERE id = $1", [booking.seat_id]);
      await client.query('COMMIT');
      return res.status(400).json({ error: 'OTP has expired. Your reservation was cancelled.' });
    }

    // 4. Verify the hash
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isValid) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // 5. Success! Confirm the booking and permanently book the seat
    await client.query("UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1", [bookingId]);
    await client.query("UPDATE seats SET status = 'BOOKED' WHERE id = $1", [booking.seat_id]);

    await client.query('COMMIT');

    res.status(200).json({ message: 'Booking confirmed successfully!' });
  } catch (error) {
    await client.query('ROLLBACK');
    req.log.error(error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
