import express from 'express';
import cors from 'cors';
import { loggerMiddleware, responseBodyCapture } from './utils/logger.js';
import healthRouter from './routes/health.js';
import bookingRouter from './routes/bookings.js';
import authRouter from './routes/authRoutes.js';
import movieRouter from './routes/movieRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // 👈 MUST run first so the body is parsed
app.use(responseBodyCapture); // 👈 Captures res.send before it goes out
app.use(loggerMiddleware); // 👈 Now the logger can read req.raw.body and res.locals.responseBody

// Routes
app.use('/health', healthRouter);
app.use('/api/movies', movieRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/auth', authRouter);

export default app;
