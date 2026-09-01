import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function simulate() {
  console.log('🚀 Starting Race Condition Simulation...');
  
  try {
    // 1. Get a random seat that is AVAILABLE
    const seatResult = await pool.query("SELECT id, seat_number FROM seats WHERE status = 'AVAILABLE' LIMIT 1");
    if (seatResult.rows.length === 0) {
      console.error('❌ No available seats found. Please run the seed script again.');
      process.exit(1);
    }
    const seatId = seatResult.rows[0].id;
    const seatNumber = seatResult.rows[0].seat_number;
    
    // 2. Create a dummy user for the booking
    const userResult = await pool.query(
      "INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) ON CONFLICT (google_id) DO UPDATE SET name = EXCLUDED.name RETURNING id",
      ['google-race-tester', 'racetester@example.com', 'Race Tester']
    );
    const userId = userResult.rows[0].id;

    console.log(`🎯 Targeting Seat: ${seatNumber} (ID: ${seatId})`);
    console.log(`👤 Using User ID: ${userId}`);
    
    const REQUEST_COUNT = 100;
    console.log(`🔫 Firing ${REQUEST_COUNT} concurrent booking requests at the EXACT SAME MILLISECOND...`);

    // 3. Prepare the 100 requests
    const requestPromises = [];
    for (let i = 0; i < REQUEST_COUNT; i++) {
      const request = fetch('http://localhost:5000/api/bookings/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId, userId })
      })
      .then(res => res.status)
      .catch(err => 500); // Catch network errors so Promise.all doesn't fail fast

      requestPromises.push(request);
    }

    // 4. Fire them all simultaneously!
    const statuses = await Promise.all(requestPromises);

    // 5. Analyze the results
    let successCount = 0;
    let conflictCount = 0;

    statuses.forEach(status => {
      if (status === 200) successCount++;
      else if (status === 409) conflictCount++;
    });

    console.log('\n-----------------------------------');
    console.log('📊 SIMULATION RESULTS:');
    console.log(`✅ Successful bookings (200 OK): ${successCount}`);
    console.log(`❌ Rejected bookings (409 Conflict): ${conflictCount}`);
    console.log('-----------------------------------');

    if (successCount > 1) {
      console.log('\n🚨 MASSIVE FAILURE: RACE CONDITION DETECTED! 🚨');
      console.log(`Multiple people (${successCount}) successfully booked the exact same seat!`);
      console.log('In the real world, you just oversold a seat and now you have angry customers fighting over it.');
    } else if (successCount === 1) {
      console.log('\n👍 System worked correctly. Only 1 person got the seat.');
    }

    // Verify in DB how many bookings were actually created for this single seat
    const dbBookings = await pool.query('SELECT COUNT(*) FROM bookings WHERE seat_id = $1', [seatId]);
    console.log(`\n💽 Actual records in database 'bookings' table for this one seat: ${dbBookings.rows[0].count}`);

  } catch (error) {
    console.error('Simulation error:', error);
  } finally {
    await pool.end();
  }
}

simulate();
