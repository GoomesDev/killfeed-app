import Feather from '@expo/vector-icons/Feather';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/lib/api/errors';
import { colors } from '@/theme';

import {
  addGroupMember,
  deleteGroup,
  groupCandidatesQueryOptions,
  groupQueryOptions,
  removeGroupMember,
  updateGroup,
  type Group,
  type GroupIconName,
  type GroupUser,
} from './api';
import { styles } from './GroupAdminScreen.styles';
import { GroupIconPicker } from './GroupIcon';

export function GroupAdminScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = Number(params.id);
  const router = useRouter();
  const group = useQuery({
    ...groupQueryOptions(groupId),
    enabled: Number.isInteger(groupId) && groupId > 0,
  });

  if (!Number.isInteger(groupId) || groupId <= 0) {
    return <Redirect href="/(tabs)/groups" />;
  }
  if (group.isPending) {
    return <LoadingState />;
  }
  if (group.isError || !group.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(group.error)}
        onBack={() => router.back()}
      />
    );
  }
  if (!group.data.is_owner) {
    return <Redirect href={`/group/${groupId}`} />;
  }

  return <AdminContent group={group.data} />;
}

function AdminContent({ group }: { group: Group }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const candidates = useQuery(groupCandidatesQueryOptions());
  const [name, setName] = useState(group.name);
  const [icon, setIcon] = useState<GroupIconName>(group.icon);
  const refresh = (data: Group) => {
    queryClient.setQueryData(['groups', group.id], data);
    void queryClient.invalidateQueries({ queryKey: ['groups'] });
  };
  const add = useMutation({
    mutationFn: (userId: number) => addGroupMember(group.id, userId),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (userId: number) => removeGroupMember(group.id, userId),
    onSuccess: refresh,
  });
  const destroy = useMutation({
    mutationFn: () => deleteGroup(group.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.replace('/(tabs)/groups');
    },
  });
  const update = useMutation({
    mutationFn: () => updateGroup(group.id, { name: name.trim(), icon }),
    onSuccess: refresh,
  });
  const memberIds = new Set(group.members.map((member) => member.id));
  const available = (candidates.data ?? []).filter(
    (candidate) => !memberIds.has(candidate.id),
  );
  const error = update.error ?? add.error ?? remove.error ?? destroy.error;
  const unchanged = name.trim() === group.name && icon === group.icon;

  const memberRow = ({ item }: { item: GroupUser }) => (
    <PersonRow
      person={item}
      detail={item.id === group.owner.id ? 'Criador do grupo' : 'Membro'}
      action={
        item.id === group.owner.id ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remover ${item.display_name}`}
            disabled={remove.isPending}
            onPress={() => remove.mutate(item.id)}
            style={styles.iconButton}
          >
            {remove.isPending && remove.variables === item.id ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Feather name="user-minus" color={colors.primary} size={20} />
            )}
          </Pressable>
        )
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={group.members}
        keyExtractor={(member) => String(member.id)}
        renderItem={memberRow}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <TopBar title="Administrar grupo" onBack={() => router.back()} />
            <View style={styles.notice}>
              <Feather name="shield" size={19} color={colors.primary} />
              <Text style={styles.noticeText}>
                Somente você, criador do grupo, pode fazer estas alterações.
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Identidade do grupo</Text>
            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              accessibilityLabel="Nome do grupo"
              value={name}
              maxLength={50}
              onChangeText={(value) => {
                setName(value);
                update.reset();
              }}
              style={styles.input}
              placeholderTextColor={colors.muted}
            />
            <Text style={styles.counter}>{name.length}/50</Text>
            <GroupIconPicker
              value={icon}
              onChange={(value) => {
                setIcon(value);
                update.reset();
              }}
            />
            <Pressable
              accessibilityRole="button"
              disabled={name.trim().length < 3 || unchanged || update.isPending}
              onPress={() => update.mutate()}
              style={[
                styles.saveButton,
                (name.trim().length < 3 || unchanged || update.isPending) &&
                  styles.disabled,
              ]}
            >
              {update.isPending ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.saveText}>Salvar alterações</Text>
              )}
            </Pressable>
            {error && (
              <Text style={styles.error}>{getApiErrorMessage(error)}</Text>
            )}
            <Text style={styles.sectionTitle}>
              Membros · {group.members_count}/50
            </Text>
          </>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Adicionar amigos</Text>
            {group.members_count >= 50 ? (
              <Text style={styles.stateText}>
                O grupo atingiu o limite de 50 membros.
              </Text>
            ) : candidates.isPending ? (
              <ActivityIndicator color={colors.primary} />
            ) : candidates.isError ? (
              <RetryState
                message={getApiErrorMessage(candidates.error)}
                onRetry={() => void candidates.refetch()}
              />
            ) : available.length === 0 ? (
              <Text style={styles.stateText}>
                Não há outros amigos do Killfeed disponíveis.
              </Text>
            ) : (
              available.map((friend) => (
                <PersonRow
                  key={friend.id}
                  person={friend}
                  action={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Adicionar ${friend.display_name}`}
                      disabled={add.isPending}
                      onPress={() => add.mutate(friend.id)}
                      style={styles.addButton}
                    >
                      {add.isPending && add.variables === friend.id ? (
                        <ActivityIndicator color={colors.onPrimary} />
                      ) : (
                        <>
                          <Feather
                            name="user-plus"
                            color={colors.onPrimary}
                            size={17}
                          />
                          <Text style={styles.addText}>Adicionar</Text>
                        </>
                      )}
                    </Pressable>
                  }
                />
              ))
            )}
            <Pressable
              accessibilityRole="button"
              disabled={destroy.isPending}
              style={[
                styles.deleteButton,
                destroy.isPending && styles.disabled,
              ]}
              onPress={() =>
                Alert.alert(
                  'Excluir grupo?',
                  'O grupo será removido para todos os membros.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Excluir',
                      style: 'destructive',
                      onPress: () => destroy.mutate(),
                    },
                  ],
                )
              }
            >
              {destroy.isPending ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="trash-2" color={colors.primary} size={18} />
                  <Text style={styles.deleteText}>Excluir grupo</Text>
                </>
              )}
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function PersonRow({
  person,
  detail,
  action,
}: {
  person: GroupUser;
  detail?: string;
  action: React.ReactNode;
}) {
  return (
    <View style={styles.personRow}>
      {person.avatar ? (
        <Image source={{ uri: person.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Feather name="user" color={colors.muted} size={22} />
        </View>
      )}
      <View style={styles.personText}>
        <Text numberOfLines={1} style={styles.personName}>
          {person.display_name}
        </Text>
        {detail && <Text style={styles.personDetail}>{detail}</Text>}
      </View>
      {action}
    </View>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={onBack}
        style={styles.iconButton}
      >
        <Feather name="arrow-left" color={colors.text} size={24} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}
function LoadingState() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ActivityIndicator style={styles.center} color={colors.primary} />
    </SafeAreaView>
  );
}
function ErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.center}>
        <Text style={styles.title}>Administração indisponível</Text>
        <Text style={styles.stateText}>{message}</Text>
        <Pressable style={styles.retryButton} onPress={onBack}>
          <Text style={styles.retryText}>Voltar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
function RetryState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.inlineState}>
      <Text style={styles.stateText}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}
