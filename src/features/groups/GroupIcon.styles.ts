import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontFamily: typography.semibold,
    fontSize: typography.size.small,
    marginBottom: spacing.sm,
  },
  list: { gap: spacing.sm, paddingRight: spacing.md },
  option: {
    width: 72,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: radius.md,
    backgroundColor: colors.secondarySurface,
  },
  selected: { backgroundColor: colors.primary },
  optionText: {
    color: colors.muted,
    fontFamily: typography.semibold,
    fontSize: 10,
  },
  selectedText: { color: colors.onPrimary },
});
