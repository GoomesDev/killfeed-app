import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  card: { borderRadius: radius.md, backgroundColor: colors.surface },
  touchArea: { gap: spacing.md, padding: spacing.md },
  editing: { borderWidth: 1, borderColor: colors.secondarySurface },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
  },
  heading: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  subtitle: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: 12,
    marginTop: 2,
  },
  handle: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.secondarySurface,
  },
});
