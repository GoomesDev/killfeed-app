import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';
import { useEffect } from 'react';
import { restoreSession } from './session';
import { nativeLoginSupported, startSteamLogin } from './steam';
import { useAuthStore } from '@/stores/authStore';
import { Redirect } from 'expo-router';

export function LoginScreen() {
  const { status, message, userId } = useAuthStore();
  useEffect(() => { void restoreSession(); }, []);
  if (status === 'authenticated' && userId) return <Redirect href="/(tabs)/profile" />;
  const busy = ['restoring', 'opening', 'exchanging'].includes(status);
  return (
    <Screen>
      <View className="flex-row items-center" style={styles.brand}>
        <View style={styles.mark} accessibilityElementsHidden />
        <Text style={styles.wordmark}>KILLFEED</Text>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SEU JOGO. SEU STATUS.</Text>
        <Text accessibilityRole="header" style={styles.title}>Quem manda{'\n'}no lobby?</Text>
        <Text style={styles.description}>Seu desempenho em jogo. Sua posição entre amigos.</Text>
        <View style={styles.rule} />
        <Text style={styles.caption}>COUNTER-STRIKE 2</Text>
      </View>
      <View style={styles.footer}>
        <Button title={status === 'authenticated' ? 'Steam conectada' : 'Entrar com Steam'} loading={busy}
          disabled={!nativeLoginSupported || status === 'authenticated'} onPress={() => void startSteamLogin()} />
        <Text accessibilityLiveRegion="polite" style={styles.notice}>{message ?? (!nativeLoginSupported
          ? 'O login Steam requer uma build nativa do Killfeed.' : 'Entre com sua conta Steam.')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { gap: spacing.sm, paddingVertical: spacing.md },
  mark: { width: 10, height: 24, backgroundColor: colors.primary, transform: [{ skewX: '-15deg' }] },
  wordmark: { color: colors.text, fontFamily: typography.bold, fontSize: 22, letterSpacing: 3 },
  hero: { flex: 1, justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.lg },
  eyebrow: { color: colors.primary, fontFamily: typography.semibold, fontSize: typography.size.small, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: typography.size.hero, lineHeight: 54 },
  description: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.body, lineHeight: 25, maxWidth: 290 },
  rule: { height: 3, width: 48, backgroundColor: colors.primary },
  caption: { color: colors.muted, fontFamily: typography.semibold, fontSize: typography.size.small, letterSpacing: 2 },
  footer: { gap: spacing.md, paddingBottom: spacing.md },
  notice: { color: colors.muted, fontFamily: typography.regular, textAlign: 'center', fontSize: typography.size.small },
});
