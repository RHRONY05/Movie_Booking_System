// =============================================================================
// CineReserve Design System - Semantic Color Palettes
// Inspired by Color Hunt, Criterion Channel, A24, and Modern Cinema Palettes
// =============================================================================

export const PALETTES = [
  {
    id: 'sapphire-champagne',
    name: 'Midnight Sapphire & Champagne',
    badge: 'Popular on Color Hunt #1',
    description: 'Deep royal navy canvas with steel blue structural layers and warm champagne gold CTA buttons.',
    // Semantic Role Mapping
    roles: {
      bgCanvas: '#0b132b',        // 60% Page Background
      bgSurface: '#141e3d',       // 30% Navigation & Containers
      bgCard: '#1a274e',          // Cards & Modals
      bgCardHover: '#233464',     // Card Hover State
      textPrimary: '#faf8f5',     // Headings & Titles (Ivory)
      textSecondary: '#a2b2d9',   // Subtitles & Body (Pale Slate)
      accentPrimary: '#d4af37',   // 10% Main Focal Accent (Champagne Gold)
      btnPrimary: '#d4af37',      // Primary Action Button Background
      btnHover: '#e8c558',        // Button Hover State
      btnText: '#0b132b',         // High-Contrast Text on Primary Button
      accentSecondary: '#4f74b8', // Secondary Badge / Subtle Highlight (Steel Blue)
      borderSubtle: 'rgba(79, 116, 184, 0.25)', // Card Borders & Dividers
      borderFocus: '#d4af37',     // Selected / Focus Ring
      seatAvailable: '#1e2c54',
      seatSelected: '#d4af37',
      seatReserved: '#4a3818',
      seatBooked: '#0e152d',
      screenArc: 'rgba(212, 175, 55, 0.85)'
    }
  },
  {
    id: 'burgundy-rose',
    name: 'Velvet Burgundy & Rose Gold',
    badge: 'Opulent Theater & Film Palace',
    description: 'Deep black cherry wine canvas with royal plum surfaces and radiant crimson rose gold CTA buttons.',
    roles: {
      bgCanvas: '#1a0914',
      bgSurface: '#2b1022',
      bgCard: '#3b162f',
      bgCardHover: '#4e1d3e',
      textPrimary: '#fdf6f7',
      textSecondary: '#c8a4b2',
      accentPrimary: '#e11d48',
      btnPrimary: '#e11d48',
      btnHover: '#f43f5e',
      btnText: '#ffffff',
      accentSecondary: '#e5a93c',
      borderSubtle: 'rgba(225, 29, 72, 0.25)',
      borderFocus: '#e11d48',
      seatAvailable: '#38162d',
      seatSelected: '#e11d48',
      seatReserved: '#541c2c',
      seatBooked: '#1e0c18',
      screenArc: 'rgba(225, 29, 72, 0.85)'
    }
  },
  {
    id: 'nordic-emerald',
    name: 'Nordic Pine & Warm Amber',
    badge: 'A24 / Scandinavian Indie',
    description: 'Deep alpine spruce canvas with hunter pine cards and luminous golden amber action buttons.',
    roles: {
      bgCanvas: '#081412',
      bgSurface: '#102420',
      bgCard: '#17332d',
      bgCardHover: '#20453d',
      textPrimary: '#f3f8f5',
      textSecondary: '#99b8ae',
      accentPrimary: '#f59e0b',
      btnPrimary: '#f59e0b',
      btnHover: '#fbbf24',
      btnText: '#081412',
      accentSecondary: '#10b981',
      borderSubtle: 'rgba(16, 185, 129, 0.25)',
      borderFocus: '#f59e0b',
      seatAvailable: '#183630',
      seatSelected: '#f59e0b',
      seatReserved: '#4a3212',
      seatBooked: '#0c1b18',
      screenArc: 'rgba(245, 158, 11, 0.85)'
    }
  },
  {
    id: 'terracotta-dune',
    name: 'Terracotta & Desert Dusk',
    badge: 'Dune / 70mm Panavision Warmth',
    description: 'Warm adobe espresso canvas with spiced clay containers and radiant copper terracotta CTA buttons.',
    roles: {
      bgCanvas: '#19110e',
      bgSurface: '#291b17',
      bgCard: '#3b2721',
      bgCardHover: '#4e332c',
      textPrimary: '#fdfaf6',
      textSecondary: '#cbb3aa',
      accentPrimary: '#e07a5f',
      btnPrimary: '#e07a5f',
      btnHover: '#f28a6d',
      btnText: '#19110e',
      accentSecondary: '#81b29a',
      borderSubtle: 'rgba(224, 122, 95, 0.28)',
      borderFocus: '#e07a5f',
      seatAvailable: '#3d2923',
      seatSelected: '#e07a5f',
      seatReserved: '#4a261d',
      seatBooked: '#1a120f',
      screenArc: 'rgba(224, 122, 95, 0.85)'
    }
  },
  {
    id: 'cyber-noir-teal',
    name: 'Cyber Noir & Electric Teal',
    badge: 'Modern Stylized Neo-Noir (Drive / Wick)',
    description: 'Velveteen violet canvas with imperial plum cards and high-voltage electric cyan CTA buttons.',
    roles: {
      bgCanvas: '#11091f',
      bgSurface: '#1d1033',
      bgCard: '#2a184a',
      bgCardHover: '#382062',
      textPrimary: '#f8f4ff',
      textSecondary: '#b7a6cc',
      accentPrimary: '#06b6d4',
      btnPrimary: '#06b6d4',
      btnHover: '#22d3ee',
      btnText: '#11091f',
      accentSecondary: '#c084fc',
      borderSubtle: 'rgba(192, 132, 252, 0.25)',
      borderFocus: '#06b6d4',
      seatAvailable: '#2c184d',
      seatSelected: '#06b6d4',
      seatReserved: '#16434d',
      seatBooked: '#130c21',
      screenArc: 'rgba(6, 182, 212, 0.9)'
    }
  },
  {
    id: 'imperial-ocean',
    name: 'Deep Oceanic Abyss & Coral',
    badge: 'Curzon Cinema / Underwater Horizon',
    description: 'Deep abyssal petrol-blue canvas with dark cerulean cards and vibrant coral reef CTA buttons.',
    roles: {
      bgCanvas: '#06131c',
      bgSurface: '#0c2231',
      bgCard: '#133247',
      bgCardHover: '#1a435e',
      textPrimary: '#f0f9ff',
      textSecondary: '#8cb1cb',
      accentPrimary: '#ff6b6b',
      btnPrimary: '#ff6b6b',
      btnHover: '#ff8787',
      btnText: '#ffffff',
      accentSecondary: '#38bdf8',
      borderSubtle: 'rgba(56, 189, 248, 0.25)',
      borderFocus: '#ff6b6b',
      seatAvailable: '#153850',
      seatSelected: '#ff6b6b',
      seatReserved: '#4a2528',
      seatBooked: '#081924',
      screenArc: 'rgba(255, 107, 107, 0.85)'
    }
  },
  {
    id: 'tokyo-neon-amethyst',
    name: 'Tokyo Midnight & Magenta Flame',
    badge: 'Cyberpunk 2077 Night City',
    description: 'Deep carbon purple canvas with dark orchid surfaces and blistering electric magenta CTA buttons.',
    roles: {
      bgCanvas: '#120b18',
      bgSurface: '#1f1329',
      bgCard: '#2d1b3d',
      bgCardHover: '#3e2454',
      textPrimary: '#fdf2f8',
      textSecondary: '#c084fc',
      accentPrimary: '#f43f5e',
      btnPrimary: '#f43f5e',
      btnHover: '#fb7185',
      btnText: '#ffffff',
      accentSecondary: '#a855f7',
      borderSubtle: 'rgba(168, 85, 247, 0.25)',
      borderFocus: '#f43f5e',
      seatAvailable: '#2d1b3d',
      seatSelected: '#f43f5e',
      seatReserved: '#4c1d2e',
      seatBooked: '#120b18',
      screenArc: 'rgba(244, 63, 94, 0.85)'
    }
  },
  {
    id: 'monochrome-ember',
    name: 'Carbon Studio & Blaze Ember',
    badge: 'Minimalist Director Suite',
    description: 'Rich warm charcoal canvas with matte graphite surfaces and pure molten orange fire CTA buttons.',
    roles: {
      bgCanvas: '#111113',
      bgSurface: '#1a1a1e',
      bgCard: '#25252b',
      bgCardHover: '#32323a',
      textPrimary: '#ffffff',
      textSecondary: '#9e9ea8',
      accentPrimary: '#ff5500',
      btnPrimary: '#ff5500',
      btnHover: '#ff6f24',
      btnText: '#ffffff',
      accentSecondary: '#fbbf24',
      borderSubtle: 'rgba(255, 255, 255, 0.12)',
      borderFocus: '#ff5500',
      seatAvailable: '#27272f',
      seatSelected: '#ff5500',
      seatReserved: '#4a2412',
      seatBooked: '#141417',
      screenArc: 'rgba(255, 85, 0, 0.85)'
    }
  }
];
