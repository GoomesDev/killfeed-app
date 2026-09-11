import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  careerContainer: { flex: 1, backgroundColor: colors.background },
  careerScroll: { flex: 1 },
  careerContent: {
    paddingHorizontal: spacing.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  careerFooter: {
    padding: spacing.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.secondarySurface,
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  periodButton: {
    flex: 1,
    minWidth: 88,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  periodButtonSelected: { backgroundColor: colors.primary },
  periodLabel: {
    color: colors.muted,
    fontFamily: typography.semibold,
    fontSize: typography.size.body,
  },
  periodLabelSelected: { color: colors.onPrimary, fontFamily: typography.bold },
  label: {
    color: colors.primary,
    fontFamily: typography.bold,
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: typography.size.title,
    textAlign: 'center',
  },
  heading: { color: colors.text, fontFamily: typography.bold, fontSize: 22 },
  body: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: typography.size.small,
    lineHeight: 20,
  },
  section: { gap: spacing.md, marginVertical: spacing.lg },
});
