import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('Movies & Seats API Endpoints', () => {
  let testMovieId;
  let testSeatId;

  beforeAll(async () => {
    // 1. Create a test movie
    const movieRes = await pool.query(
      `INSERT INTO movies (title, poster_url, showtime)
       VALUES ($1, $2, NOW() + INTERVAL '2 days')
       RETURNING id`,
      ['Test Movie Endpoint Special', 'https://example.com/test-poster.jpg']
    );
    testMovieId = movieRes.rows[0].id;

    // 2. Create test seats for this movie
    const seatRes = await pool.query(
      `INSERT INTO seats (movie_id, seat_number, status)
       VALUES ($1, $2, 'AVAILABLE')
       RETURNING id`,
      [testMovieId, 'A1']
    );
    testSeatId = seatRes.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test records and close DB connection
    if (testSeatId) {
      await pool.query('DELETE FROM seats WHERE id = $1', [testSeatId]);
    }
    if (testMovieId) {
      await pool.query('DELETE FROM movies WHERE id = $1', [testMovieId]);
    }
    await pool.end();
  });

  describe('GET /api/movies', () => {
    it('should return 200 OK with a list of all movies', async () => {
      const response = await request(app).get('/api/movies');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify structure of movie object
      const movie = response.body.find((m) => m.id === testMovieId);
      expect(movie).toBeDefined();
      expect(movie.title).toBe('Test Movie Endpoint Special');
      expect(movie.poster_url).toBe('https://example.com/test-poster.jpg');
      expect(movie.showtime).toBeDefined();
    });
  });

  describe('GET /api/movies/:id/seats', () => {
    it('should return 200 OK with the seat layout for a valid movie ID', async () => {
      const response = await request(app).get(`/api/movies/${testMovieId}/seats`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const seat = response.body.find((s) => s.id === testSeatId);
      expect(seat).toBeDefined();
      expect(seat.seat_number).toBe('A1');
      expect(seat.status).toBe('AVAILABLE');
      expect(seat.movie_id).toBe(testMovieId);
    });

    it('should return 400 Bad Request when an invalid UUID format is provided', async () => {
      const response = await request(app).get('/api/movies/invalid-uuid-1234/seats');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid movie ID format');
    });

    it('should return 404 Not Found when no seats exist for a valid but non-existent movie UUID', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      const response = await request(app).get(`/api/movies/${nonExistentUuid}/seats`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No seats found for this movie');
    });
  });
});
