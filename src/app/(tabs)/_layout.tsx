import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { restoreSession } from '@/features/auth/session';
import { useAuthStore } from '@/stores/authStore';
import { colors, typography } from '@/theme';

export default function TabsLayout() {
  const { status, userId } = useAuthStore();
  useEffect(() => { void restoreSession(); }, []);
  if (status === 'restoring') return <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  if (status !== 'authenticated' || !userId) return <Redirect href="/(auth)/login" />;
  return (
    <Tabs initialRouteName="profile" screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.secondarySurface, elevation: 0 },
      tabBarItemStyle: { paddingVertical: 4 },
      tabBarLabelStyle: { fontFamily: typography.semibold, fontSize: 11 },
      sceneStyle: { backgroundColor: colors.background },
    }}>
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil', tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} /> }} />
      <Tabs.Screen name="friends" options={{ title: 'Amigos', tabBarAccessibilityLabel: 'Amigos', tabBarIcon: ({ color, size }) => <Feather name="users" color={color} size={size} /> }} />
    </Tabs>
  );
}
