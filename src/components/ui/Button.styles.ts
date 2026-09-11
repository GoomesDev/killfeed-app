import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.onPrimary,
    fontFamily: typography.bold,
    fontSize: typography.size.body,
  },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
