import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme';

import { styles } from './FeedItemRow.styles';

import type { FeedItem } from './api';

function number(payload: FeedItem['payload'], key: string) {
  const value = payload[key];
  return typeof value === 'number' ? value : null;
}
function activityText(item: FeedItem) {
  const name = item.actor.display_name;
  switch (item.type) {
    case 'daily_kills_milestone':
      return `${name} chegou a ${number(item.payload, 'kills') ?? 'muitas'} kills hoje.`;
    case 'daily_negative_kd':
      return `${name} morreu ${number(item.payload, 'difference') ?? 'bem'} a mais do que matou hoje.`;
    case 'weekly_headshots_milestone':
      return `${name} acertou ${number(item.payload, 'headshots') ?? 'vários'} headshots nesta semana.`;
    case 'weekly_rating_highlight':
      return `${name} alcançou rating ${(number(item.payload, 'rating') ?? 0).toFixed(2)} nesta semana.`;
    case 'badge_earned': {
      const badge = item.payload.badge;
      const badgeName =
        badge &&
        typeof badge === 'object' &&
        'name' in badge &&
        typeof badge.name === 'string'
          ? badge.name
          : 'uma nova conquista';
      return `${name} conquistou o badge ${badgeName}.`;
    }
    default:
      return `${name} registrou uma nova atividade no Killfeed.`;
  }
}
function relativeTime(date: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(date)) / 1000),
  );
  if (seconds < 60) {
    return 'agora';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `há ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `há ${hours} h`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? 'ontem' : `há ${days} dias`;
}

export function FeedItemRow({
  item,
  last = false,
}: {
  item: FeedItem;
  last?: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${item.actor.display_name}`}
      onPress={() => router.push(`/player/${item.actor.id}`)}
      style={[styles.row, last && styles.last]}
    >
      {item.actor.avatar ? (
        <Image source={{ uri: item.actor.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.fallback}>
          <Feather name="user" color={colors.muted} size={20} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.text}>{activityText(item)}</Text>
        <Text style={styles.time}>{relativeTime(item.occurred_at)}</Text>
      </View>
    </Pressable>
  );
}
