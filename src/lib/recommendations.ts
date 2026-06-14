import { Task } from '../types/task';

export interface Recommendation {
  suggestion: number;
  message: string;
}

function dueWithin24h(tasks: Task[], now: Date): number {
  return tasks.filter(t => {
    if (t.completion >= 100) return false;
    const diffMs = new Date(t.deadline).getTime() - now.getTime();
    return diffMs >= 0 && diffMs <= 1000 * 60 * 60 * 24;
  }).length;
}

export function getRecommendation(task: Task, now: Date, allTasks: Task[]): Recommendation {
  const hour = now.getHours();
  const dueToday = dueWithin24h(allTasks, now);
  const remaining = 100 - task.completion;
  const diffMs = new Date(task.deadline).getTime() - now.getTime();
  const daysUntil = diffMs / (1000 * 60 * 60 * 24);

  if (task.completion >= 80) {
    return { suggestion: remaining, message: "You're almost there. Just finish it." };
  }

  if (dueToday >= 4) {
    const suggestion = Math.min(15, remaining);
    return { suggestion, message: "Heavy day. Touch everything, finish what you can." };
  }

  if (hour >= 18 && task.difficulty === 5) {
    return { suggestion: 10, message: "Late in the day. Small progress still counts." };
  }

  if (task.difficulty === 5 && daysUntil > 2) {
    return { suggestion: Math.min(15, remaining), message: "Mountain ahead. Knock out 15% today." };
  }

  if (task.difficulty >= 4 && daysUntil <= 2) {
    return { suggestion: Math.min(30, remaining), message: "Crunch time. Push through 30%." };
  }

  if (task.difficulty === 3) {
    return { suggestion: Math.min(25, remaining), message: "Make a solid dent. Aim for 25%." };
  }

  if (task.difficulty <= 2) {
    return { suggestion: remaining, message: "Quick win. Just finish this." };
  }

  return { suggestion: Math.min(20, remaining), message: "Make progress today." };
}