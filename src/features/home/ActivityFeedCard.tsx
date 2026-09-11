import Feather from '@expo/vector-icons/Feather';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { feedQueryOptions } from '@/features/feed/api';
import { FeedItemRow } from '@/features/feed/FeedItemRow';
import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import { styles } from './ActivityFeedCard.styles';

export function ActivityFeedCard() {
  const query = useQuery(feedQueryOptions());
  if (query.isPending) {
    return <ActivityIndicator color={colors.primary} />;
  }
  if (query.isError) {
    return (
      <Pressable onPress={() => void query.refetch()}>
        <Text style={styles.message}>
          {getApiErrorMessage(query.error)} Toque para tentar novamente.
        </Text>
      </Pressable>
    );
  }
  const items = query.data.data.slice(0, 5);
  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Feather name="coffee" color={colors.primary} size={23} />
        <Text style={styles.message}>
          O feed está tranquilo por enquanto. Novas atividades dos seus amigos
          aparecerão aqui.
        </Text>
      </View>
    );
  }
  return (
    <View>
      {items.map((item, index) => (
        <FeedItemRow
          key={item.id}
          item={item}
          last={index === items.length - 1}
        />
      ))}
      {query.data.meta.total > items.length && (
        <Text style={styles.more}>
          Mais {query.data.meta.total - items.length} atividades recentes
        </Text>
      )}
    </View>
  );
}
