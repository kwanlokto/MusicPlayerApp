import { usePlayback } from '@/context/playbackContext';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

export default function MusicScreen() {
  const { playTrack } = usePlayback();
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  useEffect(() => {
    requestPermissionAndLoad();
  }, []);

  const requestPermissionAndLoad = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      loadSongs();
    } else {
      console.log('Permission denied!');
    }
  };

  const loadSongs = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      setSongs(media.assets);
    } catch (error) {
      console.log('Error fetching songs:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Songs on Device</Text>

      {songs.length === 0 ? (
        <Text style={styles.empty}>No songs found</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.songItem}
              onPress={() => playTrack(item.uri, item.filename)}
            >
              <Text style={styles.song}>{item.filename}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const getStyles = (scheme: 'light' | 'dark' | null | undefined) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === 'dark' ? '#121212' : '#f5f5f5',
      padding: 20,
      paddingTop: 50,
    },
    title: {
      color: scheme === 'dark' ? '#fff' : '#000',
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 20,
    },
    empty: {
      color: scheme === 'dark' ? '#888' : '#666',
      fontSize: 16,
      textAlign: 'center',
      marginTop: 40,
    },
    songItem: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      marginBottom: 10,
      borderRadius: 10,
      backgroundColor: scheme === 'dark' ? '#1e1e1e' : '#fff',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    song: {
      color: scheme === 'dark' ? '#ddd' : '#333',
      fontSize: 16,
      fontWeight: '500',
    },
  });
