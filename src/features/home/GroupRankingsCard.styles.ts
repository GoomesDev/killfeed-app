import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.secondarySurface,
  },
  groupIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
  },
  text: { flex: 1, minWidth: 0 },
  name: {
    color: colors.text,
    fontFamily: typography.semibold,
    fontSize: typography.size.small,
  },
  detail: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: 11,
    marginTop: 3,
  },
  position: { alignItems: 'center' },
  positionValue: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: 15,
  },
  positionLabel: {
    color: colors.muted,
    fontFamily: typography.bold,
    fontSize: 8,
  },
  message: {
    flex: 1,
    color: colors.muted,
    fontFamily: typography.regular,
    lineHeight: 20,
  },
  empty: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  link: { minHeight: 40, justifyContent: 'center' },
  linkText: {
    color: colors.primary,
    fontFamily: typography.semibold,
    fontSize: typography.size.small,
  },
});
