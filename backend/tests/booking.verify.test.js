import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('POST /api/bookings/verify Lifecycle & Verification', () => {
  let authToken;
  let testUserId;
  let testMovieId;
  let testSeatId;

  const validOtp = '789456';

  beforeAll(async () => {
    // 1. Create a test user
    const userRes = await pool.query(
      `INSERT INTO users (google_id, email, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['google-verify-test-id', 'verify.test@example.com', 'Verify Tester']
    );
    testUserId = userRes.rows[0].id;

    // 2. Generate valid JWT
    authToken = jwt.sign(
      { userId: testUserId, email: 'verify.test@example.com' },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_development',
      { expiresIn: '1h' }
    );

    // 3. Create a test movie and seat
    const movieRes = await pool.query(
      `INSERT INTO movies (title, poster_url, showtime)
       VALUES ($1, $2, NOW() + INTERVAL '1 day')
       RETURNING id`,
      ['Verify Test Movie', 'https://example.com/poster.jpg']
    );
    testMovieId = movieRes.rows[0].id;

    const seatRes = await pool.query(
      `INSERT INTO seats (movie_id, seat_number, status)
       VALUES ($1, $2, 'RESERVED')
       RETURNING id`,
      [testMovieId, 'B1']
    );
    testSeatId = seatRes.rows[0].id;
  });

  afterAll(async () => {
    // Clean up all entities created for this test
    await pool.query('DELETE FROM otp_verifications WHERE booking_id IN (SELECT id FROM bookings WHERE seat_id = $1)', [testSeatId]);
    await pool.query('DELETE FROM bookings WHERE seat_id = $1', [testSeatId]);
    await pool.query('DELETE FROM seats WHERE id = $1', [testSeatId]);
    await pool.query('DELETE FROM movies WHERE id = $1', [testMovieId]);
    await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    await pool.end();
  });

  it('should confirm booking and mark seat as BOOKED when OTP is valid', async () => {
    // Create a pending booking
    const bookingRes = await pool.query(
      `INSERT INTO bookings (user_id, seat_id, status)
       VALUES ($1, $2, 'PENDING_OTP')
       RETURNING id`,
      [testUserId, testSeatId]
    );
    const bookingId = bookingRes.rows[0].id;

    // Save hashed OTP expiring in 10 minutes
    const otpHash = await bcrypt.hash(validOtp, 10);
    const validExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query(
      `INSERT INTO otp_verifications (booking_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [bookingId, otpHash, validExpiry]
    );

    // Submit valid OTP
    const response = await request(app)
      .post('/api/bookings/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ bookingId, otp: validOtp });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Booking confirmed successfully!');

    // Assert DB state: booking is CONFIRMED, seat is BOOKED
    const updatedBooking = await pool.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
    expect(updatedBooking.rows[0].status).toBe('CONFIRMED');

    const updatedSeat = await pool.query('SELECT status FROM seats WHERE id = $1', [testSeatId]);
    expect(updatedSeat.rows[0].status).toBe('BOOKED');
  });

  it('should reject with 401 when the wrong OTP is submitted', async () => {
    // Reset seat to RESERVED
    await pool.query("UPDATE seats SET status = 'RESERVED' WHERE id = $1", [testSeatId]);

    const bookingRes = await pool.query(
      `INSERT INTO bookings (user_id, seat_id, status)
       VALUES ($1, $2, 'PENDING_OTP')
       RETURNING id`,
      [testUserId, testSeatId]
    );
    const bookingId = bookingRes.rows[0].id;

    const otpHash = await bcrypt.hash(validOtp, 10);
    const validExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query(
      `INSERT INTO otp_verifications (booking_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [bookingId, otpHash, validExpiry]
    );

    // Submit wrong OTP
    const response = await request(app)
      .post('/api/bookings/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ bookingId, otp: '000000' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid OTP');

    // Assert DB state: booking is STILL PENDING_OTP
    const dbBooking = await pool.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
    expect(dbBooking.rows[0].status).toBe('PENDING_OTP');
  });

  it('should reject with 400 and release the seat to AVAILABLE when OTP is expired', async () => {
    // Reset seat to RESERVED
    await pool.query("UPDATE seats SET status = 'RESERVED' WHERE id = $1", [testSeatId]);

    const bookingRes = await pool.query(
      `INSERT INTO bookings (user_id, seat_id, status)
       VALUES ($1, $2, 'PENDING_OTP')
       RETURNING id`,
      [testUserId, testSeatId]
    );
    const bookingId = bookingRes.rows[0].id;

    // Save hashed OTP that expired 5 minutes ago!
    const otpHash = await bcrypt.hash(validOtp, 10);
    const expiredDate = new Date(Date.now() - 5 * 60 * 1000);
    await pool.query(
      `INSERT INTO otp_verifications (booking_id, otp_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [bookingId, otpHash, expiredDate]
    );

    // Submit OTP for expired reservation
    const response = await request(app)
      .post('/api/bookings/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ bookingId, otp: validOtp });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('OTP has expired. Your reservation was cancelled.');

    // Assert DB state: booking is marked FAILED and seat is freed back to AVAILABLE!
    const dbBooking = await pool.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
    expect(dbBooking.rows[0].status).toBe('FAILED');

    const dbSeat = await pool.query('SELECT status FROM seats WHERE id = $1', [testSeatId]);
    expect(dbSeat.rows[0].status).toBe('AVAILABLE');
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/bookings/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('bookingId and otp are required');
  });
});
