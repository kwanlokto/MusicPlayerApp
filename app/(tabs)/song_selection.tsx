import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

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
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000,
    });
    const folderSet = new Set<string>();
    media.assets.forEach(asset => {
      if (asset.uri.startsWith('file://')) {
        const parts = asset.uri.split('/');
        folderSet.add(parts.slice(0, -1).join('/'));
      }
    });
    setFolders(Array.from(folderSet));
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
