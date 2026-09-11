import AsyncStorage from '@react-native-async-storage/async-storage';

export const dashboardCardIds = [
  'my-stats',
  'activity-feed',
  'group-rankings',
] as const;
export type DashboardCardId = (typeof dashboardCardIds)[number];
const storageKey = 'killfeed.dashboard.order.v1';

export async function loadDashboardOrder(): Promise<DashboardCardId[]> {
  const saved = await AsyncStorage.getItem(storageKey);
  if (!saved) {
    return [...dashboardCardIds];
  }
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [...dashboardCardIds];
    }
    const known = parsed.filter((id): id is DashboardCardId =>
      dashboardCardIds.includes(id as DashboardCardId),
    );
    return [...new Set([...known, ...dashboardCardIds])];
  } catch {
    return [...dashboardCardIds];
  }
}

export async function saveDashboardOrder(order: DashboardCardId[]) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(order));
}
