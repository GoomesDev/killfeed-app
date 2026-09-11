import Feather from '@expo/vector-icons/Feather';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import { feedInfiniteQueryOptions, type FeedItem } from './api';
import { FeedItemRow } from './FeedItemRow';
import { styles } from './FeedScreen.styles';

export function FeedScreen() {
  const query = useInfiniteQuery(feedInfiniteQueryOptions());
  const items = query.data?.pages.flatMap((page) => page.data) ?? [];
  const refresh = () => void query.refetch();
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };
  const renderItem = ({ item, index }: { item: FeedItem; index: number }) => (
    <FeedItemRow item={item} last={index === items.length - 1} />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>NA RESENHA</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Feed
            </Text>
            <Text style={styles.description}>
              As melhores jogadas, conquistas e momentos questionáveis dos seus
              amigos.
            </Text>
          </View>
        }
        ListEmptyComponent={
          query.isPending ? (
            <ActivityIndicator style={styles.state} color={colors.primary} />
          ) : query.isError ? (
            <View style={styles.state}>
              <Feather name="alert-circle" color={colors.primary} size={36} />
              <Text style={styles.stateTitle}>O feed não carregou</Text>
              <Text style={styles.stateText}>
                {getApiErrorMessage(query.error)}
              </Text>
              <Pressable style={styles.retry} onPress={refresh}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.state}>
              <Feather name="coffee" color={colors.primary} size={38} />
              <Text style={styles.stateTitle}>Tudo tranquilo por aqui</Text>
              <Text style={styles.stateText}>
                Novas atividades suas e dos seus amigos aparecerão neste espaço.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
