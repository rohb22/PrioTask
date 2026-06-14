import { Task } from '../types/task';

type UrgencyBucket = 'overdue' | 'today' | 'soon' | 'week' | 'later';

function getUrgencyBucket(deadline: string, now: Date): UrgencyBucket {
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0)       return 'overdue';
  if (diffDays < 1)       return 'today';
  if (diffDays < 3)       return 'soon';
  if (diffDays <= 7)      return 'week';
  return 'later';
}

function urgencyScore(bucket: UrgencyBucket): number {
  switch (bucket) {
    case 'overdue': return 100;
    case 'today':   return 50;
    case 'soon':    return 15;
    case 'week':    return 5;
    case 'later':   return 1;
  }
}

function rawScore(task: Task, now: Date): number {
  const bucket = getUrgencyBucket(task.deadline, now);
  const urgency = urgencyScore(bucket);

  let score = urgency + (task.priority * 5) - (task.difficulty * 2) + (task.completion * 0.1);

  if (task.lastProgressAt) {
    const hoursSince = (now.getTime() - new Date(task.lastProgressAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince <= 24)       score += 10;
    if (task.completion >= 80)  score += 15;
  }

  if (!task.lastProgressAt) {
    const ageMs = now.getTime() - new Date(task.createdAt).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays > 5)      score -= 10;
    else if (ageDays > 2) score -= 5;
  }

  return score;
}

function normalize(scores: number[]): number[] {
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (max === min) return scores.map(() => 3.0);
  return scores.map(s => 1.0 + ((s - min) / (max - min)) * 4.0);
}

export interface ScoredTask {
  task: Task;
  prioScore: number;
  urgencyBucket: UrgencyBucket;
}

export function scoreAndSort(tasks: Task[]): ScoredTask[] {
  if (tasks.length === 0) return [];

  const now = new Date();
  const raws = tasks.map(t => rawScore(t, now));
  const normalized = normalize(raws);

  return tasks
    .map((task, i) => ({
      task,
      prioScore: normalized[i],
      urgencyBucket: getUrgencyBucket(task.deadline, now),
    }))
    .sort((a, b) => b.prioScore - a.prioScore);
}

export function sortByField(
  tasks: Task[],
  field: 'difficulty' | 'priority' | 'deadline',
  direction: 'asc' | 'desc'
): Task[] {
  return [...tasks].sort((a, b) => {
    let av: number, bv: number;
    if (field === 'deadline') {
      av = new Date(a.deadline).getTime();
      bv = new Date(b.deadline).getTime();
    } else {
      av = a[field];
      bv = b[field];
    }
    return direction === 'asc' ? av - bv : bv - av;
  });
}

export { getUrgencyBucket };