import { loadMeta, saveMeta } from './storage';
import { AppMeta } from '../types/task';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

export async function checkAndUpdateStreak(completedTodayCount: number): Promise<AppMeta> {
  const now = new Date();
  const existing = await loadMeta();

  if (!existing) {
    const meta: AppMeta = {
      lastOpenedDate: now.toISOString(),
      currentStreak:  completedTodayCount >= 1 ? 1 : 0,
      longestStreak:  completedTodayCount >= 1 ? 1 : 0,
    };
    await saveMeta(meta);
    return meta;
  }

  const last = new Date(existing.lastOpenedDate);

  if (isSameDay(last, now)) {
    const updated: AppMeta = { ...existing, lastOpenedDate: now.toISOString() };
    await saveMeta(updated);
    return updated;
  }

  let currentStreak = existing.currentStreak;

  if (isYesterday(last, now)) {
    if (completedTodayCount >= 1) {
      currentStreak += 1;
    }
  } else {
    currentStreak = completedTodayCount >= 1 ? 1 : 0;
  }

  const longestStreak = Math.max(existing.longestStreak, currentStreak);

  const meta: AppMeta = {
    lastOpenedDate: now.toISOString(),
    currentStreak,
    longestStreak,
  };

  await saveMeta(meta);
  return meta;
}

export function taskCompletedToday(tasks: import('../types/task').Task[]): number {
  const now = new Date();
  return tasks.filter(t => {
    if (t.completion < 100) return false;
    if (!t.lastProgressAt)  return false;
    return isSameDay(new Date(t.lastProgressAt), now);
  }).length;
}