import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

import { styles } from './FriendRow.styles';

import type { Friend } from './api';

type Props = { friend: Friend; onPress?: () => void };

export function FriendRow({ friend, onPress }: Props) {
  const [pressed, setPressed] = useState(false);
  const name = friend.display_name ?? `Steam ${friend.steam_id.slice(-4)}`;
  const since =
    friend.friend_since > 0
      ? new Date(friend.friend_since * 1000).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'short',
        })
      : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${name}, ${friend.uses_killfeed ? 'usa Killfeed' : 'somente na Steam'}`}
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.row, pressed && styles.pressed]}
    >
      <View style={styles.avatarContainer}>
        {friend.avatar ? (
          <Image
            source={{ uri: friend.avatar }}
            style={styles.avatar}
            accessibilityLabel={`Avatar de ${name}`}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Feather name="user" color={colors.muted} size={24} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {since ? `Amigos desde ${since}` : 'Amigo na Steam'}
        </Text>
        <View style={styles.killfeedStatus}>
          <Feather
            name={friend.uses_killfeed ? 'check-circle' : 'minus-circle'}
            color={friend.uses_killfeed ? colors.primary : colors.muted}
            size={13}
          />
          <Text
            style={[
              styles.killfeedText,
              !friend.uses_killfeed && styles.notOnKillfeedText,
            ]}
            numberOfLines={1}
          >
            {friend.uses_killfeed
              ? 'Está no Killfeed'
              : 'Ainda não está no Killfeed'}
          </Text>
        </View>
      </View>
      {onPress && (
        <View style={styles.chevron}>
          <Feather name="chevron-right" color={colors.muted} size={20} />
        </View>
      )}
    </Pressable>
  );
}
