import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, typography, radius } from '../constants/theme';
import { ProgressBar } from './ProgressBar';
import { Task } from '../types/task';
import { getRecommendation } from '../lib/recommendations';
import { getUrgencyBucket } from '../lib/sorting';
import { useHaptics } from '../hooks/useHaptics';

interface Props {
  task: Task;
  allTasks: Task[];
  onProgressUpdate: (id: string, completion: number) => void;
  onPress: () => void;
}

function urgencyColor(bucket: ReturnType<typeof getUrgencyBucket>): string {
  switch (bucket) {
    case 'overdue': return colors.danger;
    case 'today':   return colors.warning;
    case 'soon':    return '#8a6a00';
    default:        return colors.border;
  }
}

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function QueueTaskCard({ task, allTasks, onProgressUpdate, onPress }: Props) {
  const haptics = useHaptics();
  const now = new Date();
  const bucket = getUrgencyBucket(task.deadline, now);
  const rec = getRecommendation(task, now, allTasks);
  const isComplete = task.completion >= 100;

  const scale   = useSharedValue(isComplete ? 0.97 : 1);
  const opacity = useSharedValue(isComplete ? 0.4 : 1);

  React.useEffect(() => {
    if (isComplete) {
      scale.value   = withSpring(0.97);
      opacity.value = withTiming(0.4, { duration: 300 });
    } else {
      scale.value   = withSpring(1);
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isComplete]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleAdd = () => {
    const next = Math.min(100, task.completion + rec.suggestion);
    haptics.medium();
    onProgressUpdate(task.id, Math.round(next));
  };

  const handleDone = () => {
    haptics.success();
    onProgressUpdate(task.id, 100);
  };

  return (
    <Animated.View style={[styles.card, { borderLeftColor: urgencyColor(bucket) }, animStyle]}>
      <Pressable onPress={onPress} style={styles.inner}>
        <Text style={typography.recommendation} numberOfLines={1}>
          {rec.message}
        </Text>
        <Text style={[typography.taskTitle, isComplete && styles.strikethrough]} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={typography.meta}>
          {formatDeadline(task.deadline)}
        </Text>
        <ProgressBar completion={task.completion} />
        {!isComplete && (
          <View style={styles.actions}>
            <Pressable onPress={handleAdd} style={styles.actionBtn}>
              <Text style={styles.actionText}>+{rec.suggestion}%</Text>
            </Pressable>
            <Pressable onPress={handleDone} style={styles.actionBtn}>
              <Text style={styles.actionText}>Done</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderLeftWidth: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  inner: {
    padding: 14,
    gap: 8,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
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
});