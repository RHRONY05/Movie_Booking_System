import 'dotenv/config';
import app from './app.js';
import { startCronJobs } from './utils/cronJobs.js';
import pool from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// 1. First, attempt to connect to the database
pool.query('SELECT NOW()')
  .then(() => {
    logger.info('Database connected successfully.');

    // 2. Only start the server if the database is up
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      
      // 3. Start the background jobs
      startCronJobs();
    });
  })
  .catch((err) => {
    // If the database is down, log the error and aggressively crash the server.
    logger.fatal('Failed to connect to the database. Crashing server...', err);
    process.exit(1); 
  });
