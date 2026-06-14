export interface Task {
  id: string;
  title: string;
  difficulty: number;
  priority: number;
  deadline: string;
  notes: string;
  completion: number;
  lastProgressAt?: string;
  createdAt: string;
}

export interface AppMeta {
  lastOpenedDate: string;
  currentStreak: number;
  longestStreak: number;
}