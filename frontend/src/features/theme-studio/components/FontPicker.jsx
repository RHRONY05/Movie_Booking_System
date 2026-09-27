import React from 'react';
import { Type, Check } from 'lucide-react';
import { FONT_PAIRINGS } from '../fonts';

export const FontPicker = ({ selectedFontId, onSelectFont, activePaletteRoles }) => {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Type size={16} color={activePaletteRoles.accentPrimary} />
        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: activePaletteRoles.accentPrimary }}>
          Step 2: Choose Typography Pairing ({FONT_PAIRINGS.length} Independent Options)
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px'
      }}>
        {FONT_PAIRINGS.map(f => {
          const isActive = selectedFontId === f.id;

          return (
            <button
              key={f.id}
              onClick={() => onSelectFont(f.id)}
              style={{
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: isActive ? activePaletteRoles.bgCard : activePaletteRoles.bgSurface,
                border: isActive ? `2px solid ${activePaletteRoles.accentPrimary}` : `1px solid ${activePaletteRoles.borderSubtle}`,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxShadow: isActive ? `0 6px 20px ${activePaletteRoles.accentPrimary}33` : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: f.fontDisplay,
                  fontSize: f.id === 'bebas' ? '20px' : '16px',
                  color: activePaletteRoles.textPrimary,
                  fontWeight: 700
                }}>
                  {f.name.split('(')[0]}
                </span>
                {isActive && <Check size={16} color={activePaletteRoles.accentPrimary} />}
              </div>

              <span style={{ fontSize: '11px', color: activePaletteRoles.accentPrimary, fontWeight: 700 }}>
                {f.category}
              </span>

              <p style={{ fontSize: '12px', color: activePaletteRoles.textSecondary, margin: 0, lineHeight: 1.4 }}>
                {f.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
