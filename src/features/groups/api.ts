import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export const groupIcons = [
  'target',
  'crosshair',
  'shield',
  'skull',
  'trophy',
  'flame',
  'crown',
  'swords',
  'users',
  'bomb',
  'zap',
  'award',
] as const;
export type GroupIconName = (typeof groupIcons)[number];

export const groupUserSchema = z.object({
  id: z.number().int().positive(),
  display_name: z.string(),
  avatar: z.string().url().nullable(),
});

export const groupSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  icon: z.enum(groupIcons),
  is_owner: z.boolean(),
  owner: groupUserSchema,
  members_count: z.number().int().positive(),
  members: z.array(groupUserSchema),
  created_at: z.string(),
});

const groupsResponseSchema = z.object({ data: z.array(groupSchema) });
const groupResponseSchema = z.object({ data: groupSchema });
const candidatesResponseSchema = z.object({ data: z.array(groupUserSchema) });

export type Group = z.infer<typeof groupSchema>;
export type GroupUser = z.infer<typeof groupUserSchema>;

export const groupsQueryOptions = () =>
  queryOptions({
    queryKey: ['groups'],
    queryFn: async ({ signal }) =>
      groupsResponseSchema.parse(
        (await api.get<unknown>(endpoints.groups, { signal })).data,
      ).data,
  });

export const groupQueryOptions = (groupId: number) =>
  queryOptions({
    queryKey: ['groups', groupId],
    queryFn: async ({ signal }) =>
      groupResponseSchema.parse(
        (await api.get<unknown>(endpoints.group(groupId), { signal })).data,
      ).data,
  });

export const groupCandidatesQueryOptions = () =>
  queryOptions({
    queryKey: ['groups', 'candidates'],
    queryFn: async ({ signal }) =>
      candidatesResponseSchema.parse(
        (await api.get<unknown>(endpoints.groupCandidates, { signal })).data,
      ).data,
  });

export async function createGroup(name: string, icon: GroupIconName) {
  return groupResponseSchema.parse(
    (await api.post<unknown>(endpoints.groups, { name, icon })).data,
  ).data;
}

export async function updateGroup(
  groupId: number,
  input: { name?: string; icon?: GroupIconName },
) {
  return groupResponseSchema.parse(
    (await api.patch<unknown>(endpoints.group(groupId), input)).data,
  ).data;
}

export async function addGroupMember(groupId: number, userId: number) {
  return groupResponseSchema.parse(
    (
      await api.post<unknown>(endpoints.groupMembers(groupId), {
        user_id: userId,
      })
    ).data,
  ).data;
}

export async function removeGroupMember(groupId: number, userId: number) {
  return groupResponseSchema.parse(
    (await api.delete<unknown>(endpoints.groupMember(groupId, userId))).data,
  ).data;
}

export async function deleteGroup(groupId: number) {
  await api.delete(endpoints.group(groupId));
}
