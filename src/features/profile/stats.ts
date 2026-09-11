import { queryOptions } from '@tanstack/react-query';
import { parseStats, type StatsPeriod } from './stats-contract';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export function statsQueryOptions(userId: number, period: StatsPeriod) {
  return queryOptions({
    queryKey: ['player-stats', userId, period],
    queryFn: async ({ signal }) => {
      const path = period === 'daily' ? endpoints.dailyStats(userId) : endpoints.weeklyStats(userId);
      const response = await api.get<unknown>(path, { signal });
      return parseStats(response.data, period);
    },
  });
}
