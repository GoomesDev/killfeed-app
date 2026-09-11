import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
