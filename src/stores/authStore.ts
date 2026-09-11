import { create } from 'zustand';

export const useAuthStore = create<{
  status: 'restoring' | 'idle' | 'opening' | 'exchanging' | 'authenticated';
  message: string | null;
  userId: number | null;
}>(() => ({ status: 'restoring', message: null, userId: null }));
