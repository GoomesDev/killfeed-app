import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from '@/theme';

import { groupIcons, type GroupIconName } from './api';
import { styles } from './GroupIcon.styles';

const iconMap: Record<
  GroupIconName,
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  target: 'target',
  crosshair: 'crosshairs',
  shield: 'shield-outline',
  skull: 'skull-outline',
  trophy: 'trophy-outline',
  flame: 'fire',
  crown: 'crown-outline',
  swords: 'sword-cross',
  users: 'account-group-outline',
  bomb: 'bomb',
  zap: 'lightning-bolt-outline',
  award: 'medal-outline',
};

const labels: Record<GroupIconName, string> = {
  target: 'Alvo',
  crosshair: 'Mira',
  shield: 'Escudo',
  skull: 'Caveira',
  trophy: 'Troféu',
  flame: 'Fogo',
  crown: 'Coroa',
  swords: 'Espadas',
  users: 'Time',
  bomb: 'Bomba',
  zap: 'Raio',
  award: 'Medalha',
};

export function GroupIcon({
  name,
  size = 24,
  color = colors.primary,
}: {
  name: GroupIconName;
  size?: number;
  color?: string;
}) {
  return (
    <MaterialCommunityIcons name={iconMap[name]} size={size} color={color} />
  );
}

export function GroupIconPicker({
  value,
  onChange,
}: {
  value: GroupIconName;
  onChange: (icon: GroupIconName) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Ícone do grupo</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {groupIcons.map((icon) => {
          const selected = icon === value;
          return (
            <Pressable
              key={icon}
              accessibilityRole="button"
              accessibilityLabel={labels[icon]}
              accessibilityState={{ selected }}
              onPress={() => onChange(icon)}
              style={[styles.option, selected && styles.selected]}
            >
              <GroupIcon
                name={icon}
                size={25}
                color={selected ? colors.onPrimary : colors.text}
              />
              <Text
                style={[styles.optionText, selected && styles.selectedText]}
              >
                {labels[icon]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
