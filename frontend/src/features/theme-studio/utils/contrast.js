/**
 * WCAG 2.1 Contrast Ratio Utilities
 * Standardized mathematical implementation for Theme Studio accessibility validation.
 */

/**
 * Convert hex color to RGB array
 * @param {string} hex - Color in '#RRGGBB' or '#RGB' format
 * @returns {[number, number, number]} RGB values (0-255)
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [0, 0, 0];
  const cleaned = hex.replace('#', '').trim();
  const full = cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned;
  return [
    parseInt(full.substring(0, 2), 16) || 0,
    parseInt(full.substring(2, 4), 16) || 0,
    parseInt(full.substring(4, 6), 16) || 0
  ];
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number} Relative luminance (0-1)
 */
export function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * @param {string} hex1 - First color hex
 * @param {string} hex2 - Second color hex
 * @returns {number} Contrast ratio (1:1 to 21:1)
 */
export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(...hexToRgb(hex1));
  const l2 = relativeLuminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color pair meets WCAG thresholds
 * @param {string} textHex - Text color
 * @param {string} bgHex - Background color
 * @returns {{ ratio: number, aa: boolean, aaLarge: boolean, aaa: boolean }}
 */
export function checkContrast(textHex, bgHex) {
  const ratio = contrastRatio(textHex, bgHex);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,        // Normal text (< 18pt)
    aaLarge: ratio >= 3.0,   // Large text (≥ 18pt or ≥ 14pt bold) and UI components
    aaa: ratio >= 7.0        // Enhanced contrast
  };
}
