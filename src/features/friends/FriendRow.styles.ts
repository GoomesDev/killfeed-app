import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 84,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.secondarySurface,
  },
  pressed: { opacity: 0.7 },
  avatarContainer: {
    width: 52,
    height: 52,
    flexGrow: 0,
    flexShrink: 0,
    marginRight: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 52,
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    color: colors.text,
    fontFamily: typography.semibold,
    fontSize: typography.size.body,
    flexShrink: 1,
  },
  detail: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: typography.size.small,
    flexShrink: 1,
  },
  killfeedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  killfeedText: {
    color: colors.primary,
    fontFamily: typography.semibold,
    fontSize: 11,
    flexShrink: 1,
  },
  notOnKillfeedText: { color: colors.muted, fontFamily: typography.regular },
  chevron: {
    width: 28,
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
});
