import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { PALETTES } from '../features/theme-studio/palettes';
import { FONT_PAIRINGS } from '../features/theme-studio/fonts';
import { TokenRoleInspector } from '../features/theme-studio/components/TokenRoleInspector';
import { PalettePicker } from '../features/theme-studio/components/PalettePicker';
import { FontPicker } from '../features/theme-studio/components/FontPicker';
import { AccessibilityDashboard } from '../features/theme-studio/components/AccessibilityDashboard';
import { LivePreviewSection } from '../features/theme-studio/components/LivePreviewSection';

export const ThemeShowcasePage = () => {
  const [selectedPaletteId, setSelectedPaletteId] = useState('sapphire-champagne');
  const [selectedFontId, setSelectedFontId] = useState('cinzel');
  const [shuffledRoles, setShuffledRoles] = useState(null);
  const [shuffleIndex, setShuffleIndex] = useState(0);

  // Find active palette and font pairing objects
  const activePalette = PALETTES.find(p => p.id === selectedPaletteId) || PALETTES[0];
  const activeFont = FONT_PAIRINGS.find(f => f.id === selectedFontId) || FONT_PAIRINGS[0];

  // Active roles: either custom shuffled or default palette roles
  const activeRoles = shuffledRoles || activePalette.roles;

  // When user picks a new palette, reset custom shuffle
  const handleSelectPalette = (paletteId) => {
    setSelectedPaletteId(paletteId);
    setShuffledRoles(null);
    setShuffleIndex(0);
  };

  // Shuffle option: interchanging color roles within the same palette!
  const handleShuffle = () => {
    const base = activePalette.roles;
    const nextIdx = (shuffleIndex + 1) % 3;
    setShuffleIndex(nextIdx);

    if (nextIdx === 1) {
      // Variation 1: Invert primary accent with secondary accent (e.g. Blue button instead of Gold)
      setShuffledRoles({
        ...base,
        accentPrimary: base.accentSecondary,
        accentSecondary: base.accentPrimary,
        btnPrimary: base.accentSecondary,
        btnHover: base.accentPrimary,
        btnText: '#ffffff',
        borderActive: base.accentSecondary,
        seatSelected: base.accentSecondary,
        screenArc: base.accentSecondary
      });
    } else if (nextIdx === 2) {
      // Variation 2: Invert depth hierarchy (Elevated card becomes background canvas, canvas becomes card)
      setShuffledRoles({
        ...base,
        bgCanvas: base.bgCard,
        bgSurface: base.bgSurfaceElevated || base.bgSurface,
        bgCard: base.bgCanvas,
        bgCardHover: base.bgSurface,
        btnPrimary: base.accentPrimary,
        btnHover: base.accentSecondary,
      });
    } else {
      // Reset back to original
      setShuffledRoles(null);
    }
  };

  const handleResetShuffle = () => {
    setShuffledRoles(null);
    setShuffleIndex(0);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: activeRoles.bgCanvas,
      color: activeRoles.textPrimary,
      fontFamily: activeFont.fontBody,
      transition: 'background-color 0.25s ease, color 0.25s ease',
      paddingBottom: '80px'
    }}>
      
      {/* Top Banner Studio Header */}
      <div style={{
        backgroundColor: activeRoles.bgSurface,
        borderBottom: `1px solid ${activeRoles.borderSubtle}`,
        padding: '32px 24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            backgroundColor: `${activeRoles.accentPrimary}22`,
            border: `1px solid ${activeRoles.accentPrimary}55`,
            color: activeRoles.accentPrimary,
            fontSize: '12px',
            fontWeight: 800,
            marginBottom: '14px'
          }}>
            <Sliders size={14} />
            <span>Interactive Design System & Token Studio</span>
          </div>

          <h1 style={{
            fontFamily: activeFont.fontDisplay,
            fontSize: activeFont.id === 'bebas' ? '42px' : '32px',
            fontWeight: 800,
            color: activeRoles.textPrimary,
            margin: '0 0 8px 0'
          }}>
            CineReserve Design System Lab
          </h1>

          <p style={{
            color: activeRoles.textSecondary,
            fontSize: '15px',
            maxWidth: '820px',
            lineHeight: 1.6,
            margin: '0 0 28px 0'
          }}>
            Learn how modern digital design systems work before writing code. Select a rich, non-black color palette, test independent typography pairings, inspect how each color is mapped to UI roles, or click <strong>Shuffle Roles</strong> to see how interchanging colors transforms the exact same palette.
          </p>

          {/* 1. Palette Picker */}
          <PalettePicker
            selectedPaletteId={selectedPaletteId}
            onSelectPalette={handleSelectPalette}
            activeAccent={activeRoles.accentPrimary}
          />

          {/* 2. Font Pairing Picker */}
          <FontPicker
            selectedFontId={selectedFontId}
            onSelectFont={setSelectedFontId}
            activePaletteRoles={activeRoles}
          />

        </div>
      </div>

      {/* Main Studio Content Area */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px' }}>
        
        {/* 3. Semantic Token Role Inspector (Pre-Code Blueprint) */}
        <TokenRoleInspector
          activeRoles={activeRoles}
          onShuffle={handleShuffle}
          onReset={handleResetShuffle}
          isShuffled={Boolean(shuffledRoles)}
        />

        {/* 4. Panel 2: Accessibility & Contrast Dashboard */}
        <AccessibilityDashboard activeRoles={activeRoles} />

        {/* 5. Live Rendered Components Preview */}
        <LivePreviewSection
          roles={activeRoles}
          fonts={activeFont}
          paletteName={activePalette.name}
          isShuffled={Boolean(shuffledRoles)}
        />

      </div>

    </div>
  );
};

export default ThemeShowcasePage;
