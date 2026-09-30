// Warm-black base + one red accent, tuned to the "dark stage, vivid photos" look:
// the interface stays quiet so faces carry the colour. Everything else derives
// from this file — never hardcode a color in a screen.
export const colors = {
  // Base — near-black with a warm (brown/olive) cast, never pure grey
  bg: '#0C0A08',
  bgElevated: '#14110E',
  surface: '#1D1A16',
  surfaceAlt: '#27231D',
  border: '#302B25',
  borderStrong: '#443D34',

  // Text
  textPrimary: '#F6F2EC',
  textSecondary: '#B0AAA1',
  textTertiary: '#928C83',
  textInverse: '#0C0A08', // on light fills: white CTA, selected chip, lime/coral badges
  onAccent: '#FFFFFF', // on the red accent: sent bubble, count badges, red buttons

  // Accent — "signal red". Likes, sparks, coins, active states, sent messages.
  // #D63E3F is the reference red nudged just enough for 4.5:1 with white text.
  accent: '#D63E3F',
  accentPressed: '#BC3335',
  accentMuted: 'rgba(214, 62, 63, 0.18)',
  accentText: '#FF7B78',

  // Semantic. success doubles as the "online" lime.
  success: '#CDF79B',
  successMuted: 'rgba(205, 247, 155, 0.14)',
  warning: '#F2B84B',
  danger: '#FF8577',
  dangerMuted: 'rgba(255, 133, 119, 0.14)',

  // Overlays
  overlayScrim: 'rgba(8, 5, 4, 0.74)',
  overlaySoft: 'rgba(12, 10, 8, 0.4)',
  sheetHandle: '#6B6358',

  // Avatar gradient pairs (deterministic, picked by user id) — warm tonal
  // family so people stay distinct without competing with the red accent.
  avatarGradients: [
    ['#4A3F36', '#1A1512'],
    ['#54382B', '#1B120D'],
    ['#3F4530', '#151810'],
    ['#4A303A', '#180F13'],
    ['#3A3F4A', '#12141A'],
    ['#553A2A', '#1A110B'],
    ['#33453F', '#0F1613'],
    ['#463F38', '#171412'],
  ] as const,
} as const;

export type ColorToken = keyof typeof colors;
