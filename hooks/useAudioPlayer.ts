import * as Notifications from 'expo-notifications';

import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
// hooks/useAudioPlayer.ts
import { useEffect, useRef, useState } from 'react';

import { Platform } from 'react-native';

type Track = {
  title: string;
  uri: string;
};

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Setup audio mode and notification channel on mount
  useEffect(() => {
    (async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: true,
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('music', {
          name: 'Music Playback',
          importance: Notifications.AndroidImportance.MAX, // ✅ still works
          sound: null,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC, // ✅ use this
        });
      }
    })();

    return () => {
      // Cleanup
      soundRef.current?.unloadAsync();
      Notifications.dismissAllNotificationsAsync();
    };
  }, []);

  // Play a track
  const playTrack = async (track: Track) => {
    try {
      // Unload previous
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true },
      );

      soundRef.current = sound;
      setIsPlaying(true);

      // Show persistent notification on Android
      if (Platform.OS === 'android') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Now Playing',
            body: track.title,
          },
          trigger: null,
        });
      }

      // Listen for playback finish
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          stopTrack();
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Pause
  const pauseTrack = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  // Stop and cleanup
  const stopTrack = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    if (Platform.OS === 'android') {
      await Notifications.dismissAllNotificationsAsync();
    }
  };

  return { playTrack, pauseTrack, stopTrack, isPlaying };
}
