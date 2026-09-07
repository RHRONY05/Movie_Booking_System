import { Router } from 'express';
import { initiateBooking, verifyOtp, getMyBookings } from '../controllers/bookingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/bookings/my-bookings
router.get('/my-bookings', authMiddleware, getMyBookings);

// POST /api/bookings/initiate
router.post('/initiate', authMiddleware, initiateBooking);

// POST /api/bookings/verify
router.post('/verify', authMiddleware, verifyOtp);

export default router;

