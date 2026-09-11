// Paths relative to EXPO_PUBLIC_API_URL (Laravel origin, without /api).
// Only routes confirmed in the Laravel source belong here.
export const endpoints = {
  friends: '/api/friends',
  feed: '/api/feed',
  syncFriends: '/api/friends/sync',
  groups: '/api/groups',
  group: (groupId: number) => `/api/groups/${groupId}`,
  groupCandidates: '/api/groups/candidates',
  groupMembers: (groupId: number) => `/api/groups/${groupId}/members`,
  groupMember: (groupId: number, userId: number) =>
    `/api/groups/${groupId}/members/${userId}`,
  dailyStats: (userId: number) => `/api/player-stats/daily-snapshot/${userId}`,
  weeklyStats: (userId: number) =>
    `/api/player-stats/weekly-snapshot/${userId}`,
  steamExchange: '/api/auth/steam/exchange',
  steamRedirect: '/auth/steam/redirect',
  steamCallback: '/auth/steam/callback',
  profile: (userId: number) => `/api/get-profile/${userId}`,
} as const;
