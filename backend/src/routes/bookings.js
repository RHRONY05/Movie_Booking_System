import { Router } from 'express';
import { initiateBooking } from '../controllers/bookingController.js';

const router = Router();

// POST /api/bookings/initiate
router.post('/initiate', initiateBooking);

export default router;
