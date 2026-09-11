import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondarySurface,
  },
  last: { borderBottomWidth: 0 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.secondarySurface,
  },
  fallback: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.secondarySurface,
  },
  content: { flex: 1, minWidth: 0 },
  text: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: typography.size.small,
    lineHeight: 19,
  },
  time: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: 11,
    marginTop: 3,
  },
});
