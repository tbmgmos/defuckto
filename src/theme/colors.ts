// Monochrome graphite base + a single provocative accent.
// Everything else derives from this file — never hardcode a color in a screen.
export const colors = {
  // Base
  bg: '#0A0A0B',
  bgElevated: '#131315',
  surface: '#18181B',
  surfaceAlt: '#202024',
  border: '#2A2A2E',
  borderStrong: '#38383D',

  // Text
  textPrimary: '#F5F3EE',
  textSecondary: '#A5A3A0',
  textTertiary: '#6E6C6A',
  textInverse: '#0A0A0B',

  // Accent — "flame". Used for CTAs, coins, active states, key highlights only.
  accent: '#FF4A32',
  accentPressed: '#E03D22',
  accentMuted: 'rgba(255, 74, 50, 0.16)',
  accentText: '#FF6A4E',

  // Semantic
  success: '#3DDC84',
  successMuted: 'rgba(61, 220, 132, 0.14)',
  warning: '#F5B942',
  danger: '#FF5C5C',
  dangerMuted: 'rgba(255, 92, 92, 0.14)',

  // Overlays
  overlayScrim: 'rgba(6, 6, 7, 0.72)',
  overlaySoft: 'rgba(10, 10, 11, 0.4)',
  sheetHandle: '#3A3A3E',

  // Avatar gradient pairs (deterministic, picked by user id)
  avatarGradients: [
    ['#FF4A32', '#B02A6B'],
    ['#5B4CFF', '#1B1B3A'],
    ['#0FA36B', '#0A2A2A'],
    ['#F5B942', '#7A3B1E'],
    ['#3D8BFF', '#12123A'],
    ['#E0457B', '#3A1030'],
    ['#2DBFA0', '#0B2C2C'],
    ['#C6592D', '#2A1610'],
  ] as const,
} as const;

export type ColorToken = keyof typeof colors;
