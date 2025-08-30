'use client';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { usePlayback } from '@/context/playbackContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export const MiniPlayer = () => {
  const { currentTrackNode, isPlaying, togglePlay, playNext, playPrevious } =
    usePlayback();
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  // Don't render if nothing is playing

  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.title}>
        {currentTrackNode?.track?.title ?? 'No track playing'}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious} style={styles.button}>
          <Ionicons name="play-skip-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={styles.button}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.button}>
          <Ionicons name="play-skip-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (scheme: 'light' | 'dark' | null | undefined) =>
  StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: scheme === 'dark' ? '#1e1e1e' : '#007AFF',
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: -2 },
      zIndex: 999, // Make sure it's above other content
    },
    title: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 12,
    },
    controls: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      padding: 6,
    },
  });
