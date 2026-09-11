import Feather from '@expo/vector-icons/Feather';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import {
  createGroup,
  groupsQueryOptions,
  type Group,
  type GroupIconName,
} from './api';
import { GroupIcon, GroupIconPicker } from './GroupIcon';
import { styles } from './GroupsScreen.styles';

export function GroupsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery(groupsQueryOptions());
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<GroupIconName>('target');
  const mutation = useMutation({
    mutationFn: () => createGroup(name.trim(), icon),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      setName('');
      setIcon('target');
      setModalOpen(false);
      router.push(`/group/${group.id}`);
    },
  });

  const renderGroup = ({ item }: { item: Group }) => (
    <GroupCard group={item} onPress={() => router.push(`/group/${item.id}`)} />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={query.data ?? []}
        keyExtractor={(group) => String(group.id)}
        renderItem={renderGroup}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SEU TIME, SUAS REGRAS</Text>
            <View style={styles.titleRow}>
              <Text accessibilityRole="header" style={styles.title}>
                Grupos
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Criar grupo"
                onPress={() => setModalOpen(true)}
                style={styles.createButton}
              >
                <Feather name="plus" color={colors.onPrimary} size={20} />
                <Text style={styles.createText}>Criar</Text>
              </Pressable>
            </View>
            <Text style={styles.description}>
              Monte seu lobby com amigos do Killfeed e acompanhe quem domina a
              disputa.
            </Text>
          </View>
        }
        ListEmptyComponent={
          query.isPending ? (
            <ActivityIndicator style={styles.state} color={colors.primary} />
          ) : query.isError ? (
            <View style={styles.state}>
              <Feather name="alert-circle" color={colors.primary} size={40} />
              <Text style={styles.stateTitle}>Não carregou desta vez</Text>
              <Text style={styles.stateText}>
                {getApiErrorMessage(query.error)}
              </Text>
              <Pressable
                style={styles.submit}
                onPress={() => void query.refetch()}
              >
                <Text style={styles.submitText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.state}>
              <Feather name="target" color={colors.primary} size={42} />
              <Text style={styles.stateTitle}>Crie seu primeiro grupo</Text>
              <Text style={styles.stateText}>
                Junte seus amigos e prepare a competição.
              </Text>
              <Pressable
                style={styles.submit}
                onPress={() => setModalOpen(true)}
              >
                <Text style={styles.submitText}>Criar grupo</Text>
              </Pressable>
            </View>
          )
        }
      />
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!mutation.isPending) {
            setModalOpen(false);
          }
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo grupo</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                disabled={mutation.isPending}
                onPress={() => setModalOpen(false)}
                hitSlop={12}
              >
                <Feather name="x" color={colors.muted} size={22} />
              </Pressable>
            </View>
            <Text style={styles.label}>Nome do grupo</Text>
            <TextInput
              accessibilityLabel="Nome do grupo"
              value={name}
              onChangeText={(value) => {
                setName(value);
                mutation.reset();
              }}
              maxLength={50}
              autoFocus
              placeholder="Ex.: Clutch Squad"
              placeholderTextColor={colors.muted}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (name.trim().length >= 3 && !mutation.isPending) {
                  mutation.mutate();
                }
              }}
            />
            <Text style={styles.counter}>{name.length}/50</Text>
            <GroupIconPicker
              value={icon}
              onChange={(value) => {
                setIcon(value);
                mutation.reset();
              }}
            />
            {mutation.isError && (
              <Text accessibilityLiveRegion="polite" style={styles.error}>
                {getApiErrorMessage(mutation.error)}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: name.trim().length < 3 || mutation.isPending,
                busy: mutation.isPending,
              }}
              disabled={name.trim().length < 3 || mutation.isPending}
              onPress={() => mutation.mutate()}
              style={[
                styles.submit,
                (name.trim().length < 3 || mutation.isPending) &&
                  styles.disabled,
              ]}
            >
              {mutation.isPending ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.submitText}>Criar grupo</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, ${group.members_count} membros`}
      style={[styles.card, pressed && styles.pressed]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={styles.cardIcon}>
        <GroupIcon name={group.icon} size={26} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={styles.cardDetail} numberOfLines={2}>
          {group.members_count}{' '}
          {group.members_count === 1 ? 'competidor' : 'competidores'} ·{' '}
          {group.is_owner
            ? 'Criado por você'
            : `Dono: ${group.owner.display_name}`}
        </Text>
      </View>
      <Feather name="chevron-right" color={colors.muted} size={20} />
    </Pressable>
  );
}
