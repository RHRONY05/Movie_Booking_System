import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// CineReserve Featured Movie Catalog
const movies = [
  {
    title: 'Neon Ascension',
    poster_url: '/assets/posters/neon_ascension.jpg',
    showtime: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    title: 'The Elysium Gate',
    poster_url: '/assets/posters/elysium_gate.jpg',
    showtime: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    title: 'Midnight Protocol',
    poster_url: '/assets/posters/midnight_protocol.jpg',
    showtime: new Date(Date.now() + 259200000).toISOString(),
  },
  {
    title: 'Stellar Echoes',
    poster_url: '/assets/posters/stellar_echoes.jpg',
    showtime: new Date(Date.now() + 345600000).toISOString(),
  },
];

// Auditorium Layout: Rows A to F, 10 seats per row (60 total per movie)
const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
const seatsPerRow = 10;

async function seed() {
  console.log('🌱 Starting realistic database seed...');
  try {
    // 1. Clear existing data (Order matters due to foreign keys!)
    await pool.query('DELETE FROM otp_verifications');
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM seats');
    await pool.query('DELETE FROM movies');

    // 2. Insert Movies and their Seats
    for (const movie of movies) {
      const movieResult = await pool.query(
        `INSERT INTO movies (title, poster_url, showtime) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [movie.title, movie.poster_url, movie.showtime]
      );
      const movieId = movieResult.rows[0].id;
      console.log(`🎬 Inserted movie: ${movie.title} (ID: ${movieId})`);

      // 3. Generate 60 seats for this movie with PostgreSQL UUIDs
      let seatCount = 0;
      for (const row of rows) {
        for (let i = 1; i <= seatsPerRow; i++) {
          const seatNumber = `${row}${i}`;
          await pool.query(
            `INSERT INTO seats (movie_id, seat_number, status) 
             VALUES ($1, $2, 'AVAILABLE')`,
            [movieId, seatNumber]
          );
          seatCount++;
        }
      }
      console.log(`💺 Generated ${seatCount} seats for ${movie.title}.`);
    }

    console.log('✅ Seeding completed successfully! All movies & seats have valid PostgreSQL UUIDs.');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();
