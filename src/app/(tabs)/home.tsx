import { HomeScreen } from '@/features/home/HomeScreen';
import { useAuthStore } from '@/stores/authStore';

export default function HomeRoute() {
  const userId = useAuthStore((state) => state.userId);
  return userId ? <HomeScreen userId={userId} /> : null;
}
