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
  const { folder_id } = useLocalSearchParams();
  const { playTrack, setQueue, playNext } = usePlayback(); // added setQueue
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  const loadSongs = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    });

    const songsInFolder = media.assets.filter(asset => {
      if (!asset.uri.startsWith('file://')) return false;
      const path = asset.uri.split('/').slice(-2, -1)[0];
      return path === folder_id;
    });

    setSongs(songsInFolder);
  };

  useEffect(() => {
    loadSongs();
  }, []);

  // Play all songs in order
  const playAllSongs = () => {
    if (!songs.length) return;

    // Create a queue of track URIs and titles
    const queue = songs.map(song => ({
      uri: song.uri,
      title: song.filename,
    }));

    // Send queue to playback context
    setQueue(queue);

    // Start playing the first track
    playTrack(queue[0].uri, queue[0].title);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: folder_id as string }} />

      {songs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No songs found in this folder.</Text>
        </View>
      ) : (
        <>
          {/* Play All button */}
          <TouchableOpacity style={styles.playAllButton} onPress={playAllSongs}>
            <Text style={styles.playAllText}>▶ Play All</Text>
          </TouchableOpacity>

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
                  {formatDuration(item.duration)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

// Add styles for Play All button
const getStyles = (scheme: 'light' | 'dark' | null | undefined) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === 'dark' ? '#121212' : '#f5f5f5',
    },
    listContent: {
      padding: 16,
    },
    playAllButton: {
      backgroundColor: scheme === 'dark' ? '#1DB954' : '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
    },
    playAllText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
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

