import { infiniteQueryOptions } from '@tanstack/react-query';
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
    current_page: z.number().int().positive(),
    per_page: z.literal(25),
    last_page: z.number().int().positive(),
    has_more: z.boolean(),
  }),
});

export type Friend = z.infer<typeof friendSchema>;

export const friendsQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: ['friends'],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const response = await api.get<unknown>(endpoints.friends, {
        params: { page: pageParam },
        signal,
      });
      return friendsResponseSchema.parse(response.data);
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_more ? lastPage.meta.current_page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });
