import React, { useEffect, useState } from 'react';
import { View, Button, Text, FlatList, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
  Track,
} from 'react-native-track-player';

interface TrackItem {
  id: string;
  url: string;
  title: string;
  artist: string;
}

const tracks: TrackItem[] = [
  {
    id: '1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Song 1',
    artist: 'SoundHelix',
  },
  {
    id: '2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'Song 2',
    artist: 'SoundHelix',
  },
];

export default function App() {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add(tracks as Track[]);

      TrackPlayer.updateOptions({
        alwaysPauseOnInterruption: true,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
      });

      const trackId = await TrackPlayer.getCurrentTrack();
      setCurrentTrack(trackId);
    }

    setup();
    return () => {
      TrackPlayer.reset().then(() => {
        console.log('Player reset');
      });
    };
  }, []);

  const togglePlayback = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      try {
        await TrackPlayer.play();
      } catch (e) {
        console.warn('Player not ready yet', e);
      }
    }
  };

  const playNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {
      console.log('No next track');
    }
  };

  const playPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch {
      console.log('No previous track');
    }
  };

  const seek = async (value: number) => {
    await TrackPlayer.seekTo(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Player</Text>

      <FlatList
        data={tracks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text
            style={
              item.id === currentTrack ? styles.currentTrack : styles.track
            }
          >
            {item.title} - {item.artist}
          </Text>
        )}
      />

      <Slider
        style={{ width: 300, height: 40 }}
        minimumValue={0}
        maximumValue={progress.duration}
        value={progress.position}
        onSlidingComplete={seek}
      />
      <Text>
        {Math.floor(progress.position)} / {Math.floor(progress.duration)} sec
      </Text>

      <View style={styles.controls}>
        <Button title="Prev" onPress={playPrevious} />
        <Button
          title={playbackState.state === State.Playing ? 'Pause' : 'Play'}
          onPress={togglePlayback}
        />
        <Button title="Next" onPress={playNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginTop: 20,
  },
  track: { fontSize: 16, marginVertical: 5 },
  currentTrack: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: 'bold',
    color: 'green',
  },
});
