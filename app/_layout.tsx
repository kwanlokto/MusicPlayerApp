import 'react-native-reanimated';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, useSegments } from 'expo-router';

import { MiniPlayer } from '@/components/MiniPlayer';
import { PlaybackProvider } from '@/context/playbackContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const segments = useSegments(); // current route segments

  if (!loaded) return null;

  // Define pages where MiniPlayer should appear
  const showMiniPlayer =
    segments[0] === 'folder' ||
    (segments[0] === '(tabs)' && segments[1] === 'folder_list');

  return (
    <PlaybackProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {showMiniPlayer && <MiniPlayer />}
        <StatusBar style="auto" />
      </ThemeProvider>
    </PlaybackProvider>
  );
}
