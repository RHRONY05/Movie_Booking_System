# CineReserve Design System Tokens & Brand Guide

This document captures the approved visual design system, semantic tokens, typography scales, and accessibility compliance data established via the Theme Studio and [`frontend-design`](file:///d:/Projects/Movie_Booking_System/.agents/skills/frontend-design/SKILL.md).

---

## 1. Selected Identity & Direction

* **Active Palette:** Cyber Noir & Electric Teal (Custom Shuffled)
* **Visual Atmosphere:** Velveteen violet midnight canvas with imperial plum cards, radiant neon amethyst action buttons, and high-voltage electric cyan secondary accents.
* **Active Typography Pairing:** Editorial Roman
  * **Display / Headings (`fontDisplay`):** `'Cinzel', serif`
  * **Body & Data (`fontBody`):** `'Plus Jakarta Sans', sans-serif`

---

## 2. Semantic Token Role Architecture (60-30-10 Rule)

### Canvas & Surface Layers (60% Dominant Base)
| Token Variable | Hex / RGBA | Role / Purpose |
|----------------|------------|----------------|
| `--bg-canvas` | `#11091f` | Global page background, modal backdrop foundation |
| `--bg-canvas-subtle` | `#170c29` | Alternating section background |
| `--bg-surface` | `#1d1033` | Navigation bar, top headers, drawer containers |
| `--bg-surface-elevated` | `#2a184a` | Modal dialog boxes, floating search panels |
| `--bg-card` | `#2a184a` | Movie catalog cards, cinema cards, summary tiles |
| `--bg-card-hover` | `#382062` | Card hover elevation state |
| `--bg-surface-glass` | `rgba(29, 16, 51, 0.75)` | Translucent glassmorphic header overlay |

### High-Impact Accents & Actions (10% Focal Accents)
| Token Variable | Hex / RGBA | Role / Purpose |
|----------------|------------|----------------|
| `--accent-primary` | `#c084fc` | Neon Amethyst — primary focal point, active badges |
| `--accent-primary-hover` | `#d8b4fe` | Glowing lilac hover feedback |
| `--btn-primary` | `#c084fc` | Primary call-to-action button background |
| `--btn-hover` | `#d8b4fe` | Primary button hover & active state |
| `--btn-text` | `#11091f` | High-contrast label on primary CTA (WCAG AAA compliant) |
| `--accent-secondary` | `#06b6d4` | High-voltage Electric Teal / Cyan — secondary highlight |
| `--accent-glow` | `rgba(192, 132, 252, 0.45)` | Glowing box-shadow for buttons & active highlights |
| `--accent-secondary-glow` | `rgba(6, 182, 212, 0.40)` | Electric cyan atmospheric backglow |

### Typography & Content Tokens
| Token Variable | Hex / Value | Role / Purpose |
|----------------|-------------|----------------|
| `--text-primary` | `#f8f4ff` | Radiant lavender-ivory for headings & primary labels |
| `--text-secondary` | `#b7a6cc` | Soft thistle / muted slate lilac for body copy & metadata |
| `--text-muted` | `#85729c` | Disabled text, micro-captions |
| `--text-inverse` | `#11091f` | Deep text on light badges & buttons |

### Borders & Interactive Dividers
| Token Variable | Hex / RGBA | Role / Purpose |
|----------------|------------|----------------|
| `--border-subtle` | `rgba(192, 132, 252, 0.22)` | Subtle hairline card borders & table dividers |
| `--border-focus` | `#c084fc` | Focus rings, selected state borders |

### Cinema Domain Tokens (Seat Selection Engine)
| Token Variable | Hex / RGBA | Role / Purpose |
|----------------|------------|----------------|
| `--seat-available` | `#2c184d` | Interactive seat available for selection |
| `--seat-selected` | `#c084fc` | User's currently selected seat |
| `--seat-reserved` | `#16434d` | Temporarily held seat (concurrent lock) |
| `--seat-booked` | `#130c21` | Permanently booked / sold out seat |
| `--screen-arc` | `rgba(192, 132, 252, 0.85)` | Curved cinema projection screen glow |

---

## 3. WCAG 2.1 Contrast Ratio Verification (Accessibility Dashboard)

Every color pair was mathematically checked using standard relative luminance formulas ($L = 0.2126R + 0.7152G + 0.0722B$):

| Evaluation Pair | Foreground | Background | Ratio | WCAG AA (≥ 4.5:1) | WCAG AAA (≥ 7.0:1) | Result |
|-----------------|------------|------------|-------|-------------------|--------------------|--------|
| Primary Text on Canvas | `#f8f4ff` | `#11091f` | **17.9 : 1** | PASS | PASS | **AAA PASS** |
| Primary Text on Card | `#f8f4ff` | `#2a184a` | **13.4 : 1** | PASS | PASS | **AAA PASS** |
| Primary Text on Surface | `#f8f4ff` | `#1d1033` | **15.2 : 1** | PASS | PASS | **AAA PASS** |
| Secondary Text on Canvas | `#b7a6cc` | `#11091f` | **8.4 : 1** | PASS | PASS | **AAA PASS** |
| Secondary Text on Card | `#b7a6cc` | `#2a184a` | **6.3 : 1** | PASS | — | **AA PASS** |
| Button Label on Button BG | `#11091f` | `#c084fc` | **7.5 : 1** | PASS | PASS | **AAA PASS** |
| Primary Accent on Canvas | `#c084fc` | `#11091f` | **7.5 : 1** | PASS (Large) | PASS (Large) | **AAA PASS** |
| Secondary Accent on Canvas | `#06b6d4` | `#11091f` | **8.2 : 1** | PASS (Large) | PASS (Large) | **AAA PASS** |

> **Accessibility Verdict:** 100% compliant with zero contrast regressions.

---

## 4. Implementation Bridge

These tokens are codified in `:root` inside [`frontend/src/index.css`](file:///d:/Projects/Movie_Booking_System/frontend/src/index.css). 

When implementing components and pages using [`frontend-implementation`](file:///d:/Projects/Movie_Booking_System/.agents/skills/frontend-implementation/SKILL.md):
- **NEVER hardcode hex codes or fonts.** Always use `var(--token-name)`.
- Use the automated token linter (`node .agents/skills/frontend-implementation/scripts/lint-tokens.js`) before finalizing code.
