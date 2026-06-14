import { useState, useCallback } from 'react';
import { AppMeta } from '../types/task';
import { checkAndUpdateStreak, taskCompletedToday } from '../lib/streak';
import { Task } from '../types/task';

export function useStreak() {
  const [meta, setMeta] = useState<AppMeta | null>(null);

  const refreshStreak = useCallback(async (tasks: Task[]) => {
    const completedToday = taskCompletedToday(tasks);
    const updated = await checkAndUpdateStreak(completedToday);
    setMeta(updated);
  }, []);

  return { meta, refreshStreak };
}