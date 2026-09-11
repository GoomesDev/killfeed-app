import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileQueryOptions } from './api';
import { statsQueryOptions } from './stats';
import { StatsGrid } from './StatsGrid';
import { type StatsPeriod } from './stats-contract';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/api/errors';
import { colors, radius, spacing, typography } from '@/theme';

export function ProfileScreen({ userId, ownProfile = true }: { userId: number; ownProfile?: boolean }) {
  const [careerOpen, setCareerOpen] = useState(false);
  const [period, setPeriod] = useState<StatsPeriod>('weekly');
  const profile = useQuery(profileQueryOptions(userId));
  const stats = useQuery(statsQueryOptions(userId, period));
  const values = stats.data?.source === 'period' ? stats.data.values : null;
  const latest = stats.data?.latest_snapshot;
  const formatDate = (date: string) => date.split('-').reverse().join('/');
  return (
    <Screen edges={['top', 'left', 'right']}>
      <Text style={styles.label}>{ownProfile ? 'SEU PERFIL' : 'PERFIL DO JOGADOR'}</Text>
      {profile.isPending ? <ActivityIndicator color={colors.primary} /> : profile.isError ? (
        <View style={styles.section}>
          <Text style={styles.body}>{getApiErrorMessage(profile.error)}</Text>
          <Button title="Tentar novamente" onPress={() => void profile.refetch()} />
        </View>
      ) : (
        <View style={styles.header}>
          {profile.data.avatar ? <Image source={{ uri: profile.data.avatar }} style={styles.avatar} accessibilityLabel="Avatar Steam" /> :
            <View style={styles.avatar}><Text style={styles.title}>{profile.data.display_name.slice(0, 1)}</Text></View>}
          <Text accessibilityRole="header" style={styles.title}>{profile.data.display_name || profile.data.username}</Text>
          <Text style={styles.body}>COUNTER-STRIKE 2</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.heading}>Suas estatísticas</Text>
        <View style={styles.periodSelector}>
          {([{ key: 'daily', label: 'Diário' }, { key: 'weekly', label: 'Semanal' }] as const).map(option => (
            <Pressable key={option.key} accessibilityRole="tab" accessibilityLabel={`Estatísticas: ${option.label}`}
              accessibilityState={{ selected: period === option.key }} onPress={() => setPeriod(option.key)}
              style={[styles.periodButton, period === option.key && styles.periodButtonSelected]}>
              <Text style={[styles.periodLabel, period === option.key && styles.periodLabelSelected]}>{option.label}</Text>
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" accessibilityLabel="Carreira: abrir histórico total"
            onPress={() => setCareerOpen(true)} style={styles.periodButton}>
            <Text style={styles.periodLabel}>Carreira ↗</Text>
          </Pressable>
        </View>
        {stats.isPending ? <ActivityIndicator color={colors.primary} /> : stats.isError ? (
          <View style={styles.section}>
            <Text style={styles.body}>{getApiErrorMessage(stats.error)}</Text>
            <Button title="Atualizar estatísticas" loading={stats.isFetching} onPress={() => void stats.refetch()} />
          </View>
        ) : (
          <>
            {stats.data?.source === 'period' && stats.data.period && (
              <>
                <Text style={styles.body}>{formatDate(stats.data.period.start_date)} a {formatDate(stats.data.period.end_date)} · intervalo observado</Text>
                {stats.data.status === 'fallback' && <Text style={styles.body}>Último período disponível. Ainda não há comparação para o período atual.</Text>}
                {values?.matches === 0 && <Text style={styles.body}>Nenhuma partida registrada neste intervalo.</Text>}
              </>
            )}
            {stats.data?.source === 'lifetime' && (
              <>
                <Text style={styles.body}>Ainda não há histórico suficiente para calcular o desempenho {period === 'daily' ? 'diário' : 'semanal'}. Toque em Carreira para ver seu histórico total.</Text>
              </>
            )}
            {stats.data?.source === 'empty' && <Text style={styles.body}>Suas estatísticas ainda não foram sincronizadas. Elas aparecerão aqui após a primeira sincronização.</Text>}
            {values && <StatsGrid values={values} />}
          </>
        )}
      </View>
      <Modal visible={careerOpen} animationType="slide" presentationStyle="pageSheet"
        onRequestClose={() => setCareerOpen(false)}>
        <SafeAreaView style={styles.careerContainer}>
          <ScrollView style={styles.careerScroll} contentContainerStyle={styles.careerContent}>
          <View style={styles.section}>
            <Text style={styles.label}>HISTÓRICO TOTAL</Text>
            <Text accessibilityRole="header" style={styles.heading}>Sua carreira no CS2</Text>
            <Text style={styles.body}>Estatísticas acumuladas na Steam.</Text>
            {latest ? <>
              <Text style={styles.body}>Atualizado até {formatDate(latest.snapshot_date)}</Text>
              <StatsGrid values={latest} />
            </> : stats.isPending ? <ActivityIndicator color={colors.primary} /> : <>
              <Text style={styles.body}>{stats.isError ? getApiErrorMessage(stats.error) : 'Seu histórico aparecerá após a primeira sincronização.'}</Text>
              <Button title="Tentar novamente" loading={stats.isFetching} onPress={() => void stats.refetch()} />
            </>}
          </View>
          </ScrollView>
          <View style={styles.careerFooter}>
            <Button title="Fechar" onPress={() => setCareerOpen(false)} />
          </View>
        </SafeAreaView>
      </Modal>
      <Button title={ownProfile ? 'Atualizar perfil' : 'Atualizar dados'} loading={profile.isFetching || stats.isFetching}
        onPress={() => { void profile.refetch(); void stats.refetch(); }} />
    </Screen>
  );
}
const styles = StyleSheet.create({
  careerContainer: { flex: 1, backgroundColor: colors.background },
  careerScroll: { flex: 1 },
  careerContent: { paddingHorizontal: spacing.lg, width: '100%', maxWidth: 560, alignSelf: 'center' },
  careerFooter: { padding: spacing.lg, width: '100%', maxWidth: 560, alignSelf: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.secondarySurface },
  periodSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, padding: spacing.xs, backgroundColor: colors.surface, borderRadius: radius.md },
  periodButton: { flex: 1, minWidth: 88, minHeight: 52, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  periodButtonSelected: { backgroundColor: colors.primary },
  periodLabel: { color: colors.muted, fontFamily: typography.semibold, fontSize: typography.size.body },
  periodLabelSelected: { color: colors.onPrimary, fontFamily: typography.bold },
  label: { color: colors.primary, fontFamily: typography.bold, marginBottom: spacing.lg },
  header: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: typography.size.title, textAlign: 'center' },
  heading: { color: colors.text, fontFamily: typography.bold, fontSize: 22 },
  body: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.small, lineHeight: 20 },
  section: { gap: spacing.md, marginVertical: spacing.lg },
});
