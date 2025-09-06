import * as Notifications from 'expo-notifications';

import { Stack, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

import { MiniPlayer } from '@/components/MiniPlayer';
import { View } from 'react-native';

export default function FolderStackLayout() {
  const segments = useSegments();

  const showMiniPlayer = segments[0] === '(tabs)' && segments[1] === 'folder';

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notifications permission not granted!');
    }
  }
  useEffect(() => {
    requestPermissions()
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[folder_id]" />
      </Stack>
      {showMiniPlayer && <MiniPlayer />}
    </View>
  );
}
