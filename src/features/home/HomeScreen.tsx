import Feather from '@expo/vector-icons/Feather';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileQueryOptions } from '@/features/profile/api';
import { colors } from '@/theme';

import { ActivityFeedCard } from './ActivityFeedCard';
import {
  loadDashboardOrder,
  saveDashboardOrder,
  type DashboardCardId,
} from './dashboard';
import { DashboardCard } from './DashboardCard';
import { GroupRankingsCard } from './GroupRankingsCard';
import { styles } from './HomeScreen.styles';
import { MyStatsCard } from './MyStatsCard';

const cardMeta: Record<
  DashboardCardId,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentProps<typeof Feather>['name'];
  }
> = {
  'my-stats': {
    title: 'Seu resumo',
    subtitle: 'Desempenho desta semana',
    icon: 'activity',
  },
  'activity-feed': {
    title: 'Na resenha',
    subtitle: 'O que seus amigos estão aprontando',
    icon: 'message-circle',
  },
  'group-rankings': {
    title: 'Seus grupos',
    subtitle: 'Resumo dos rankings por rating',
    icon: 'bar-chart-2',
  },
};

function CardContent({ id, userId }: { id: DashboardCardId; userId: number }) {
  if (id === 'my-stats') {
    return <MyStatsCard userId={userId} />;
  }
  if (id === 'activity-feed') {
    return <ActivityFeedCard />;
  }
  return <GroupRankingsCard userId={userId} />;
}

export function HomeScreen({ userId }: { userId: number }) {
  const router = useRouter();
  const [order, setOrder] = useState<DashboardCardId[] | null>(null);
  const [editing, setEditing] = useState(false);
  const layouts = useRef(
    new Map<DashboardCardId, { y: number; height: number }>(),
  );
  const profile = useQuery(profileQueryOptions(userId));
  useEffect(() => {
    void loadDashboardOrder().then(setOrder);
  }, []);
  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </SafeAreaView>
    );
  }

  const drop = (id: DashboardCardId, translationY: number) => {
    const origin = layouts.current.get(id);
    if (!origin || Math.abs(translationY) < 12) {
      return;
    }
    const center = origin.y + origin.height / 2 + translationY;
    let target = id;
    let distance = Number.POSITIVE_INFINITY;
    for (const candidate of order) {
      const layout = layouts.current.get(candidate);
      if (!layout) {
        continue;
      }
      const nextDistance = Math.abs(center - (layout.y + layout.height / 2));
      if (nextDistance < distance) {
        distance = nextDistance;
        target = candidate;
      }
    }
    if (target === id) {
      return;
    }
    const next = order.filter((cardId) => cardId !== id);
    next.splice(order.indexOf(target), 0, id);
    setOrder(next);
    void saveDashboardOrder(next);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>VISÃO GERAL</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Home
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              editing ? 'Concluir organização' : 'Organizar cards'
            }
            onPress={() => setEditing((value) => !value)}
            style={[styles.editButton, editing && styles.editButtonActive]}
          >
            <Feather
              name={editing ? 'check' : 'sliders'}
              color={editing ? colors.onPrimary : colors.text}
              size={18}
            />
            <Text style={[styles.editText, editing && styles.editTextActive]}>
              {editing ? 'Concluir' : 'Organizar'}
            </Text>
          </Pressable>
        </View>
        {editing && (
          <Text style={styles.hint}>
            Segure a alça do card e arraste para escolher a ordem. A preferência
            fica salva neste aparelho.
          </Text>
        )}
        <View style={styles.cards}>
          {order.map((id) => {
            const meta = cardMeta[id];
            const avatar =
              id === 'my-stats' ? (
                profile.data?.avatar ? (
                  <Image
                    source={{ uri: profile.data.avatar }}
                    accessibilityLabel="Seu avatar Steam"
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Feather name="user" color={colors.primary} size={21} />
                  </View>
                )
              ) : undefined;
            const destination =
              id === 'my-stats'
                ? '/(tabs)/profile'
                : id === 'activity-feed'
                  ? '/(tabs)/feed'
                  : '/(tabs)/groups';
            return (
              <DashboardCard
                key={id}
                {...meta}
                leading={avatar}
                editing={editing}
                onPress={() => router.push(destination)}
                onDrop={(translationY) => drop(id, translationY)}
                onLayout={(y, height) => layouts.current.set(id, { y, height })}
              >
                <CardContent id={id} userId={userId} />
              </DashboardCard>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
