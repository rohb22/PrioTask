import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../constants/theme';
import { loadTasks, saveTasks } from '../lib/storage';
import { useHaptics } from '../hooks/useHaptics';
import { Task } from '../types/task';
import { rescheduleAllNotifications } from '../lib/notifications';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function AddTaskScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{ id?: string }>();
  const haptics = useHaptics();
  const isEdit  = !!params.id;

  const [ready,      setReady]      = useState(false);
  const [title,      setTitle]      = useState('');
  const [notes,      setNotes]      = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [priority,   setPriority]   = useState(3);
  const [deadline,   setDeadline]   = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });

  useEffect(() => {
    async function init() {
      if (params.id) {
        const all = await loadTasks();
        const found = all.find(t => t.id === params.id);
        if (found) {
          setTitle(found.title);
          setNotes(found.notes);
          setDifficulty(found.difficulty);
          setPriority(found.priority);
          setDeadline(new Date(found.deadline));
        }
      }
      setReady(true);
    }
    init();
  }, [params.id]);

  function openDatePicker() {
    DateTimePickerAndroid.open({
        value: deadline,
        mode: 'date',
        minimumDate: new Date(),
        onValueChange: (_e, selectedDate) => {
        if (!selectedDate) return;

        const base = new Date(selectedDate);

        DateTimePickerAndroid.open({
            value: deadline,
            mode: 'time',
            is24Hour: false,
            onValueChange: (_e2, selectedTime) => {
            if (!selectedTime) return;

            base.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                0,
                0
            );

            setDeadline(base);
            },
        });
        },
    });
    }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a task title.');
      return;
    }

    const all = await loadTasks();

    if (isEdit && params.id) {
      const next = all.map(t =>
        t.id === params.id
          ? { ...t, title: title.trim(), notes: notes.trim(), difficulty, priority, deadline: deadline.toISOString() }
          : t
      );
      await saveTasks(next);
      await rescheduleAllNotifications(next);
    } else {
      const task: Task = {
        id:         generateId(),
        title:      title.trim(),
        notes:      notes.trim(),
        difficulty,
        priority,
        deadline:   deadline.toISOString(),
        completion: 0,
        createdAt:  new Date().toISOString(),
      };
      all.push(task);
      await saveTasks(all);
      await rescheduleAllNotifications(all);
    }

    haptics.success();
    router.back();
  }

  if (!ready) return <View style={styles.root} />;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
           style={{ backgroundColor: colors.surface }}
        contentContainerStyle={[
            styles.content,
            { backgroundColor: colors.surface },
        ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
            <Text style={styles.heading}>{isEdit ? 'Edit Task' : 'New Task'}</Text>
            <Pressable onPress={handleSave} hitSlop={10}>
              <Text style={styles.saveBtn}>Save</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>TITLE</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to get done?"
            placeholderTextColor={colors.textMuted}
            autoFocus={!isEdit}
            returnKeyType="next"
          />

          <Text style={styles.label}>NOTES</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any context or details..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>DIFFICULTY</Text>
          <View style={styles.pills}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable
                key={n}
                style={[styles.pill, difficulty === n && styles.pillActive]}
                onPress={() => { haptics.light(); setDifficulty(n); }}
              >
                <Text style={[styles.pillText, difficulty === n && styles.pillTextActive]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>PRIORITY</Text>
          <View style={styles.pills}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable
                key={n}
                style={[styles.pill, priority === n && styles.pillActive]}
                onPress={() => { haptics.light(); setPriority(n); }}
              >
                <Text style={[styles.pillText, priority === n && styles.pillTextActive]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>DEADLINE</Text>
          <Pressable style={styles.deadlineBtn} onPress={openDatePicker}>
            <Text style={styles.deadlineText}>{formatDisplay(deadline)}</Text>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveBtn: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  label: {
    ...typography.sectionLabel,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 90,
    paddingTop: 12,
  },
  pills: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
  },
  pillActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  pillText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.accent,
  },
  deadlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  deadlineText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
});