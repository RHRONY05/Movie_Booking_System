import React, { useState } from 'react';
import { Clock, Star, Sparkles, Film } from 'lucide-react';

export const MovieCard = ({ movie, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Derive poster URL with fallback
  const posterSrc = movie?.poster_url || '/assets/posters/neon_ascension.jpg';

  return (
    <div
      onClick={() => onSelect && onSelect(movie)}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'var(--transition-normal)',
      }}
    >
      {/* 2:3 Poster Container with Skeleton Shimmer */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          backgroundColor: 'var(--bg-surface-elevated)',
          overflow: 'hidden',
        }}
      >
        {!imageLoaded && (
          <div
            className="skeleton-shimmer"
            style={{
              position: 'absolute',
              inset: 0,
            }}
          />
        )}

        <img
          src={posterSrc}
          alt={`Cinema poster for ${movie?.title || 'Movie'}`}
          onLoad={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity var(--transition-normal)',
          }}
        />

        {/* Format Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-sm)',
            left: 'var(--space-sm)',
            backgroundColor: 'var(--bg-surface-glass)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: 'var(--glass-border)',
            padding: 'var(--space-2xs) var(--space-xs)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          IMAX 4K
        </div>
      </div>

      {/* Movie Details Footer */}
      <div
        style={{
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2xs)',
              lineHeight: 1.2,
            }}
          >
            {movie?.title || 'Untitled Film'}
          </h3>

          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-md)',
            }}
          >
            Sci-Fi • Action • Thriller
          </p>
        </div>

        {/* Showtime pill & CTA button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-sm)',
            borderTop: 'var(--glass-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2xs)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--accent-secondary)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            <Clock size={14} />
            <span>7:00 PM</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(movie);
            }}
            style={{
              padding: 'var(--space-xs) var(--space-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: 'var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              transition: 'var(--transition-fast)',
            }}
          >
            Select Seats
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
