import Constants from 'expo-constants';
import { Task } from '../types/task';

const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

function getNotifications() {
  return require('expo-notifications') as typeof import('expo-notifications');
}

export async function requestPermissions(): Promise<boolean> {
  if (IS_EXPO_GO) return false;
  const Notifications = getNotifications();
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskNotification(task: Task): Promise<void> {
  if (IS_EXPO_GO) return;

  const Notifications = getNotifications();
  const now = new Date();
  const deadline = new Date(task.deadline);
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) return;

  const triggerMs = diffHours > 24
    ? diffMs - 1000 * 60 * 60 * 24
    : diffMs - 1000 * 60 * 60 * 2;

  if (triggerMs <= 0) return;

  let body: string;
  if (task.completion === 0 && diffMs < 0) {
    body = `"${task.title}" is overdue and untouched. Do something now.`;
  } else if (task.completion >= 90) {
    body = `Almost done with "${task.title}". Finish it.`;
  } else if (diffHours <= 24) {
    body = `"${task.title}" is due in under 24 hours. Push through.`;
  } else {
    body = `"${task.title}" is due tomorrow. Get ahead of it.`;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: `task-${task.id}`,
    content: {
      title: 'PrioTask',
      body,
      data: { taskId: task.id },
    },
    trigger: { seconds: Math.floor(triggerMs / 1000), repeats: false } as any,
  });
}

export async function cancelTaskNotification(taskId: string): Promise<void> {
  if (IS_EXPO_GO) return;
  const Notifications = getNotifications();
  await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
}

export async function rescheduleAllNotifications(tasks: Task[]): Promise<void> {
  if (IS_EXPO_GO) return;
  const Notifications = getNotifications();
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const task of tasks) {
    if (task.completion < 100) {
      await scheduleTaskNotification(task);
    }
  }
}