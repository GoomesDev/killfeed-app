import { z } from 'zod';

export type StatsPeriod = 'daily' | 'weekly';
// Stored Laravel decimals are strings; calculated period metrics are numbers.
const decimal = z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/).transform(Number)]).pipe(z.number().finite());
const metrics = z.object({
  kills: z.number(), deaths: z.number(), mvps: z.number(), bombs_planted: z.number(),
  bombs_defused: z.number(), headshots: z.number(), matches: z.number(), wins: z.number(),
  losses: z.number(), rounds: z.number(), kd_ratio: decimal, win_rate: decimal,
  headshot_percentage: decimal, rating: decimal, impact_score: decimal, kdd: z.number(),
});
export type PlayerMetrics = z.infer<typeof metrics>;

const dates = z.object({ start_date: z.string(), end_date: z.string() });
const common = z.object({
  status: z.enum(['available', 'fallback', 'insufficient_data', 'empty']),
  requested_period: dates,
  period: dates.extend({ days_between: z.number() }).nullable(),
  latest_snapshot: metrics.extend({ snapshot_date: z.string() }).nullable(),
});
export const dailyStatsSchema = common.extend({ daily_stats: metrics.nullable() });
export const weeklyStatsSchema = common.extend({ weekly_stats: metrics.nullable() });

export function parseStats(payload: unknown, period: StatsPeriod) {
  const result = period === 'daily' ? dailyStatsSchema.parse(payload) : weeklyStatsSchema.parse(payload);
  const periodMetrics = 'daily_stats' in result ? result.daily_stats : result.weekly_stats;
  return {
    ...result,
    values: periodMetrics ?? result.latest_snapshot,
    source: periodMetrics ? 'period' as const : result.latest_snapshot ? 'lifetime' as const : 'empty' as const,
  };
}
