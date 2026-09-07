import React from 'react';
import { Ticket, Clock } from 'lucide-react';

export const HeroBanner = ({ movie, onSelectMovie }) => {
  if (!movie) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '580px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: "url('/assets/banners/neon_ascension_hero.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        marginTop: '-1px',
      }}
    >
      {/* Left Dark Gradient Vignette for Text Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0.75) 35%, rgba(9, 13, 22, 0.2) 75%, transparent 100%)',
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
          height: '120px',
          background: 'linear-gradient(180deg, rgba(9, 13, 22, 0.8) 0%, transparent 100%)',
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
          height: '180px',
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
        <div style={{ maxWidth: '640px' }}>
          {/* Format Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              marginBottom: 'var(--space-md)',
            }}
          >
            <span
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
              IMAX 3D
            </span>
            <span
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
              SCI-FI THRILLER
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 'var(--font-size-hero)',
              fontWeight: 'var(--font-weight-black)',
              lineHeight: 1.05,
              marginBottom: 'var(--space-md)',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {movie.title || 'NEON ASCENSION'}
          </h1>

          {/* Synopsis */}
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-xl)',
            }}
          >
            In a city where memories are traded like currency, a rogue archivist uncovers a secret that could shatter the fragile reality of the neon metropolis. Experience the ultimate cinematic immersion.
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
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-black)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: 'var(--shadow-glow-red)',
                transition: 'var(--transition-fast)',
              }}
            >
              <Ticket size={18} />
              <span>BOOK TICKETS</span>
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
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <Clock size={16} />
                <span>7:00 PM</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span>9:30 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
