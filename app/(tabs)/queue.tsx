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
import { useCustomAudioPlayer } from '@/hooks/useAudioPlayer';
import { Track } from 'react-native-track-player';

export default function QueuePage() {
  const { getQueue, playTrack } = useCustomAudioPlayer();
  const [queue, setQueue] = useState<Track[]>();

  const scheme = useColorScheme();
  const styles = getStyles(scheme ?? 'dark');

  // Fetch queue on mount
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const q = await getQueue();
        setQueue(q);
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
      <Text style={styles.title}>
        Queue
      </Text>
      <CustomFlatList
        data={queue}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => handlePlayTrack(index)}
          >
            <Text numberOfLines={1} style={styles.songTitle}>
              {item.title || 'Untitled'}
            </Text>
            <Text style={styles.songArtist}>
              {item.artist || 'Unknown Artist'}
            </Text>
          </TouchableOpacity>
        )}
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
