import { Platform } from 'react-native';

// Soft, dark-mode-appropriate elevation. Android uses elevation; iOS uses shadow props.
function shadow(elevation: number, opacity: number, radius: number) {
  return Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: Math.round(elevation / 1.6) },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  });
}

export const shadows = {
  card: shadow(4, 0.28, 12),
  raised: shadow(10, 0.36, 20),
  sheet: shadow(18, 0.45, 28),
  glow: {
    ...shadow(6, 0.5, 16),
  },
} as const;
