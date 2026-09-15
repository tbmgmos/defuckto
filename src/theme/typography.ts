import { Platform } from 'react-native';
import { colors } from './colors';

// System sans with strong Cyrillic support on both platforms.
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  title1: {
    fontFamily,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  title2: {
    fontFamily,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  headline: {
    fontFamily: fontFamilyMedium,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  subhead: {
    fontFamily,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  eyebrow: {
    fontFamily: fontFamilyMedium,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
  },
} as const;
