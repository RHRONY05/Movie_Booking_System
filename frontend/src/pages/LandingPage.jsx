import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/movies/HeroBanner';
import { MovieCard } from '../components/movies/MovieCard';
import { moviesApi } from '../services/api';
import { ChevronRight } from 'lucide-react';

const DEFAULT_MOVIES = [
  {
    id: 'movie-1',
    title: 'Neon Ascension',
    poster_url: '/assets/posters/neon_ascension.jpg',
    showtime: '2026-09-06T19:00:00Z',
  },
  {
    id: 'movie-2',
    title: 'The Elysium Gate',
    poster_url: '/assets/posters/elysium_gate.jpg',
    showtime: '2026-09-06T20:30:00Z',
  },
  {
    id: 'movie-3',
    title: 'Midnight Protocol',
    poster_url: '/assets/posters/midnight_protocol.jpg',
    showtime: '2026-09-06T21:45:00Z',
  },
  {
    id: 'movie-4',
    title: 'Stellar Echoes',
    poster_url: '/assets/posters/stellar_echoes.jpg',
    showtime: '2026-09-06T22:15:00Z',
  },
];

export const LandingPage = ({ onSelectMovie }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await moviesApi.getMovies();
        const moviesList = Array.isArray(response) ? response : (response?.data || []);
        if (moviesList.length > 0) {
          setMovies(moviesList);
        }
      } catch (err) {
        console.error('Failed to load movie catalog from API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const featuredMovie = movies[0] || null;


  return (
    <div style={{ width: '100%' }}>
      {/* Full-bleed Widescreen Hero Section */}
      <HeroBanner movie={featuredMovie} onSelectMovie={onSelectMovie} />

      {/* Movie Catalog Grid Section */}
      <div
        style={{
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto',
          padding: 'var(--space-xl) var(--space-xl) var(--space-3xl) var(--space-xl)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Now Showing
          </h2>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2xs)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span>VIEW ALL</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Responsive Movie Catalog Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 'var(--space-lg)',
          }}
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelect={(selected) => onSelectMovie && onSelectMovie(selected)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
