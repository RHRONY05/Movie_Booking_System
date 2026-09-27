import React, { useState, useEffect, useMemo } from 'react';
import { HeroBanner } from '../components/movies/HeroBanner';
import { MovieCard } from '../components/movies/MovieCard';
import { moviesApi } from '../services/api';
import { Search, Film, RefreshCw, Sparkles, Filter, X } from 'lucide-react';

const REAL_CINEMA_CATALOG = [
  {
    id: 'movie-1',
    title: 'Blade Runner 2049',
    genre: 'Sci-Fi • Noir',
    duration: '2h 44m',
    rating: 8.9,
    director: 'Denis Villeneuve',
    backdrop_url: '/assets/banners/blade_runner_2049_hero.webp',
    poster_url: '/assets/posters/blade_runner_2049.webp',
    synopsis: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what is left of society into chaos.',
    showtimes: ['7:00 PM', '9:30 PM', '11:15 PM'],
    formats: ['IMAX 3D', 'Dolby Atmos'],
    category: 'Sci-Fi'
  },
  {
    id: 'movie-2',
    title: 'Dune: Part Two',
    genre: 'Epic Sci-Fi',
    duration: '2h 46m',
    rating: 8.8,
    director: 'Denis Villeneuve',
    poster_url: '/assets/posters/dune_part_two.webp',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    showtimes: ['5:30 PM', '8:45 PM'],
    formats: ['IMAX 70mm', 'Dolby Vision'],
    category: 'Sci-Fi'
  },
  {
    id: 'movie-3',
    title: 'The Batman',
    genre: 'Neo-Noir • Crime',
    duration: '2h 56m',
    rating: 8.6,
    director: 'Matt Reeves',
    poster_url: '/assets/posters/the_batman.webp',
    synopsis: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city’s hidden corruption.',
    showtimes: ['6:15 PM', '9:45 PM'],
    formats: ['Dolby Atmos', '4K Laser'],
    category: 'Noir / Crime'
  },
  {
    id: 'movie-4',
    title: 'Interstellar',
    genre: 'Sci-Fi • Adventure',
    duration: '2h 49m',
    rating: 8.9,
    director: 'Christopher Nolan',
    poster_url: '/assets/posters/interstellar.webp',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
    showtimes: ['4:00 PM', '7:30 PM', '10:45 PM'],
    formats: ['IMAX 70mm', 'Dolby Atmos'],
    category: 'Sci-Fi'
  },
  {
    id: 'movie-5',
    title: 'Oppenheimer',
    genre: 'Biographical • Drama',
    duration: '3h 00m',
    rating: 8.9,
    director: 'Christopher Nolan',
    poster_url: '/assets/posters/oppenheimer.webp',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    showtimes: ['6:00 PM', '9:30 PM'],
    formats: ['IMAX 70mm', 'Prestige Audio'],
    category: 'Drama'
  },
  {
    id: 'movie-6',
    title: 'Drive',
    genre: 'Neo-Noir • Thriller',
    duration: '1h 40m',
    rating: 8.4,
    director: 'Nicolas Winding Refn',
    poster_url: '/assets/posters/drive.webp',
    synopsis: 'A mysterious Hollywood action film stuntman and getaway driver gets in trouble with gangsters when he tries to help his neighbor’s husband.',
    showtimes: ['8:00 PM', '10:15 PM'],
    formats: ['4K Digital', 'Synthwave Audio'],
    category: 'Noir / Crime'
  },
  {
    id: 'movie-7',
    title: 'Inception',
    genre: 'Action • Sci-Fi',
    duration: '2h 28m',
    rating: 8.8,
    director: 'Christopher Nolan',
    poster_url: '/assets/posters/inception.webp',
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    showtimes: ['5:00 PM', '8:15 PM'],
    formats: ['IMAX 4K', 'Dolby Atmos'],
    category: 'Sci-Fi'
  },
  {
    id: 'movie-8',
    title: 'Cyberpunk: Edgerunners',
    genre: 'Action • Anime',
    duration: '2h 10m Special',
    rating: 8.7,
    director: 'Hiroyuki Imaishi',
    poster_url: '/assets/posters/cyberpunk_edgerunners.webp',
    synopsis: 'A street kid trying to survive in Night City, a technology and body modification-obsessed city of the future. He chooses to stay alive by becoming an edgerunner.',
    showtimes: ['7:15 PM', '9:45 PM'],
    formats: ['Laser Projection', 'Atmos Surround'],
    category: 'Sci-Fi'
  }
];

const GENRE_FILTERS = ['All', 'Sci-Fi', 'Noir / Crime', 'Drama', 'IMAX 70mm'];

export const LandingPage = ({ onSelectMovie }) => {
  const [movies, setMovies] = useState(REAL_CINEMA_CATALOG);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await moviesApi.getMovies();
      const moviesList = Array.isArray(response) ? response : (response?.data || []);
      
      if (moviesList.length > 0) {
        // Merge real database UUIDs and showtimes with our rich poster catalog
        const mergedCatalog = REAL_CINEMA_CATALOG.map((localMovie) => {
          const backendMovie = moviesList.find(
            (b) => b.title?.trim().toLowerCase() === localMovie.title?.trim().toLowerCase()
          );
          if (backendMovie) {
            return {
              ...localMovie,
              id: backendMovie.id, // Real database UUID from PostgreSQL
              dbId: backendMovie.id,
              showtime: backendMovie.showtime || localMovie.showtimes?.[0],
            };
          }
          return localMovie;
        });

        setMovies(mergedCatalog);
        setIsOffline(false);
      } else {
        setMovies(REAL_CINEMA_CATALOG);
        setIsOffline(false);
      }
    } catch (err) {
      console.warn('Backend server unreachable, displaying curated real movie catalog:', err.message);
      setMovies(REAL_CINEMA_CATALOG);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter & Search Logic
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = searchQuery.trim() === '' || 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre = selectedGenre === 'All' ||
        (selectedGenre === 'IMAX 70mm' ? (movie.formats && movie.formats.some(f => f.includes('70mm'))) : movie.category === selectedGenre);

      return matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  const featuredMovie = movies[0] || null;

  return (
    <div style={{ width: '100%', paddingBottom: 'var(--space-3xl)' }}>
      {/* 1. Full-bleed Widescreen Hero Section */}
      <HeroBanner movie={featuredMovie} onSelectMovie={onSelectMovie} />

      {/* 2. Main Content Container */}
      <div
        style={{
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto',
          padding: 'var(--space-2xl) var(--space-xl) var(--space-3xl) var(--space-xl)',
        }}
      >
        {/* Offline notice (styled with tokens) */}
        {isOffline && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-2xs) var(--space-md)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-state-error)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-xs)',
              marginBottom: 'var(--space-lg)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                boxShadow: '0 0 6px var(--accent-primary)',
              }}
            />
            <span>Curated Showcase Mode • Displaying {REAL_CINEMA_CATALOG.length} real studio premieres</span>
            <button
              onClick={fetchMovies}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                marginLeft: 'var(--space-xs)',
              }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        )}

        {/* 3. Catalog Header & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          {/* Title Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--accent-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Now Premiering In 70MM IMAX & DOLBY
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                Current Repertoire
              </h2>
            </div>

            {/* Live Search Input */}
            <div
              style={{
                position: 'relative',
                minWidth: '260px',
                maxWidth: '340px',
                width: '100%',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search films, directors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 38px',
                  backgroundColor: 'var(--bg-surface)',
                  border: 'var(--glass-border)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-body)',
                  outline: 'none',
                  transition: 'var(--transition-fast)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(192, 132, 252, 0.12)')}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Genre Filter Pills Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {GENRE_FILTERS.map((genre) => {
              const isActive = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    border: isActive ? '1px solid var(--accent-primary)' : 'var(--glass-border)',
                    color: isActive ? 'var(--btn-text)' : 'var(--text-secondary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {genre}
                </button>
              );
            })}

            <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Showing {filteredMovies.length} of {movies.length} Films
            </span>
          </div>
        </div>

        {/* 4. Responsive Movie Catalog Grid (4 cols desktop, 2 mobile) */}
        {filteredMovies.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: 'var(--space-xl)',
            }}
          >
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={(selected, time, day) => onSelectMovie && onSelectMovie(selected, time, day)}
              />
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div
            style={{
              padding: 'var(--space-3xl) var(--space-xl)',
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: 'var(--glass-border)',
              margin: 'var(--space-xl) 0',
            }}
          >
            <Film size={42} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }} />
            <h3
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-xs)',
              }}
            >
              No Premieres Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', maxWidth: '420px', margin: '0 auto var(--space-lg) auto' }}>
              We couldn't find any films matching "{searchQuery}" in {selectedGenre}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
              }}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--btn-primary)',
                color: 'var(--btn-text)',
                border: 'none',
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
