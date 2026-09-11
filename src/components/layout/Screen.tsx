import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export function Screen({ children, edges }: PropsWithChildren<{ edges?: Edge[] }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: spacing.lg, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
