import React from 'react';

export const ScreenVisualizer = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto var(--space-2xl) auto',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Curved Glowing IMAX Screen SVG */}
      <svg
        viewBox="0 0 800 90"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(0 0 20px var(--accent-secondary-glow))',
        }}
      >
        <defs>
          <linearGradient id="screenGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.1" />
            <stop offset="30%" stopColor="var(--accent-secondary)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--text-primary)" stopOpacity="1" />
            <stop offset="70%" stopColor="var(--accent-secondary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.1" />
          </linearGradient>

          <radialGradient id="ambientFloor" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Floor Light Projection */}
        <ellipse cx="400" cy="50" rx="360" ry="35" fill="url(#ambientFloor)" />

        {/* Curved Screen Arc */}
        <path
          d="M 50 70 Q 400 10 750 70"
          fill="none"
          stroke="url(#screenGlow)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <span
        style={{
          display: 'inline-block',
          marginTop: 'var(--space-2xs)',
          fontSize: 'var(--font-size-xs)',
          letterSpacing: '0.2em',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        IMAX Curved Laser Screen
      </span>
    </div>
  );
};

export default ScreenVisualizer;
