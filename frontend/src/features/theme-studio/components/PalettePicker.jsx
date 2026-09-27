import React from 'react';
import { Palette, Check } from 'lucide-react';
import { PALETTES } from '../palettes';

export const PalettePicker = ({ selectedPaletteId, onSelectPalette, activeAccent }) => {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Palette size={16} color={activeAccent} />
        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: activeAccent }}>
          Step 1: Choose Palette ({PALETTES.length} Curated Options)
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px'
      }}>
        {PALETTES.map(p => {
          const isActive = selectedPaletteId === p.id;
          const r = p.roles;

          return (
            <button
              key={p.id}
              onClick={() => onSelectPalette(p.id)}
              style={{
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: isActive ? r.bgCard : r.bgSurface,
                border: isActive ? `2px solid ${r.accentPrimary}` : `1px solid ${r.borderSubtle}`,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: isActive ? `0 6px 20px ${r.accentPrimary}33` : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: r.textPrimary }}>
                  {p.name}
                </span>
                {isActive && <Check size={16} color={r.accentPrimary} />}
              </div>

              {/* Multi-Swatch Preview Bar */}
              <div style={{
                display: 'flex',
                gap: '3px',
                width: '100%',
                height: '20px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div style={{ flex: 1.5, backgroundColor: r.bgCanvas }} title={`Canvas: ${r.bgCanvas}`} />
                <div style={{ flex: 1.2, backgroundColor: r.bgSurface }} title={`Surface: ${r.bgSurface}`} />
                <div style={{ flex: 1, backgroundColor: r.bgCard }} title={`Card: ${r.bgCard}`} />
                <div style={{ flex: 1, backgroundColor: r.accentPrimary }} title={`Accent: ${r.accentPrimary}`} />
                <div style={{ flex: 1, backgroundColor: r.accentSecondary }} title={`Secondary: ${r.accentSecondary}`} />
                <div style={{ flex: 1, backgroundColor: r.textPrimary }} title={`Text: ${r.textPrimary}`} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: r.accentPrimary, fontWeight: 700 }}>
                  {p.badge}
                </span>
                <span style={{ fontSize: '11px', color: r.textSecondary }}>
                  Base: {r.bgCanvas}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
