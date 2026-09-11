import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { useAuthStore } from '@/stores/authStore';

export default function ProfileRoute() {
  const userId = useAuthStore(state => state.userId);
  return userId ? <ProfileScreen userId={userId} /> : null;
}
