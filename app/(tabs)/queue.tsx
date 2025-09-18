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
  const { getQueue, playNext } = useCustomAudioPlayer();
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
    await playNext();
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
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
            <Text numberOfLines={1} style={styles.title}>
              {item.title || 'Untitled'}
            </Text>
            <Text style={styles.subtext}>
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
    row: {
      paddingVertical: 8,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
    },
    subtext: {
      fontSize: 13,
      color: Colors[scheme].subText,
      marginTop: 2,
    },
  });
