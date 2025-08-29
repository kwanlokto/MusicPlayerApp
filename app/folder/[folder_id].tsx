import * as MediaLibrary from 'expo-media-library';

import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { usePlayback } from '@/context/playbackContext';
import { formatDuration } from '@/helpers';

export default function FolderPage() {
  const { folder_id } = useLocalSearchParams(); // folder_id from URL
  const { playTrack } = usePlayback();
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  const loadSongs = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    });

    // filter songs based on folder_id
    const songsInFolder = media.assets.filter(asset => {
      if (!asset.uri.startsWith('file://')) return false;
      const path = asset.uri.split('/').slice(-2, -1)[0]; // folder name before file
      return path === folder_id;
    });

    setSongs(songsInFolder);
  };

  useEffect(() => {
    loadSongs();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: folder_id as string }} />

      {songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No songs found in this folder.</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => playTrack(item.uri, item.filename)}
              style={styles.songItem}
            >
              <Text numberOfLines={1} style={styles.songTitle}>
                {item.filename}
              </Text>
              <Text style={styles.songSubtext}>
                {formatDuration(item.duration)}s
              </Text>
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
    },
    listContent: {
      padding: 16,
    },
    songItem: {
      backgroundColor: scheme === 'dark' ? '#1e1e1e' : '#fff',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    songTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: scheme === 'dark' ? '#fff' : '#222',
    },
    songSubtext: {
      fontSize: 12,
      marginTop: 4,
      color: scheme === 'dark' ? '#aaa' : '#555',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: scheme === 'dark' ? '#aaa' : '#555',
    },
  });
