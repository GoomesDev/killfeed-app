import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

// UsersController::getProfile returns the model directly, without a data envelope.
export const profileSchema = z.object({
  id: z.number().int().positive(),
  steam_id: z.string(),
  username: z.string().nullable(),
  profile_url: z.string().nullable(),
  display_name: z.string(),
  avatar: z.string().nullable(),
  is_active: z.boolean(),
  last_sync_at: z.string().nullable(),
});

export type ProfileDto = z.infer<typeof profileSchema>;

export function profileQueryOptions(userId: number) {
  return queryOptions({
    queryKey: ['profile', userId],
    queryFn: async ({ signal }) => {
      z.number().int().positive().parse(userId);
      const response = await api.get<unknown>(endpoints.profile(userId), {
        signal,
      });
      return profileSchema.parse(response.data);
    },
  });
}
