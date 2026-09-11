import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

import { styles } from './LoginScreen.styles';
import { restoreSession } from './session';
import { nativeLoginSupported, startSteamLogin } from './steam';

export function LoginScreen() {
  const { status, message, userId } = useAuthStore();
  useEffect(() => {
    void restoreSession();
  }, []);
  if (status === 'authenticated' && userId) {
    return <Redirect href="/(tabs)/home" />;
  }
  const busy = ['restoring', 'opening', 'exchanging'].includes(status);
  return (
    <Screen>
      <View className="flex-row items-center" style={styles.brand}>
        <View style={styles.mark} accessibilityElementsHidden />
        <Text style={styles.wordmark}>KILLFEED</Text>
      </View>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SEU JOGO. SEU STATUS.</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Quem manda{'\n'}no lobby?
        </Text>
        <Text style={styles.description}>
          Seu desempenho em jogo. Sua posição entre amigos.
        </Text>
        <View style={styles.rule} />
        <Text style={styles.caption}>COUNTER-STRIKE 2</Text>
      </View>
      <View style={styles.footer}>
        <Button
          title={
            status === 'authenticated' ? 'Steam conectada' : 'Entrar com Steam'
          }
          loading={busy}
          disabled={!nativeLoginSupported || status === 'authenticated'}
          onPress={() => void startSteamLogin()}
        />
        <Text accessibilityLiveRegion="polite" style={styles.notice}>
          {message ??
            (!nativeLoginSupported
              ? 'O login Steam requer uma build nativa do Killfeed.'
              : 'Entre com sua conta Steam.')}
        </Text>
      </View>
    </Screen>
  );
}
