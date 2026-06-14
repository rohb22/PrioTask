import { useState, useCallback } from 'react';
import { Task } from '../types/task';
import { loadTasks, saveTasks } from '../lib/storage';
import { rescheduleAllNotifications } from '../lib/notifications';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadTasks();
      setTasks(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (task: Task) => {
    const updated = await loadTasks();
    updated.push(task);
    await saveTasks(updated);
    await rescheduleAllNotifications(updated);
    setTasks(updated);
  }, []);

  const updateTask = useCallback(async (updated: Task) => {
    const all = await loadTasks();
    const next = all.map(t => t.id === updated.id ? updated : t);
    await saveTasks(next);
    await rescheduleAllNotifications(next);
    setTasks(next);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const all = await loadTasks();
    const next = all.filter(t => t.id !== id);
    await saveTasks(next);
    await rescheduleAllNotifications(next);
    setTasks(next);
  }, []);

  const updateCompletion = useCallback(async (id: string, completion: number) => {
    const all = await loadTasks();
    const next = all.map(t =>
      t.id === id
        ? { ...t, completion, lastProgressAt: new Date().toISOString() }
        : t
    );
    await saveTasks(next);
    await rescheduleAllNotifications(next);
    setTasks(next);
  }, []);

  return { tasks, loading, refreshTasks, addTask, updateTask, deleteTask, updateCompletion };
}