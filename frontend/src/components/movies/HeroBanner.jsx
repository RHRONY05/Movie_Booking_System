import React from 'react';
import { Ticket, Clock, Star, Film, Sparkles } from 'lucide-react';

export const HeroBanner = ({ movie, onSelectMovie }) => {
  if (!movie) return null;

  const bgImage = movie.backdrop_url || '/assets/banners/blade_runner_2049_hero.webp';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%',
        marginTop: '-1px',
      }}
    >
      {/* Left Dark Gradient Vignette for Text Readability - calibrated to #11091f */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(17, 9, 31, 0.96) 0%, rgba(17, 9, 31, 0.85) 42%, rgba(17, 9, 31, 0.3) 75%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Subtle Gradient from Navbar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(180deg, rgba(17, 9, 31, 0.85) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Seamless Bottom Gradient Fade into Page Canvas */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(180deg, transparent 0%, var(--bg-canvas) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content Container aligned with site grid */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 'var(--container-max-width)',
          width: '100%',
          margin: '0 auto',
          padding: 'var(--space-3xl) var(--space-xl)',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          {/* Format & Genre Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              marginBottom: 'var(--space-md)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: 'var(--space-2xs) var(--space-sm)',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(192, 132, 252, 0.15)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent-primary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                letterSpacing: '0.05em',
              }}
            >
              <Sparkles size={13} />
              FEATURED PREMIERE
            </span>

            {movie.formats && movie.formats.map((fmt, idx) => (
              <span
                key={idx}
                style={{
                  padding: 'var(--space-2xs) var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-glass)',
                  border: 'var(--glass-border)',
                  color: 'var(--text-secondary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                  letterSpacing: '0.05em',
                }}
              >
                {fmt}
              </span>
            ))}

            {movie.rating && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 'var(--space-2xs) var(--space-sm)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-glass)',
                  border: 'var(--glass-border)',
                  color: 'var(--accent-gold)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                <Star size={13} fill="currentColor" />
                {movie.rating}
              </span>
            )}
          </div>

          {/* Title in Cinzel Display Typography */}
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 'var(--space-md)',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
            }}
          >
            {movie.title || 'BLADE RUNNER 2049'}
          </h1>

          {/* Metadata Subtitle */}
          {movie.director && (
            <p
              style={{
                color: 'var(--accent-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-sm)',
              }}
            >
              DIRECTED BY {movie.director.toUpperCase()} {movie.duration ? `• ${movie.duration}` : ''}
            </p>
          )}

          {/* Synopsis */}
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.7,
              marginBottom: 'var(--space-xl)',
              maxWidth: '600px',
            }}
          >
            {movie.synopsis ||
              'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what is left of society into chaos.'}
          </p>

          {/* CTA & Showtimes Buttons Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => onSelectMovie && onSelectMovie(movie)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-md) var(--space-xl)',
                backgroundColor: 'var(--btn-primary)',
                color: 'var(--btn-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxShadow: 'var(--shadow-glow-amethyst)',
                cursor: 'pointer',
                border: 'none',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--btn-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--btn-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Ticket size={18} />
              <span>RESERVE SEATS</span>
            </button>

            {/* Showtimes Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                backgroundColor: 'var(--bg-surface-glass)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: 'var(--glass-border)',
                padding: 'var(--space-sm) var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <Clock size={15} color="var(--accent-secondary)" />
                <span>Showtimes:</span>
              </div>
              {(movie.showtimes || ['7:00 PM', '9:30 PM']).map((time, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span style={{ color: 'var(--text-muted)' }}>•</span>}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {time}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
