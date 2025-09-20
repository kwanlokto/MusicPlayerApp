import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { CustomFlatList } from '@/components/CustomFlatList';
import { Colors } from '@/constants/Colors';
import { usePlayback } from '@/context/playbackContext';
import { Track } from 'react-native-track-player';

export default function QueuePage() {
  const { title, isPlaying, getQueue, playTrack } = usePlayback();
  const [queue, setQueue] = useState<Track[]>();

  const scheme = useColorScheme();
  const styles = getStyles(scheme ?? 'dark');

  // Fetch queue on mount
  useEffect(() => {
    /**
     * TODO: This will need an observable to properly update whenever
     * the queue updates!
     */
    const fetchQueue = async () => {
      try {
        const localQueue = await getQueue();
        setQueue(localQueue);
      } catch (err) {
        console.log('Error fetching queue:', err);
      }
    };

    fetchQueue();
  }, []);

  // Optionally, function to jump to a track in the queue
  const handlePlayTrack = async (index: number) => {
    await playTrack(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Queue</Text>
      <CustomFlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => {
          const isSongPlaying = item.title === title && isPlaying

          return (
            <TouchableOpacity
              style={[
                styles.row,
                isSongPlaying && { backgroundColor: '#2c2c2c' }, // highlight row
              ]}
              onPress={() => handlePlayTrack(index)}
            >
              <Text numberOfLines={1} style={[styles.songTitle]}>
                {isSongPlaying ? '[ Now Playing ]    ' : ''}
                {item.title || 'Untitled'}
              </Text>
              <Text style={[styles.songArtist]}>
                {item.artist || 'Unknown Artist'}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
const getStyles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
      paddingTop: 65,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
      paddingHorizontal: 20,
      color: Colors[scheme].text,
    },
    row: {
      paddingVertical: 8,
      paddingHorizontal: 20,
    },
    songTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
    },
    songArtist: {
      fontSize: 13,
      color: Colors[scheme].subText,
      marginTop: 2,
    },
  });
