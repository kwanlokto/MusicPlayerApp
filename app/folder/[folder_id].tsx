import * as MediaLibrary from 'expo-media-library';

import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { usePlayback } from '@/context/playbackContext';

export default function FolderPage() {
  const { folder_id } = useLocalSearchParams(); // folder_id from URL
  const { playTrack } = usePlayback();
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      loadSongs();
    }
  }, [folder_id, hasPermission]);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadSongs = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    });

    // filter songs based on folder_id
    const songsInFolder = media.assets.filter((asset) => {
      if (!asset.uri.startsWith('file://')) return false;
      const path = asset.uri.split('/').slice(-2, -1)[0]; // folder name before file
      return path === folder_id;
    });

    setSongs(songsInFolder);
  };

  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Permission to access media is required.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: folder_id as string }} />

      {songs.length === 0 ? (
        <Text>No songs found in this folder.</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => playTrack(item.uri, item.filename)}
              style={{
                padding: 12,
                marginBottom: 8,
                backgroundColor: '#ddd',
                borderRadius: 8,
              }}
            >
              <Text>{item.filename}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
