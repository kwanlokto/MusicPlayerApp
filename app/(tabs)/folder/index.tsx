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

import { Colors } from '@/constants/Colors';
import { capitalize } from '@/helpers';
import { useRouter } from 'expo-router';

export default function FolderListScreen() {
  const router = useRouter();
  const [folders, setFolders] = useState<string[]>([]);
  const scheme = useColorScheme();
  const styles = getStyles(scheme ?? 'dark');

  useEffect(() => {
    requestPermissionAndLoad();
  }, []);

  const requestPermissionAndLoad = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') loadSongs();
  };

  const loadSongs = async () => {
    const albums = await MediaLibrary.getAlbumsAsync();
    const nonEmptyAlbums = [];

    for (const album of albums) {
    const assets = await MediaLibrary.getAssetsAsync({
      album: album.id,
      mediaType: MediaLibrary.MediaType.audio,
      first: 1, // we only need to know if at least one exists
    });

    if (assets.assets.length > 0) {
      nonEmptyAlbums.push(album);
    }
  }

    const uniqueFolderTitles = Array.from(
      new Set(nonEmptyAlbums.map(album => album.title)),
    ).sort((a, b) => a.localeCompare(b));

    setFolders(uniqueFolderTitles);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music folders</Text>
      <FlatList
        data={folders}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/folder/${item}`)}
          >
            <Text style={styles.folderText} numberOfLines={1}>
              {capitalize(item)}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
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
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    folderText: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: Colors[scheme].border,
      marginLeft: 20, // aligns divider with text
    },
  });
