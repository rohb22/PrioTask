import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, typography, radius } from '../../constants/theme';
import { useTasks } from '../../hooks/useTasks';
import { scoreAndSort, sortByField } from '../../lib/sorting';
import { QueueTaskCard } from '../../components/QueueTaskCard';
import { SortSheet, SortField, SortDirection } from '../../components/SortSheet';
import { Task } from '../../types/task';

export default function QueueScreen() {
  const router = useRouter();
  const { tasks, loading, refreshTasks, updateCompletion } = useTasks();
  const [sortField, setSortField]         = useState<SortField>('recommended');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [sheetOpen, setSheetOpen]         = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshTasks();
    }, [])
  );

  const active    = tasks.filter(t => t.completion < 100);
  const completed = tasks.filter(t => t.completion >= 100);

  function getSortedActive(): Task[] {
    if (sortField === 'recommended') {
      return scoreAndSort(active).map(s => s.task);
    }
    return sortByField(active, sortField, sortDirection);
  }

  const sortedActive = getSortedActive();

  return (
    <>
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
          <Text style={styles.wordmark}>Queue</Text>
          <Pressable style={styles.sortPill} onPress={() => setSheetOpen(true)}>
            <Text style={styles.sortPillText}>
              {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
              {sortField !== 'recommended' ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
            </Text>
          </Pressable>
        </View>

        <Text style={[typography.sectionLabel, styles.sectionLabel]}>
          {active.length} ACTIVE
        </Text>

        {sortedActive.length > 0 ? (
          sortedActive.map(task => (
            <QueueTaskCard
              key={task.id}
              task={task}
              allTasks={tasks}
              onProgressUpdate={updateCompletion}
              onPress={() => router.push({ pathname: '/add-task', params: { id: task.id } })}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active tasks.</Text>
          </View>
        )}

        {completed.length > 0 && (
          <>
            <View style={styles.divider}>
              <Text style={[typography.sectionLabel, styles.sectionLabel]}>HISTORY</Text>
            </View>
            {completed.map(task => (
              <QueueTaskCard
                key={task.id}
                task={task}
                allTasks={tasks}
                onProgressUpdate={updateCompletion}
                onPress={() => router.push({ pathname: '/add-task', params: { id: task.id } })}
              />
            ))}
          </>
        )}
      </ScrollView>

      <SortSheet
        visible={sheetOpen}
        field={sortField}
        direction={sortDirection}
        onChangeField={setSortField}
        onChangeDirection={setSortDirection}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
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
  sortPill: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sortPillText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  sectionLabel: {
    marginBottom: 10,
  },
  divider: {
    marginTop: 24,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
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