import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

const friendSchema = z.object({
  steam_id: z.string().regex(/^\d{17}$/),
  friend_since: z.number().int().nonnegative(),
  display_name: z.string().nullable(),
  avatar: z.string().url().nullable(),
  profile_url: z.string().url().nullable(),
  uses_killfeed: z.boolean(),
  user_id: z.number().int().positive().nullable(),
});

export const friendsResponseSchema = z.object({
  data: z.array(friendSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    killfeed_count: z.number().int().nonnegative(),
    fetched_at: z.string(),
    profiles_complete: z.boolean(),
  }),
});

export type Friend = z.infer<typeof friendSchema>;

export const friendsQueryOptions = () => queryOptions({
  queryKey: ['friends'],
  queryFn: async ({ signal }) => {
    const response = await api.get<unknown>(endpoints.friends, { signal });
    return friendsResponseSchema.parse(response.data);
  },
  staleTime: 5 * 60 * 1000,
});
