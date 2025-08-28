import { usePlayback } from '@/context/playbackContext';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MusicScreen() {
  const { playTrack } = usePlayback();

  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);

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
        first: 1000, // max number of songs to fetch
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
  },
  empty: {
    color: '#888',
    fontSize: 16,
  },
  song: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 12,
  },
});
