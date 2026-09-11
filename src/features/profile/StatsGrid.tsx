import { StyleSheet, Text, View } from 'react-native';
import type { PlayerMetrics } from './stats-contract';
import { colors, radius, spacing, typography } from '@/theme';

export function StatsGrid({ values }: { values: PlayerMetrics }) {
  const groups = [
    { title: 'Desempenho', items: [
      ['K/D', values.kd_ratio.toFixed(2)],
      ['Headshots %', `${values.headshot_percentage.toFixed(1)}%`],
      ['Taxa de vitória', `${values.win_rate.toFixed(1)}%`],
    ] },
    { title: 'Partidas e combate', items: [
      ['Partidas', values.matches], ['Vitórias', values.wins], ['Derrotas', values.losses],
      ['Rounds', values.rounds], ['Kills', values.kills], ['Deaths', values.deaths],
      ['Saldo K/D', values.kdd], ['Headshots', values.headshots], ['MVPs', values.mvps],
    ] },
    { title: 'Objetivos', items: [
      ['Bombas plantadas', values.bombs_planted], ['Bombas desarmadas', values.bombs_defused],
    ] },
    { title: 'Índices de desempenho', items: [
      ['Rating', values.rating.toFixed(2)], ['Impact score', values.impact_score.toFixed(2)],
    ] },
  ];
  return <View style={styles.groups}>{groups.map((group, index) => (
    <View key={group.title} style={styles.group}>
      <Text accessibilityRole="header" style={styles.heading}>{group.title}</Text>
      <View style={styles.grid}>{group.items.map(([label, value]) => (
        <View key={label} style={[styles.card, index === 0 && styles.featured]}>
          <Text style={[styles.value, index === 0 && styles.featuredValue]}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}</View>
    </View>
  ))}</View>;
}
const styles = StyleSheet.create({
  groups: { gap: spacing.lg },
  group: { gap: spacing.sm },
  heading: { color: colors.text, fontFamily: typography.semibold, fontSize: typography.size.body },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { flexGrow: 1, flexBasis: '45%', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, gap: spacing.sm },
  featured: { borderTopWidth: 2, borderTopColor: colors.primary },
  value: { color: colors.text, fontFamily: typography.bold, fontSize: 26, fontVariant: ['tabular-nums'] },
  featuredValue: { color: colors.primary },
  label: { color: colors.muted, fontFamily: typography.regular, fontSize: typography.size.small },
});
