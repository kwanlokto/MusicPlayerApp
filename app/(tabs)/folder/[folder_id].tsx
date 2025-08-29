'use client';

import * as MediaLibrary from 'expo-media-library';

import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { usePlayback } from '@/context/playbackContext';
import { useLocalSearchParams } from 'expo-router';

export default function FolderPage() {
  const { folder_id } = useLocalSearchParams(); // folder_id from URL
  const { playTrack } = usePlayback();
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    loadSongs();
  }, [folder_id]);

  const loadSongs = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    });

    // filter songs based on folder_id
    const songsInFolder = media.assets.filter((asset) => {
      if (!asset.uri.startsWith('file://')) return false;
      const path = asset.uri.split('/').slice(-2, -1)[0]; // assuming folder_id is last folder name
      return path === folder_id;
    });

    setSongs(songsInFolder);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>{folder_id}</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => playTrack(item.uri, item.filename)} style={{ padding: 12, marginBottom: 8, backgroundColor: '#ddd', borderRadius: 8 }}>
            <Text>{item.filename}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
