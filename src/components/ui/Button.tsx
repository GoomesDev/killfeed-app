import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export function Button({ title, onPress, disabled, loading, accessibilityHint }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(unavailable), busy: Boolean(loading) }}
      disabled={unavailable}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.button, unavailable && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.title}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 56, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.onPrimary, fontFamily: typography.bold, fontSize: typography.size.body },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
