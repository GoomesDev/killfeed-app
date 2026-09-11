import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Friend } from './api';
import { colors, radius, spacing, typography } from '@/theme';

type Props = { friend: Friend; onPress?: () => void };

export function FriendRow({ friend, onPress }: Props) {
  const name = friend.display_name ?? `Steam ${friend.steam_id.slice(-4)}`;
  const since = friend.friend_since > 0
    ? new Date(friend.friend_since * 1000).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })
    : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${name}, ${friend.uses_killfeed ? 'usa Killfeed' : 'somente na Steam'}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {friend.avatar ? (
        <Image source={{ uri: friend.avatar }} style={styles.avatar} accessibilityLabel={`Avatar de ${name}`} />
      ) : (
        <View style={styles.avatarFallback}><Feather name="user" color={colors.muted} size={24} /></View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.detail}>{since ? `Amigos desde ${since}` : 'Amigo na Steam'}</Text>
      </View>
      <View style={[styles.status, friend.uses_killfeed ? styles.memberStatus : styles.steamStatus]}>
        <View style={[styles.dot, friend.uses_killfeed && styles.memberDot]} />
        <Text style={[styles.statusText, friend.uses_killfeed && styles.memberText]}>
          {friend.uses_killfeed ? 'Killfeed' : 'Steam'}
        </Text>
      </View>
      {onPress && <Feather name="chevron-right" color={colors.muted} size={20} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.secondarySurface },
  pressed: { opacity: 0.7 },
  avatar: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surface },
  avatarFallback: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: spacing.xs },
  name: { color: colors.text, fontFamily: typography.semibold, fontSize: typography.size.body },
  detail: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.small },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.secondarySurface },
  memberStatus: { backgroundColor: colors.primaryMuted },
  steamStatus: { opacity: 0.8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.muted },
  memberDot: { backgroundColor: colors.primary },
  statusText: { color: colors.muted, fontFamily: typography.semibold, fontSize: 11 },
  memberText: { color: colors.primary },
});
