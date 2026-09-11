import Feather from '@expo/vector-icons/Feather';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { statsQueryOptions } from '@/features/profile/stats';
import type { PlayerMetrics } from '@/features/profile/stats-contract';
import { getApiErrorMessage } from '@/lib/api/errors';
import { colors, radius } from '@/theme';

import { groupQueryOptions, type Group, type GroupUser } from './api';
import { styles } from './GroupDetailScreen.styles';
import { GroupIcon } from './GroupIcon';

type RankingKey = 'rating' | 'kills' | 'headshots' | 'deaths' | 'mvps';
type RankedMember = GroupUser & {
  metrics: PlayerMetrics | null;
  loading: boolean;
};
const rankings: {
  key: RankingKey;
  label: string;
  shortLabel: string;
  description: string;
  value: (metrics: PlayerMetrics) => number;
  format: (value: number) => string;
}[] = [
  {
    key: 'rating',
    label: 'Rating',
    shortLabel: 'RATING',
    description: 'melhor desempenho geral',
    value: (metrics) => metrics.rating,
    format: (value) => value.toFixed(2),
  },
  {
    key: 'kills',
    label: 'Kills',
    shortLabel: 'KILLS',
    description: 'mais eliminações',
    value: (metrics) => metrics.kills,
    format: String,
  },
  {
    key: 'headshots',
    label: 'Headshots',
    shortLabel: 'HS',
    description: 'mais tiros na cabeça',
    value: (metrics) => metrics.headshots,
    format: String,
  },
  {
    key: 'deaths',
    label: 'Mais morreu',
    shortLabel: 'MORTES',
    description: 'quem mais voltou para o lobby',
    value: (metrics) => metrics.deaths,
    format: String,
  },
  {
    key: 'mvps',
    label: 'MVPs',
    shortLabel: 'MVPS',
    description: 'mais destaques da partida',
    value: (metrics) => metrics.mvps,
    format: String,
  },
];

export function GroupDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = Number(params.id);
  const router = useRouter();
  const group = useQuery({
    ...groupQueryOptions(groupId),
    enabled: Number.isInteger(groupId) && groupId > 0,
  });
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return <Redirect href="/(tabs)/groups" />;
  }
  if (group.isPending) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={styles.center} color={colors.primary} />
      </SafeAreaView>
    );
  }
  if (group.isError || !group.data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.stateTitle}>Grupo indisponível</Text>
          <Text style={styles.stateText}>
            {getApiErrorMessage(group.error)}
          </Text>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <GroupRanking
      group={group.data}
      refreshing={group.isRefetching}
      onRefresh={() => void group.refetch()}
    />
  );
}

function GroupRanking({
  group,
  refreshing,
  onRefresh,
}: {
  group: Group;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [rankingKey, setRankingKey] = useState<RankingKey>('rating');
  const stats = useQueries({
    queries: group.members.map((member) =>
      statsQueryOptions(member.id, 'weekly'),
    ),
  });
  const selectedRanking =
    rankings.find((item) => item.key === rankingKey) ?? rankings[0];
  const ranking: RankedMember[] = group.members
    .map((member, index) => {
      const values =
        stats[index].data?.source === 'period'
          ? stats[index].data.values
          : null;
      return {
        ...member,
        metrics: values ?? null,
        loading: stats[index].isPending,
      };
    })
    .sort(
      (a, b) =>
        (b.metrics ? selectedRanking.value(b.metrics) : -1) -
        (a.metrics ? selectedRanking.value(a.metrics) : -1),
    );
  const podium = ranking
    .filter((member) => member.metrics !== null)
    .slice(0, 3);
  const rankingLoading = stats.some((query) => query.isPending);
  const rankingFailed =
    stats.length > 0 && stats.every((query) => query.isError);
  const refreshAll = () => {
    onRefresh();
    stats.forEach((query) => void query.refetch());
  };
  const renderMember = ({
    item,
    index,
  }: {
    item: RankedMember;
    index: number;
  }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${item.display_name}`}
      onPress={() => router.push(`/player/${item.id}`)}
      style={styles.rankRow}
    >
      <Text style={[styles.position, index < 3 && styles.topPosition]}>
        {index + 1}
      </Text>
      <Avatar member={item} size={46} />
      <View style={styles.personText}>
        <Text numberOfLines={1} style={styles.personName}>
          {item.display_name}
        </Text>
        <Text style={styles.personDetail}>
          {item.id === group.owner.id ? 'Criador · ' : ''}
          {item.loading
            ? 'Calculando desempenho…'
            : item.metrics === null
              ? 'Sem dados nesta semana'
              : `${item.metrics.kills} kills · K/D ${item.metrics.kd_ratio.toFixed(2)}`}
        </Text>
      </View>
      <View style={styles.rating}>
        <Text style={styles.ratingValue}>
          {item.metrics
            ? selectedRanking.format(selectedRanking.value(item.metrics))
            : '—'}
        </Text>
        <Text style={styles.ratingLabel}>{selectedRanking.shortLabel}</Text>
      </View>
    </Pressable>
  );

  const header = (
    <>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <Feather name="arrow-left" color={colors.text} size={24} />
        </Pressable>
        {group.is_owner && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Administrar grupo"
            onPress={() => router.push(`/group/${group.id}/admin`)}
            style={styles.manageButton}
          >
            <Feather name="settings" color={colors.text} size={18} />
            <Text style={styles.manageText}>Administrar</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.eyebrow}>RANKINGS DA SEMANA</Text>
      <View style={styles.groupTitleRow}>
        <View style={styles.groupIcon}>
          <GroupIcon name={group.icon} size={30} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {group.name}
        </Text>
      </View>
      <Text style={styles.description}>
        {group.members_count}{' '}
        {group.members_count === 1 ? 'competidor' : 'competidores'} disputando o
        topo.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rankingTabs}
      >
        {rankings.map((item) => {
          const active = item.key === rankingKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setRankingKey(item.key)}
              style={[styles.rankingTab, active && styles.rankingTabActive]}
            >
              <Text
                style={[
                  styles.rankingTabText,
                  active && styles.rankingTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={styles.rankingDescription}>
        {selectedRanking.description}
      </Text>
      {rankingFailed ? (
        <RankingState
          icon="bar-chart-2"
          text="Não foi possível calcular o ranking agora."
        />
      ) : rankingLoading && podium.length === 0 ? (
        <View style={styles.rankingState}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Montando o ranking…</Text>
        </View>
      ) : podium.length > 0 ? (
        <View style={styles.podium}>
          {podium.map((member, index) => (
            <Pressable
              key={member.id}
              accessibilityRole="button"
              onPress={() => router.push(`/player/${member.id}`)}
              style={[styles.podiumCard, index === 0 && styles.firstCard]}
            >
              <View style={[styles.medal, index === 0 && styles.firstMedal]}>
                <Text style={styles.medalText}>{index + 1}º</Text>
              </View>
              <Avatar member={member} size={index === 0 ? 62 : 52} />
              <Text numberOfLines={1} style={styles.podiumName}>
                {member.display_name}
              </Text>
              <Text style={styles.podiumRating}>
                {member.metrics
                  ? selectedRanking.format(
                      selectedRanking.value(member.metrics),
                    )
                  : '—'}
              </Text>
              <Text style={styles.podiumMetric}>
                {selectedRanking.shortLabel}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <RankingState
          icon="clock"
          text="O pódio aparecerá quando houver estatísticas sincronizadas."
        />
      )}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Classificação</Text>
        <Text style={styles.metricHint}>
          {selectedRanking.label.toLowerCase()}
        </Text>
      </View>
    </>
  );
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={ranking}
        keyExtractor={(member) => String(member.id)}
        renderItem={renderMember}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || rankingLoading}
            onRefresh={refreshAll}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={header}
        ListFooterComponent={
          <View style={styles.futureCard}>
            <Feather name="award" color={colors.primary} size={22} />
            <View style={styles.personText}>
              <Text style={styles.futureTitle}>Conquistas do grupo</Text>
              <Text style={styles.personDetail}>
                Badges e desafios vão aparecer aqui em breve.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function RankingState({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  text: string;
}) {
  return (
    <View style={styles.rankingState}>
      <Feather name={icon} color={colors.muted} size={28} />
      <Text style={styles.stateText}>{text}</Text>
    </View>
  );
}
function Avatar({ member, size }: { member: GroupUser; size: number }) {
  return member.avatar ? (
    <Image
      source={{ uri: member.avatar }}
      style={{
        width: size,
        height: size,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
      }}
    />
  ) : (
    <View style={[styles.avatarFallback, { width: size, height: size }]}>
      <Feather name="user" color={colors.muted} size={size * 0.45} />
    </View>
  );
}
