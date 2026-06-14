import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, AppMeta } from '../types/task';

const TASKS_KEY = '@priotask/tasks';
const META_KEY  = '@priotask/meta';

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadMeta(): Promise<AppMeta | null> {
  const raw = await AsyncStorage.getItem(META_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveMeta(meta: AppMeta): Promise<void> {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(meta));
}