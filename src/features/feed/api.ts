import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

const actorSchema = z.object({
  id: z.number().int().positive(),
  display_name: z.string(),
  avatar: z.string().nullable(),
});
const feedItemSchema = z.object({
  id: z.number().int().positive(),
  type: z.string(),
  actor: actorSchema,
  period: z.enum(['daily', 'weekly']).nullable(),
  payload: z.record(z.string(), z.unknown()),
  occurred_at: z.string(),
});
const feedResponseSchema = z.object({
  data: z.array(feedItemSchema),
  meta: z.object({
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
  links: z.object({
    first: z.string().nullable(),
    last: z.string().nullable(),
    prev: z.string().nullable(),
    next: z.string().nullable(),
  }),
});

export type FeedItem = z.infer<typeof feedItemSchema>;
async function fetchFeed(page: number, signal?: AbortSignal) {
  return feedResponseSchema.parse(
    (await api.get<unknown>(endpoints.feed, { params: { page }, signal })).data,
  );
}
export const feedQueryOptions = (page = 1) =>
  queryOptions({
    queryKey: ['feed', page],
    queryFn: ({ signal }) => fetchFeed(page, signal),
  });

export const feedInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: ['feed', 'infinite'],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchFeed(pageParam, signal),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
  });
