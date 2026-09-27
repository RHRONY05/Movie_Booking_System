import React from 'react';

export const CineLogo = ({ size = 32, withText = false, className = '' }) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        userSelect: 'none',
      }}
    >
      {/* SVG Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: 'drop-shadow(0 0 10px rgba(192, 132, 252, 0.4))',
          transition: 'transform var(--transition-fast)',
        }}
      >
        <defs>
          <linearGradient id="cr-amethyst-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
          <linearGradient id="cr-teal-comp" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <radialGradient id="cr-glow-comp" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#11091f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="32" cy="32" r="30" fill="url(#cr-glow-comp)" />

        {/* Outer Shield Frame */}
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="14"
          fill="#170c29"
          stroke="url(#cr-amethyst-comp)"
          strokeWidth="2"
          strokeOpacity="0.75"
        />

        {/* Geometric Hexagonal Aperture */}
        <path
          d="M32 14 L48 23.2 V40.8 L32 50 L16 40.8 V23.2 Z"
          fill="#1d1033"
          stroke="url(#cr-amethyst-comp)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Electric Teal Projector Beam */}
        <path
          d="M32 14 L48 23.2 L32 32 L16 23.2 Z"
          fill="url(#cr-teal-comp)"
          fillOpacity="0.9"
        />

        {/* Amethyst Diagonal Shutter */}
        <path
          d="M32 32 L48 40.8 L32 50 Z"
          fill="url(#cr-amethyst-comp)"
          fillOpacity="0.8"
        />

        {/* Lens Core */}
        <circle cx="32" cy="32" r="5" fill="#f8f4ff" />
        <circle
          cx="32"
          cy="32"
          r="8"
          stroke="url(#cr-teal-comp)"
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Brand Typography */}
      {withText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
            }}
          >
            CINE<span style={{ color: 'var(--accent-primary)', textShadow: '0 0 16px rgba(192, 132, 252, 0.5)' }}>RESERVE</span>
          </span>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent-secondary)',
              marginTop: '2px',
            }}
          >
            Studio Premieres
          </span>
        </div>
      )}
    </div>
  );
};

export default CineLogo;
