import { PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { styles } from './Screen.styles';

export function Screen({
  children,
  edges,
}: PropsWithChildren<{ edges?: Edge[] }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}
