import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: { paddingTop: spacing.lg, paddingBottom: spacing.lg },
  eyebrow: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: typography.size.small,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: typography.size.title,
  },
  description: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: typography.size.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  state: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  stateTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 21,
    textAlign: 'center',
  },
  stateText: {
    color: colors.muted,
    fontFamily: typography.regular,
    lineHeight: 22,
    textAlign: 'center',
  },
  retry: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  retryText: { color: colors.onPrimary, fontFamily: typography.bold },
  footer: { padding: spacing.lg },
});
