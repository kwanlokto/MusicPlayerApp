import { usePlayback } from '@/context/playbackContext';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function Index() {
  const { trackTitle, isPlaying, togglePlay, stop } = usePlayback();
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  return !trackTitle ? (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Music Player</Text>
      <Text style={styles.track}>No track playing</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Now Playing</Text>
      <Text style={styles.track}>{trackTitle}</Text>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={togglePlay}>
          <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={stop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (scheme: 'light' | 'dark' | null | undefined) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === 'dark' ? '#121212' : '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      color: scheme === 'dark' ? '#fff' : '#000',
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 20,
    },
    track: {
      color: scheme === 'dark' ? '#bbb' : '#333',
      fontSize: 18,
      marginBottom: 40,
    },
    controls: {
      flexDirection: 'row',
      gap: 20,
    },
    button: {
      backgroundColor: scheme === 'dark' ? '#1DB954' : '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      elevation: 3,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
