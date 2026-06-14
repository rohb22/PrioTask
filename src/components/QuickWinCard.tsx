import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, radius } from '../constants/theme';
import { ProgressBar } from './ProgressBar';
import { Task } from '../types/task';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
  task: Task;
  onProgressUpdate: (id: string, completion: number) => void;
  onPress: () => void;
}

export function QuickWinCard({ task, onProgressUpdate, onPress }: Props) {
  const haptics = useHaptics();
  const remaining = 100 - task.completion;

  const handleDone = () => {
    haptics.success();
    onProgressUpdate(task.id, 100);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.inner}>
        <Text style={typography.taskTitle} numberOfLines={2}>
          {task.title}
        </Text>
        <ProgressBar completion={task.completion} />
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              haptics.medium();
              onProgressUpdate(task.id, Math.min(100, task.completion + remaining));
            }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>+{remaining}%</Text>
          </Pressable>
          <Pressable onPress={handleDone} style={styles.actionBtn}>
            <Text style={[styles.actionText, styles.finish]}>Finish</Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderRadius: radius.card,
    borderLeftWidth: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  inner: {
    padding: 14,
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  finish: {
    color: colors.accent,
  },
});