import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { UserProvider } from '@/src/context/UserContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="validation-result" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </UserProvider>
  );
}
