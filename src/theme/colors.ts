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

  // Avatar gradient pairs (deterministic, picked by user id) — muted tonal
  // family, not a rainbow. Each is a near-neutral with a whisper of hue so
  // people stay visually distinct without competing with the flame accent.
  avatarGradients: [
    ['#3A3F47', '#15161A'],
    ['#463930', '#17120F'],
    ['#37402F', '#121510'],
    ['#3E2F3B', '#141013'],
    ['#2D3444', '#101219'],
    ['#453329', '#17110D'],
    ['#2B3E3B', '#0E1614'],
    ['#3B3B3F', '#141416'],
  ] as const,
} as const;

export type ColorToken = keyof typeof colors;
