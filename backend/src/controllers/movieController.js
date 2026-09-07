import pool from '../config/db.js';

/**
 * Fetch all available movies
 * GET /api/movies
 */
export const getMovies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY title ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    if (req.log) {
      req.log.error({ err: error }, 'Get Movies Error');
    }
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

/**
 * Fetch all seats and availability for a specific movie
 * GET /api/movies/:id/seats
 */
export const getMovieSeats = async (req, res) => {
  const { id } = req.params;

  // Validate UUID format to prevent database 22P02 errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: 'Invalid movie ID format' });
  }

  try {
    const result = await pool.query(
      'SELECT id, movie_id, seat_number, status FROM seats WHERE movie_id = $1 ORDER BY seat_number ASC',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No seats found for this movie' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    if (req.log) {
      req.log.error({ err: error }, 'Get Movie Seats Error');
    }
    res.status(500).json({ error: 'Failed to fetch seat layout' });
  }
};

