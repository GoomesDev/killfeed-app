import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
  },
  message: {
    flex: 1,
    color: colors.muted,
    fontFamily: typography.regular,
    lineHeight: 20,
  },
  more: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: 11,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
