import Feather from '@expo/vector-icons/Feather';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import { friendsQueryOptions } from './api';
import { FriendRow } from './FriendRow';
import { styles } from './FriendsScreen.styles';

type Filter = 'all' | 'killfeed';

export function FriendsScreen() {
  const router = useRouter();
  const query = useInfiniteQuery(friendsQueryOptions());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const friends = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return (query.data?.pages.flatMap((page) => page.data) ?? []).filter(
      (friend) =>
        (filter === 'all' || friend.uses_killfeed) &&
        (!term ||
          (friend.display_name ?? friend.steam_id)
            .toLocaleLowerCase('pt-BR')
            .includes(term)),
    );
  }, [filter, query.data?.pages, search]);

  const summary = query.data?.pages[0]?.meta;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={friends}
        keyExtractor={(friend) => friend.steam_id}
        renderItem={({ item }) => (
          <FriendRow
            friend={item}
            onPress={
              item.user_id
                ? () => router.push(`/player/${item.user_id}`)
                : undefined
            }
          />
        )}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => void query.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>SEU LOBBY</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Amigos
            </Text>
            <Text style={styles.description}>
              Veja quem já está disputando com você no Killfeed.
            </Text>
            {summary && (
              <View style={styles.summary}>
                <View>
                  <Text style={styles.summaryValue}>{summary.total}</Text>
                  <Text style={styles.summaryLabel}>na Steam</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View>
                  <Text style={[styles.summaryValue, styles.highlight]}>
                    {summary.killfeed_count}
                  </Text>
                  <Text style={styles.summaryLabel}>no Killfeed</Text>
                </View>
              </View>
            )}
            <View style={styles.searchBox}>
              <Feather name="search" color={colors.muted} size={20} />
              <TextInput
                accessibilityLabel="Buscar amigos"
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nome"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {search ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  onPress={() => setSearch('')}
                  hitSlop={12}
                >
                  <Feather name="x" color={colors.muted} size={20} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.filters}>
              {(
                [
                  { key: 'all', label: 'Todos' },
                  { key: 'killfeed', label: 'No Killfeed' },
                ] as const
              ).map((option) => (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === option.key }}
                  onPress={() => setFilter(option.key)}
                  style={[
                    styles.filter,
                    filter === option.key && styles.filterActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === option.key && styles.filterTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sectionLabel}>
              {summary && filter === 'all' && !search
                ? `${friends.length} de ${summary.total} amigos`
                : `${friends.length} ${friends.length === 1 ? 'amigo' : 'amigos'}`}
            </Text>
          </>
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          query.isPending ? (
            <ActivityIndicator style={styles.state} color={colors.primary} />
          ) : query.isError ? (
            <View style={styles.state}>
              <Feather name="alert-circle" color={colors.primary} size={36} />
              <Text style={styles.stateTitle}>Não carregou desta vez</Text>
              <Text style={styles.stateText}>
                {getApiErrorMessage(query.error)}
              </Text>
              <Pressable
                onPress={() => void query.refetch()}
                style={styles.retry}
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.state}>
              <Feather
                name={search || filter !== 'all' ? 'search' : 'users'}
                color={colors.primary}
                size={40}
              />
              <Text style={styles.stateTitle}>
                {search || filter !== 'all'
                  ? 'Ninguém por aqui'
                  : 'Seu lobby está vazio'}
              </Text>
              <Text style={styles.stateText}>
                {search || filter !== 'all'
                  ? 'Tente outra busca ou veja todos os amigos.'
                  : 'Puxe a tela para baixo para consultar sua lista novamente.'}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
