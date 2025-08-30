import { Stack, useSegments } from 'expo-router';

import { MiniPlayer } from '@/components/MiniPlayer';
import React from 'react';
import { View } from 'react-native';

export default function FolderStackLayout() {
  const segments = useSegments();

  const showMiniPlayer = segments[0] === '(tabs)' && segments[1] === 'folder';

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="[id]" />
      </Stack>
      {showMiniPlayer && <MiniPlayer />}
    </View>
  );
}
