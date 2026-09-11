import Feather from '@expo/vector-icons/Feather';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { groupsQueryOptions } from '@/features/groups/api';
import { GroupIcon } from '@/features/groups/GroupIcon';
import { statsQueryOptions } from '@/features/profile/stats';
import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import { styles } from './GroupRankingsCard.styles';

export function GroupRankingsCard({ userId }: { userId: number }) {
  const router = useRouter();
  const groups = useQuery(groupsQueryOptions());
  const memberIds = [
    ...new Set(
      (groups.data ?? []).flatMap((group) =>
        group.members.map((member) => member.id),
      ),
    ),
  ];
  const stats = useQueries({
    queries: memberIds.map((id) => statsQueryOptions(id, 'weekly')),
  });
  const ratings = new Map(
    memberIds.map((id, index) => [
      id,
      stats[index].data?.source === 'period'
        ? (stats[index].data.values?.rating ?? null)
        : null,
    ]),
  );

  if (groups.isPending) {
    return <ActivityIndicator color={colors.primary} />;
  }
  if (groups.isError) {
    return (
      <Pressable onPress={() => void groups.refetch()}>
        <Text style={styles.message}>
          {getApiErrorMessage(groups.error)} Toque para tentar novamente.
        </Text>
      </Pressable>
    );
  }
  if (!groups.data.length) {
    return (
      <Pressable
        onPress={() => router.push('/(tabs)/groups')}
        style={styles.empty}
      >
        <Feather name="plus-circle" color={colors.primary} size={24} />
        <Text style={styles.message}>
          Crie ou entre em um grupo para disputar rankings.
        </Text>
      </Pressable>
    );
  }

  return (
    <>
      {groups.data.slice(0, 3).map((group) => {
        const ranked = [...group.members]
          .filter((member) => ratings.get(member.id) !== null)
          .sort(
            (a, b) => (ratings.get(b.id) ?? -1) - (ratings.get(a.id) ?? -1),
          );
        const leader = ranked[0];
        const myPosition = ranked.findIndex((member) => member.id === userId);
        return (
          <Pressable
            key={group.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ranking de ${group.name}`}
            onPress={() => router.push(`/group/${group.id}`)}
            style={styles.row}
          >
            <View style={styles.groupIcon}>
              <GroupIcon name={group.icon} size={22} />
            </View>
            <View style={styles.text}>
              <Text numberOfLines={1} style={styles.name}>
                {group.name}
              </Text>
              <Text numberOfLines={1} style={styles.detail}>
                {leader
                  ? `Líder: ${leader.display_name} · ${ratings.get(leader.id)?.toFixed(2)}`
                  : 'Aguardando estatísticas semanais'}
              </Text>
            </View>
            {myPosition >= 0 && (
              <View style={styles.position}>
                <Text style={styles.positionValue}>{myPosition + 1}º</Text>
                <Text style={styles.positionLabel}>VOCÊ</Text>
              </View>
            )}
            <Feather name="chevron-right" color={colors.muted} size={18} />
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/groups')}
        style={styles.link}
      >
        <Text style={styles.linkText}>
          {groups.data.length > 3
            ? `Ver todos os ${groups.data.length} grupos`
            : 'Abrir grupos'}
        </Text>
      </Pressable>
    </>
  );
}
