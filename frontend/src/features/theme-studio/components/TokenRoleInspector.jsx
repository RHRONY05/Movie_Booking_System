import React from 'react';
import { Layers, Shuffle, RotateCcw } from 'lucide-react';

export const TokenRoleInspector = ({ activeRoles, onShuffle, onReset, isShuffled }) => {
  const tokenDefinitions = [
    {
      roleName: 'Background Canvas',
      tokenKey: 'bgCanvas',
      roleType: '60% Dominant Base',
      color: activeRoles.bgCanvas,
      appliedTo: 'Page body, global canvas background, modal backdrop',
    },
    {
      roleName: 'Surface Container',
      tokenKey: 'bgSurface',
      roleType: '30% Structural Layer',
      color: activeRoles.bgSurface,
      appliedTo: 'Navigation bar, hero banner background, drawers, footer',
    },
    {
      roleName: 'Card Background',
      tokenKey: 'bgCard',
      roleType: 'Card Element',
      color: activeRoles.bgCard,
      appliedTo: 'Movie catalog cards, ticket pass containers, auth modal boxes',
    },
    {
      roleName: 'Card Hover State',
      tokenKey: 'bgCardHover',
      roleType: 'Interaction Layer',
      color: activeRoles.bgCardHover,
      appliedTo: 'Elevated movie card on mouse hover, dropdown menu items',
    },
    {
      roleName: 'Primary CTA Button',
      tokenKey: 'btnPrimary',
      roleType: '10% High-Impact Action',
      color: activeRoles.btnPrimary,
      appliedTo: 'Reserve Seats button, Verify OTP button, Sign In CTA',
    },
    {
      roleName: 'Button Hover State',
      tokenKey: 'btnHover',
      roleType: 'Hover Feedback',
      color: activeRoles.btnHover,
      appliedTo: 'Primary CTA button hover & active press states',
    },
    {
      roleName: 'Button Text',
      tokenKey: 'btnText',
      roleType: 'Contrast Text',
      color: activeRoles.btnText,
      appliedTo: 'Label text inside primary buttons (guarantees WCAG 4.5:1 contrast)',
    },
    {
      roleName: 'Primary Brand Accent',
      tokenKey: 'accentPrimary',
      roleType: 'Visual Anchor',
      color: activeRoles.accentPrimary,
      appliedTo: 'Selected seat highlight, star rating stars, key badges',
    },
    {
      roleName: 'Secondary Accent',
      tokenKey: 'accentSecondary',
      roleType: 'Supporting Signal',
      color: activeRoles.accentSecondary,
      appliedTo: 'Format tags (35mm / IMAX), showtime pills, auxiliary badges',
    },
    {
      roleName: 'Subtle Border',
      tokenKey: 'borderSubtle',
      roleType: 'Boundary Definition',
      color: activeRoles.borderSubtle,
      appliedTo: 'Card borders, hair-line horizontal rules, table dividers',
    },
    {
      roleName: 'Primary Headline Text',
      tokenKey: 'textPrimary',
      roleType: 'High-Emphasis Text',
      color: activeRoles.textPrimary,
      appliedTo: 'Movie titles, modal headings, auditorium hall names',
    },
    {
      roleName: 'Secondary Body Text',
      tokenKey: 'textSecondary',
      roleType: 'Medium-Emphasis Text',
      color: activeRoles.textSecondary,
      appliedTo: 'Movie synopsis, directors, release dates, runtime metadata',
    },
  ];

  return (
    <div style={{
      backgroundColor: activeRoles.bgSurface,
      border: `1px solid ${activeRoles.borderSubtle}`,
      borderRadius: '12px',
      padding: '24px 28px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
      marginBottom: '32px'
    }}>
      {/* Header with Title and Shuffle Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
        borderBottom: `1px solid ${activeRoles.borderSubtle}`,
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: activeRoles.accentPrimary, marginBottom: '4px' }}>
            <Layers size={14} />
            <span>Design Tokens Architecture (Semantic Role Mapping)</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: activeRoles.textPrimary, margin: 0 }}>
            What Color Goes Where? (Pre-Code Blueprint)
          </h2>
          <p style={{ fontSize: '13px', color: activeRoles.textSecondary, marginTop: '4px', margin: 0 }}>
            In industry design systems, colors are never hardcoded by hex. They are mapped to <strong>semantic roles</strong>.
          </p>
        </div>

        {/* Shuffle Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onShuffle}
            title="Swap which colors are assigned to buttons, accents, and surfaces"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: isShuffled ? activeRoles.accentPrimary : 'rgba(255, 255, 255, 0.08)',
              color: isShuffled ? activeRoles.btnText : activeRoles.textPrimary,
              border: `1px solid ${activeRoles.accentPrimary}`,
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isShuffled ? `0 4px 15px ${activeRoles.accentPrimary}44` : 'none'
            }}
          >
            <Shuffle size={15} />
            <span>Shuffle Roles {isShuffled ? '(Active)' : ''}</span>
          </button>

          {isShuffled && (
            <button
              onClick={onReset}
              title="Reset roles to the designer's default mapping"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: activeRoles.textSecondary,
                border: `1px solid ${activeRoles.borderSubtle}`,
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Semantic Token Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px'
      }}>
        {tokenDefinitions.map((token, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: activeRoles.bgCanvas,
              border: `1px solid ${activeRoles.borderSubtle}`,
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'transform 0.15s ease'
            }}
          >
            {/* Color Swatch Box */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '6px',
              backgroundColor: token.color,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              flexShrink: 0
            }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: activeRoles.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {token.roleName}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: activeRoles.accentPrimary, fontWeight: 700 }}>
                  {token.color.startsWith('rgba') ? 'RGBA' : token.color}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: activeRoles.accentSecondary, fontWeight: 600, marginTop: '2px' }}>
                {token.roleType}
              </div>

              <div style={{ fontSize: '11px', color: activeRoles.textSecondary, marginTop: '2px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={token.appliedTo}>
                {token.appliedTo}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
