import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('GET /api/bookings/my-bookings Endpoint', () => {
  let user1Token;
  let user1Id;
  let user2Id;
  let testMovieId;
  let seat1Id;
  let seat2Id;
  let booking1Id;
  let booking2Id;

  beforeAll(async () => {
    // 1. Create two test users
    const user1Res = await pool.query(
      `INSERT INTO users (google_id, email, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['google-my-bookings-u1', 'mybookings.user1@example.com', 'Booking User One']
    );
    user1Id = user1Res.rows[0].id;

    const user2Res = await pool.query(
      `INSERT INTO users (google_id, email, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ['google-my-bookings-u2', 'mybookings.user2@example.com', 'Booking User Two']
    );
    user2Id = user2Res.rows[0].id;

    // 2. Generate JWT for User 1
    user1Token = jwt.sign(
      { userId: user1Id, email: 'mybookings.user1@example.com' },
      process.env.JWT_SECRET || 'super_secret_jwt_key_for_development',
      { expiresIn: '1h' }
    );

    // 3. Create a test movie
    const movieRes = await pool.query(
      `INSERT INTO movies (title, poster_url, showtime)
       VALUES ($1, $2, NOW() + INTERVAL '3 days')
       RETURNING id`,
      ['My Bookings Feature Film', 'https://example.com/my-bookings.jpg']
    );
    testMovieId = movieRes.rows[0].id;

    // 4. Create seats
    const seat1Res = await pool.query(
      `INSERT INTO seats (movie_id, seat_number, status)
       VALUES ($1, $2, 'BOOKED')
       RETURNING id`,
      [testMovieId, 'B4']
    );
    seat1Id = seat1Res.rows[0].id;

    const seat2Res = await pool.query(
      `INSERT INTO seats (movie_id, seat_number, status)
       VALUES ($1, $2, 'BOOKED')
       RETURNING id`,
      [testMovieId, 'B5']
    );
    seat2Id = seat2Res.rows[0].id;

    // 5. Create a booking for User 1 and a booking for User 2
    const b1Res = await pool.query(
      `INSERT INTO bookings (user_id, seat_id, status)
       VALUES ($1, $2, 'CONFIRMED')
       RETURNING id`,
      [user1Id, seat1Id]
    );
    booking1Id = b1Res.rows[0].id;

    const b2Res = await pool.query(
      `INSERT INTO bookings (user_id, seat_id, status)
       VALUES ($1, $2, 'CONFIRMED')
       RETURNING id`,
      [user2Id, seat2Id]
    );
    booking2Id = b2Res.rows[0].id;
  });

  afterAll(async () => {
    // Clean up created records
    await pool.query('DELETE FROM bookings WHERE id IN ($1, $2)', [booking1Id, booking2Id]);
    await pool.query('DELETE FROM seats WHERE id IN ($1, $2)', [seat1Id, seat2Id]);
    await pool.query('DELETE FROM movies WHERE id = $1', [testMovieId]);
    await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [user1Id, user2Id]);
    await pool.end();
  });

  it('should return 401 Unauthorized if no Bearer token is provided', async () => {
    const response = await request(app).get('/api/bookings/my-bookings');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication required');
  });

  it('should return 200 OK with only bookings belonging to the authenticated user', async () => {
    const response = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Verify User 1's booking is present
    const user1Booking = response.body.find((b) => b.id === booking1Id);
    expect(user1Booking).toBeDefined();
    expect(user1Booking.status).toBe('CONFIRMED');
    expect(user1Booking.seat_number).toBe('B4');
    expect(user1Booking.movie_id).toBe(testMovieId);
    expect(user1Booking.movie_title).toBe('My Bookings Feature Film');
    expect(user1Booking.poster_url).toBe('https://example.com/my-bookings.jpg');
    expect(user1Booking.showtime).toBeDefined();

    // Verify User 2's booking is NOT returned (strict tenant data isolation)
    const user2Booking = response.body.find((b) => b.id === booking2Id);
    expect(user2Booking).toBeUndefined();
  });
});
