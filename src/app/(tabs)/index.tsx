import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../constants/theme';
import { useTasks } from '../../hooks/useTasks';
import { useStreak } from '../../hooks/useStreaks';
import { scoreAndSort } from '../../lib/sorting';
import { TaskCard } from '../../components/TaskCard';
import { QuickWinCard } from '../../components/QuickWinCard';

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, loading, refreshTasks, updateCompletion } = useTasks();
  const { meta, refreshStreak } = useStreak();

  useFocusEffect(
    React.useCallback(() => {
      refreshTasks().then(() => refreshStreak(tasks));
    }, [])
  );

  React.useEffect(() => {
    if (tasks.length > 0) refreshStreak(tasks);
  }, [tasks]);

  const active = tasks.filter(t => t.completion < 100);
  const scored = scoreAndSort(active);
  const top3   = scored.slice(0, 3);

  const allOverdue = top3.length > 0 && top3.every(s => s.urgencyBucket === 'overdue');

  const now = new Date();
  const overloadCount = active.filter(t => {
    const diff = new Date(t.deadline).getTime() - now.getTime();
    return diff >= 0 && diff <= 1000 * 60 * 60 * 24;
  }).length;

  const quickWin = active.find(t => t.difficulty <= 2 && t.completion < 100);

  const sectionTitle = allOverdue
    ? "You're behind — one thing at a time."
    : "Today's Focus";

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshTasks}
          tintColor={colors.accent}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.wordmark}>PrioTask</Text>
        <View style={styles.headerRight}>
          {meta && meta.currentStreak >= 2 && (
            <Text style={styles.streak}>Day {meta.currentStreak} 🔥</Text>
          )}
          <Pressable onPress={() => router.push('/add-task')} hitSlop={10}>
            <Ionicons name="add" size={26} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {overloadCount >= 3 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Heavy day ahead. Pick one and start.
          </Text>
        </View>
      )}

      {top3.length > 0 ? (
        <>
          <Text style={[typography.sectionLabel, styles.sectionLabel]}>
            {sectionTitle.toUpperCase()}
          </Text>
          {top3.map(scored => (
            <TaskCard
              key={scored.task.id}
              scoredTask={scored}
              allTasks={tasks}
              onProgressUpdate={updateCompletion}
              onPress={() => router.push({ pathname: '/add-task', params: { id: scored.task.id } })}
            />
          ))}
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No active tasks. Add one to get started.</Text>
        </View>
      )}

      {quickWin && (
        <>
          <Text style={[typography.sectionLabel, styles.sectionLabel]}>QUICK WIN</Text>
          <QuickWinCard
            task={quickWin}
            onProgressUpdate={updateCompletion}
            onPress={() => router.push({ pathname: '/add-task', params: { id: quickWin.id } })}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streak: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginBottom: 10,
    marginTop: 4,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});