import { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { colors } from '@/theme';

import { styles } from './Button.styles';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export function Button({
  title,
  onPress,
  disabled,
  loading,
  accessibilityHint,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: Boolean(unavailable),
        busy: Boolean(loading),
      }}
      disabled={unavailable}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        unavailable && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </Pressable>
  );
}
