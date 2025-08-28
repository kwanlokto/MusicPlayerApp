import { usePlayback } from '@/context/playbackContext';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const { trackTitle, isPlaying, togglePlay, stop } = usePlayback();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Music Player</Text>
      <Text style={styles.track}>{trackTitle || 'No track playing'}</Text>
      <View style={styles.controls}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlay} />
        <Button title="Stop" onPress={stop} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  track: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
});
