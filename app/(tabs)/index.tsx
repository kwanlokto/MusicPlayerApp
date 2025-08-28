import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackTitle, setTrackTitle] = useState('Sample Track');
  const sound = useRef<Audio.Sound | null>(null);

  // Load audio on mount
  useEffect(() => {
    loadSound();
    return () => {
      unloadSound();
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        // You can replace this with your own MP3/stream
        require('./assets/sample.mp3'),
      );
      sound.current = newSound;
    } catch (error) {
      console.error('Error loading sound', error);
    }
  };

  const unloadSound = async () => {
    if (sound.current) {
      await sound.current.unloadAsync();
      sound.current = null;
    }
  };

  const playPause = async () => {
    if (!sound.current) return;
    const status = (await sound.current.getStatusAsync()) as AVPlaybackStatus;
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const stop = async () => {
    if (sound.current) {
      await sound.current.stopAsync();
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎶 Music Player</Text>
      <Text style={styles.track}>{trackTitle}</Text>

      <View style={styles.controls}>
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={playPause} />
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
