import express from 'express';
import { googleSignIn, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/google', googleSignIn);
router.get('/me', authMiddleware, getMe);

export default router;
