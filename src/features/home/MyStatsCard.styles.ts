import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: spacing.sm },
  metric: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.secondarySurface,
  },
  value: { color: colors.text, fontFamily: typography.bold, fontSize: 20 },
  label: { color: colors.muted, fontFamily: typography.regular, fontSize: 11 },
  message: {
    color: colors.muted,
    fontFamily: typography.regular,
    lineHeight: 20,
  },
  link: { minHeight: 40, justifyContent: 'center' },
  linkText: {
    color: colors.primary,
    fontFamily: typography.semibold,
    fontSize: typography.size.small,
  },
});
