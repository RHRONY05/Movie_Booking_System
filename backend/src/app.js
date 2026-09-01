import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './utils/logger.js';
import healthRouter from './routes/health.js';
import bookingRouter from './routes/bookings.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // 👈 MUST run first so the body is parsed
app.use(loggerMiddleware); // 👈 Now the logger can read req.raw.body

// Routes
app.use('/health', healthRouter);
app.use('/api/bookings', bookingRouter);

export default app;
