import cron from 'node-cron';
import pool from '../config/db.js';
import logger from './logger.js';

export const startCronJobs = () => {
  // This cron expression '* * * * *' means "run every minute"
  cron.schedule('* * * * *', async () => {
    logger.info('[CRON] Scanning for abandoned bookings to free up seats...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // We look for any booking stuck in PENDING_OTP where the OTP has expired
      // We lock these rows with FOR UPDATE to prevent race conditions during cleanup
      const abandonedRes = await client.query(`
        SELECT b.id as booking_id, b.seat_id 
        FROM bookings b
        JOIN otp_verifications o ON b.id = o.booking_id
        WHERE b.status = 'PENDING_OTP' AND o.expires_at < NOW()
        FOR UPDATE
      `);
      
      if (abandonedRes.rows.length > 0) {
        logger.warn(`[CRON] Found ${abandonedRes.rows.length} abandoned booking(s). Releasing seats...`);
        
        for (const row of abandonedRes.rows) {
          // 1. Mark the booking as failed
          await client.query("UPDATE bookings SET status = 'FAILED' WHERE id = $1", [row.booking_id]);
          // 2. Free up the seat for other users!
          await client.query("UPDATE seats SET status = 'AVAILABLE' WHERE id = $1", [row.seat_id]);
        }
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('[CRON] Error during cleanup:', error);
    } finally {
      client.release();
    }
  });
  
  logger.info('Background Cron Jobs initialized successfully.');
};
