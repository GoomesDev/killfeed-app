import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1 },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: { flex: 1 },
  eyebrow: {
    color: colors.primary,
    fontFamily: typography.bold,
    fontSize: typography.size.small,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: typography.size.title,
  },
  editButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },
  editButtonActive: { backgroundColor: colors.primary },
  editText: {
    color: colors.text,
    fontFamily: typography.semibold,
    fontSize: 12,
  },
  editTextActive: { color: colors.onPrimary },
  hint: {
    color: colors.muted,
    fontFamily: typography.regular,
    fontSize: typography.size.small,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cards: { gap: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.secondarySurface,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
  },
});
