import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons'; // Expo has this built-in
import React from 'react';
import { usePlayback } from '@/context/playbackContext';

export default function Index() {
  const {
    currentTrackNode,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    stop,
  } = usePlayback();
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  return !currentTrackNode?.track?.title ? (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Music Player</Text>
      <Text style={styles.track}>No track playing</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Now Playing</Text>
      <Text style={styles.track}>{currentTrackNode?.track?.title}</Text>

      <View style={styles.controls}>
        {/* Previous Button */}
        <TouchableOpacity style={styles.iconButton} onPress={playPrevious}>
          <Ionicons name="play-skip-back" size={40} color="#fff" />
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity style={styles.iconButton} onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Stop */}
        <TouchableOpacity style={styles.iconButton} onPress={stop}>
          <Ionicons name="stop" size={40} color="#fff" />
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity style={styles.iconButton} onPress={playNext}>
          <Ionicons name="play-skip-forward" size={40} color="#fff" />
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
    iconButton: {
      backgroundColor: scheme === 'dark' ? '#1DB954' : '#007AFF',
      padding: 16,
      borderRadius: 50,
      elevation: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
