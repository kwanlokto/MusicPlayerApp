import * as MediaLibrary from 'expo-media-library';

import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function FolderListScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<string[]>([]);
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  useEffect(() => {
    requestPermissionAndLoad();
  }, []);

  const requestPermissionAndLoad = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') loadSongs();
  };

  const loadSongs = async () => {
    const albums = await MediaLibrary.getAlbumsAsync();
    const uniqueFolderTitles = Array.from(
      new Set(albums.map(album => album.title)),
    );

    setFolders(uniqueFolderTitles);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📁 Music Folders</Text>
      <FlatList
        data={folders}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.folderItem}
            onPress={() => router.push(`/folder/${item.split('/').pop()}`)}
          >
            <Text style={styles.folderText}>{item.split('/').pop()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const getStyles = (scheme: 'light' | 'dark' | null | undefined) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 50,
      backgroundColor: scheme === 'dark' ? '#121212' : '#f5f5f5',
    },
    title: {
      marginTop: 20,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 20,
      color: scheme === 'dark' ? '#fff' : '#000',
    },
    folderItem: {
      padding: 16,
      marginBottom: 12,
      borderRadius: 10,
      backgroundColor: scheme === 'dark' ? '#1e1e1e' : '#fff',
    },
    folderText: {
      fontSize: 18,
      fontWeight: '600',
      color: scheme === 'dark' ? '#ddd' : '#333',
    },
  });
