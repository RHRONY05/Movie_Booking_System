import { Router } from 'express';
import { initiateBooking, verifyOtp } from '../controllers/bookingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/bookings/initiate
router.post('/initiate', authMiddleware, initiateBooking);

// POST /api/bookings/verify
router.post('/verify', authMiddleware, verifyOtp);

export default router;
