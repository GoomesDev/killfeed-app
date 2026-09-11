import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { statsQueryOptions } from '@/features/profile/stats';
import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import { styles } from './MyStatsCard.styles';

export function MyStatsCard({ userId }: { userId: number }) {
  const router = useRouter();
  const query = useQuery(statsQueryOptions(userId, 'weekly'));
  const stats = query.data?.source === 'period' ? query.data.values : null;
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
  if (!stats) {
    return (
      <Text style={styles.message}>
        Suas estatísticas aparecerão depois da primeira sincronização.
      </Text>
    );
  }
  return (
    <>
      <View style={styles.grid}>
        <Metric value={stats.rating.toFixed(2)} label="Rating" />
        <Metric value={String(stats.kills)} label="Kills" />
        <Metric value={stats.kd_ratio.toFixed(2)} label="K/D" />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/profile')}
        style={styles.link}
      >
        <Text style={styles.linkText}>Ver estatísticas completas</Text>
      </Pressable>
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
