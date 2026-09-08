import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString =
  process.env.NODE_ENV === 'test'
    ? (process.env.TEST_DATABASE_URL || 'postgres://admin:password123@localhost:5432/movie_booking_test')
    : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

export default pool;
