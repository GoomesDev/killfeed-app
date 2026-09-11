import Feather from '@expo/vector-icons/Feather';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '@/theme';

import { styles } from './DashboardCard.styles';

import type { ReactNode } from 'react';

export function DashboardCard({
  title,
  subtitle,
  icon,
  leading,
  children,
  editing,
  onPress,
  onDrop,
  onLayout,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  leading?: ReactNode;
  children: ReactNode;
  editing: boolean;
  onPress: () => void;
  onDrop: (translationY: number) => void;
  onLayout: (y: number, height: number) => void;
}) {
  const translateY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const pan = Gesture.Pan()
    .enabled(editing)
    .activateAfterLongPress(120)
    .onBegin(() => {
      dragging.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onFinalize((event) => {
      dragging.value = false;
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      runOnJS(onDrop)(event.translationY);
    });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: dragging.value ? 20 : 0,
    opacity: dragging.value ? 0.92 : 1,
  }));

  return (
    <Animated.View
      onLayout={(event) =>
        onLayout(event.nativeEvent.layout.y, event.nativeEvent.layout.height)
      }
      style={[styles.card, editing && styles.editing, animatedStyle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${title}`}
        accessibilityState={{ disabled: editing }}
        onPress={editing ? undefined : onPress}
        style={styles.touchArea}
      >
        <View style={styles.header}>
          {leading ?? (
            <View style={styles.icon}>
              <Feather name={icon} color={colors.primary} size={20} />
            </View>
          )}
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {editing ? (
            <GestureDetector gesture={pan}>
              <Animated.View
                accessibilityRole="adjustable"
                accessibilityLabel={`Arrastar ${title}`}
                style={styles.handle}
              >
                <Feather name="menu" color={colors.text} size={24} />
              </Animated.View>
            </GestureDetector>
          ) : (
            <Feather name="chevron-right" color={colors.muted} size={22} />
          )}
        </View>
        <View pointerEvents={editing ? 'auto' : 'none'}>{children}</View>
      </Pressable>
    </Animated.View>
  );
}
