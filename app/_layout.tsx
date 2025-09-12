import 'react-native-reanimated';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';

import { PlaybackProvider } from '@/context/playbackContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import service from '../service';

// Register the background playback service
TrackPlayer.registerPlaybackService(() => service);

export default function RootLayout() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      if (event.url === 'trackplayer://notification.click') {
        router.replace('/(tabs)');
      }
    };

    // Add listener and save the subscription
    const subscription = Linking.addListener('url', handleDeepLink);

    // Check for initial deep link when the app launches
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl === 'trackplayer://notification.click') {
        handleDeepLink({ url: initialUrl });
      }
    })();

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) return null;

  return (
    <PlaybackProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PlaybackProvider>
  );
}
