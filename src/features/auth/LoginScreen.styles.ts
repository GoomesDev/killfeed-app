import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  brand: { gap: spacing.sm, paddingVertical: spacing.md },
  mark: {
    width: 10,
    height: 24,
    backgroundColor: colors.primary,
    transform: [{ skewX: '-15deg' }],
  },
  wordmark: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 22,
    letterSpacing: 3,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: typography.semibold,
    fontSize: typography.size.small,
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: typography.size.hero,
    lineHeight: 54,
  },
  description: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: typography.size.body,
    lineHeight: 25,
    maxWidth: 290,
  },
  rule: { height: 3, width: 48, backgroundColor: colors.primary },
  caption: {
    color: colors.muted,
    fontFamily: typography.semibold,
    fontSize: typography.size.small,
    letterSpacing: 2,
  },
  footer: { gap: spacing.md, paddingBottom: spacing.md },
  notice: {
    color: colors.muted,
    fontFamily: typography.regular,
    textAlign: 'center',
    fontSize: typography.size.small,
  },
});
