import Feather from '@expo/vector-icons/Feather';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { friendsQueryOptions } from './api';
import { FriendRow } from './FriendRow';
import { getApiErrorMessage } from '@/lib/api/errors';
import { colors, radius, spacing, typography } from '@/theme';

type Filter = 'all' | 'killfeed';

export function FriendsScreen() {
  const router = useRouter();
  const query = useQuery(friendsQueryOptions());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const friends = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return (query.data?.data ?? []).filter(friend =>
      (filter === 'all' || friend.uses_killfeed) &&
      (!term || (friend.display_name ?? friend.steam_id).toLocaleLowerCase('pt-BR').includes(term))
    );
  }, [filter, query.data?.data, search]);

  return <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
    <FlatList
      data={friends}
      keyExtractor={friend => friend.steam_id}
      renderItem={({ item }) => <FriendRow friend={item} onPress={item.user_id ? () => router.push(`/player/${item.user_id}`) : undefined} />}
      refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} colors={[colors.primary]} />}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<>
        <Text style={styles.eyebrow}>SEU LOBBY</Text>
        <Text accessibilityRole="header" style={styles.title}>Amigos</Text>
        <Text style={styles.description}>Veja quem já está disputando com você no Killfeed.</Text>
        {query.data && <View style={styles.summary}>
          <View><Text style={styles.summaryValue}>{query.data.meta.total}</Text><Text style={styles.summaryLabel}>na Steam</Text></View>
          <View style={styles.summaryDivider} />
          <View><Text style={[styles.summaryValue, styles.highlight]}>{query.data.meta.killfeed_count}</Text><Text style={styles.summaryLabel}>no Killfeed</Text></View>
        </View>}
        <View style={styles.searchBox}>
          <Feather name="search" color={colors.muted} size={20} />
          <TextInput accessibilityLabel="Buscar amigos" value={search} onChangeText={setSearch} placeholder="Buscar por nome" placeholderTextColor={colors.muted} style={styles.searchInput} autoCapitalize="none" autoCorrect={false} />
          {search ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setSearch('')} hitSlop={12}><Feather name="x" color={colors.muted} size={20} /></Pressable> : null}
        </View>
        <View style={styles.filters}>
          {([{ key: 'all', label: 'Todos' }, { key: 'killfeed', label: 'No Killfeed' }] as const).map(option => <Pressable key={option.key} accessibilityRole="button" accessibilityState={{ selected: filter === option.key }} onPress={() => setFilter(option.key)} style={[styles.filter, filter === option.key && styles.filterActive]}><Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>{option.label}</Text></Pressable>)}
        </View>
        <Text style={styles.sectionLabel}>{friends.length} {friends.length === 1 ? 'amigo' : 'amigos'}</Text>
      </>}
      ListEmptyComponent={query.isPending ? <ActivityIndicator style={styles.state} color={colors.primary} /> : query.isError ? <View style={styles.state}><Feather name="alert-circle" color={colors.primary} size={36} /><Text style={styles.stateTitle}>Não carregou desta vez</Text><Text style={styles.stateText}>{getApiErrorMessage(query.error)}</Text><Pressable onPress={() => void query.refetch()} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable></View> : <View style={styles.state}><Feather name={search || filter !== 'all' ? 'search' : 'users'} color={colors.primary} size={40} /><Text style={styles.stateTitle}>{search || filter !== 'all' ? 'Ninguém por aqui' : 'Seu lobby está vazio'}</Text><Text style={styles.stateText}>{search || filter !== 'all' ? 'Tente outra busca ou veja todos os amigos.' : 'Puxe a tela para baixo para consultar sua lista novamente.'}</Text></View>}
    />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 560, alignSelf: 'center' },
  eyebrow: { color: colors.primary, fontFamily: typography.bold, fontSize: typography.size.small, letterSpacing: 2, marginTop: spacing.lg, marginBottom: spacing.md },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: typography.size.title },
  description: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.body, lineHeight: 24, marginTop: spacing.sm },
  summary: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, gap: spacing.lg },
  summaryValue: { color: colors.text, fontFamily: typography.bold, fontSize: 24, fontVariant: ['tabular-nums'] },
  highlight: { color: colors.primary },
  summaryLabel: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.small },
  summaryDivider: { width: StyleSheet.hairlineWidth, height: 36, backgroundColor: colors.secondarySurface },
  searchBox: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, color: colors.text, fontFamily: typography.regular, fontSize: typography.size.body },
  filters: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md },
  filter: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.primary },
  filterText: { color: colors.muted, fontFamily: typography.semibold, fontSize: typography.size.small },
  filterTextActive: { color: colors.onPrimary },
  sectionLabel: { color: colors.muted, fontFamily: typography.semibold, fontSize: typography.size.small, marginTop: spacing.sm, marginBottom: spacing.xs },
  state: { flex: 1, minHeight: 280, justifyContent: 'center', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  stateTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 21, textAlign: 'center' },
  stateText: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.body, lineHeight: 24, textAlign: 'center' },
  retry: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primary },
  retryText: { color: colors.onPrimary, fontFamily: typography.bold, fontSize: typography.size.body },
});
