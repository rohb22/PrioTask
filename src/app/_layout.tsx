import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';
import { requestPermissions } from '../lib/notifications';


export default function RootLayout() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <>
      <StatusBar style="light"/>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
          animation: 'none',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: colors.surface },
          }}
        />
      </Stack>
    </>
  );
}