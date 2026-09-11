import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

export default function PlayerRoute() {
  const status = useAuthStore((state) => state.status);
  const params = useLocalSearchParams<{ id?: string }>();
  const userId = z.coerce.number().int().positive().safeParse(params.id);
  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/login" />;
  }
  if (!userId.success) {
    return <Redirect href="/(tabs)/friends" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Perfil do jogador',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ProfileScreen userId={userId.data} ownProfile={false} />
    </>
  );
}
