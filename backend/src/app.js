import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './utils/logger.js';
import healthRouter from './routes/health.js';

const app = express();

// Middleware
app.use(loggerMiddleware);
app.use(cors());
app.use(express.json());

// Routes
app.use('/', healthRouter);

export default app;
