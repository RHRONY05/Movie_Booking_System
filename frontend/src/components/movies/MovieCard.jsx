import React, { useState } from 'react';
import { Clock, Star, Calendar, Ticket, ChevronRight } from 'lucide-react';

export const MovieCard = ({ movie, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Interactive Day Toggle: 'Today' vs 'Tomorrow'
  const [selectedDay, setSelectedDay] = useState('Today');

  // Derive poster URL with fallback
  const posterSrc = movie?.poster_url || '/assets/posters/blade_runner_2049.webp';
  const formatBadge = Array.isArray(movie?.formats) ? movie.formats[0] : 'IMAX 70mm';

  // Realistic showtime schedule for Today & Tomorrow
  const todayShowtimes = Array.isArray(movie?.showtimes) && movie.showtimes.length > 0 
    ? movie.showtimes 
    : ['5:30 PM', '8:45 PM', '11:00 PM'];
  
  // Tomorrow has slightly offset times to feel like an authentic cinema schedule
  const tomorrowShowtimes = movie?.tomorrowShowtimes || ['4:15 PM', '7:30 PM', '10:15 PM'];
  const activeShowtimes = selectedDay === 'Today' ? todayShowtimes : tomorrowShowtimes;

  return (
    <div
      onClick={() => onSelect && onSelect(movie, activeShowtimes[0], selectedDay)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: isHovered ? '1px solid var(--border-focus)' : 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: isHovered ? 'var(--shadow-elevated), 0 0 24px rgba(192, 132, 252, 0.22)' : 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)',
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
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'opacity 300ms ease, transform 400ms ease',
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
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          {formatBadge}
        </div>

        {/* Rating Pill Overlay */}
        {movie?.rating && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-sm)',
              right: 'var(--space-sm)',
              backgroundColor: 'rgba(17, 9, 31, 0.85)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: 'var(--glass-border)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={12} fill="currentColor" />
            <span>{movie.rating}</span>
          </div>
        )}
      </div>

      {/* Movie Details Footer */}
      <div
        style={{
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: 'var(--space-sm)',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '4px',
              lineHeight: 1.3,
              letterSpacing: '0.02em',
            }}
          >
            {movie?.title || 'Untitled Film'}
          </h3>

          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            {movie?.genre || 'Sci-Fi • Noir'} {movie?.duration ? `• ${movie.duration}` : ''}
          </p>
        </div>

        {/* Dynamic Relative Scheduling Section: Interactive Today / Tomorrow */}
        <div
          style={{
            paddingTop: 'var(--space-sm)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Day Selector Segmented Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-full)',
                padding: '2px',
                border: 'var(--glass-border)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedDay('Today')}
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: selectedDay === 'Today' ? 'var(--accent-primary)' : 'transparent',
                  color: selectedDay === 'Today' ? 'var(--btn-text)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: selectedDay === 'Today' ? 'var(--font-weight-bold)' : 'normal',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'var(--transition-fast)',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: selectedDay === 'Today' ? 'var(--state-available)' : 'var(--text-muted)',
                  }}
                />
                Today
              </button>

              <button
                onClick={() => setSelectedDay('Tomorrow')}
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: selectedDay === 'Tomorrow' ? 'var(--accent-primary)' : 'transparent',
                  color: selectedDay === 'Tomorrow' ? 'var(--btn-text)' : 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: selectedDay === 'Tomorrow' ? 'var(--font-weight-bold)' : 'normal',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                Tomorrow
              </button>
            </div>

            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Showtimes
            </span>
          </div>

          {/* Showtime Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {activeShowtimes.map((time, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelect) onSelect(movie, time, selectedDay);
                }}
                style={{
                  padding: '5px 9px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-primary)',
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-bold)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--btn-text)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  e.currentTarget.style.color = 'var(--accent-primary)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {time}
              </button>
            ))}

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(movie, activeShowtimes[0], selectedDay);
              }}
              style={{
                marginLeft: 'auto',
                padding: '5px 12px',
                backgroundColor: isHovered ? 'var(--btn-primary)' : 'var(--bg-surface-elevated)',
                border: isHovered ? 'none' : 'var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: isHovered ? 'var(--btn-text)' : 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 'var(--font-weight-bold)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                transition: 'var(--transition-fast)',
              }}
            >
              <span>Book</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
