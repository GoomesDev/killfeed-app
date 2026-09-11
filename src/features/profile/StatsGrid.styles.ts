import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  groups: { gap: spacing.lg },
  group: { gap: spacing.sm },
  heading: {
    color: colors.text,
    fontFamily: typography.semibold,
    fontSize: typography.size.body,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  featured: { borderTopWidth: 2, borderTopColor: colors.primary },
  value: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 26,
    fontVariant: ['tabular-nums'],
  },
  featuredValue: { color: colors.primary },
  label: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: typography.size.small,
  },
});
