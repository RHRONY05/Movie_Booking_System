import { Router } from 'express';
import { getMovies, getMovieSeats } from '../controllers/movieController.js';

const router = Router();

// GET /api/movies
router.get('/', getMovies);

// GET /api/movies/:id/seats
router.get('/:id/seats', getMovieSeats);

export default router;
