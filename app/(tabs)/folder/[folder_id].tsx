import * as MediaLibrary from 'expo-media-library';

import { Colors, primaryButton } from '@/constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
  const { playTrack, addToQueue } = usePlayback(); // added setQueue
  const [songs, setSongs] = useState<MediaLibrary.Asset[]>([]);

  const scheme = useColorScheme();
  const styles = getStyles(scheme ?? 'dark');

  const loadSongs = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 1000, // capped to 1000 songs per folder
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
  const __playTrack = (index: number) => {
    if (!songs.length) return;

    // Create a queue of track URIs and titles
    const tracks = songs.map(song => ({
      uri: song.uri,
      title: song.filename,
    }));

    // Send queue to playback context
    addToQueue(tracks);
    // Start playing the first track
    playTrack(tracks[index]);
  };

  // Shuffle all songs and play the first song
  const shuffleAll = () => {
    if (!songs.length) return;

    // Create a shallow copy of the queue
    const shuffledSongs = [...songs];

    // Fisher–Yates shuffle
    for (let i = shuffledSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSongs[i], shuffledSongs[j]] = [
        shuffledSongs[j],
        shuffledSongs[i],
      ];
    }

    const tracks = shuffledSongs.map(song => ({
      uri: song.uri,
      title: song.filename,
    }));
    // Update queue in context
    addToQueue(tracks);

    // Start playback from the first track
    playTrack(tracks[0]);
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
          {/* Play / Shuffle controls */}
          <View style={styles.playControls}>
            <TouchableOpacity
              style={[styles.actionButton, primaryButton[scheme ?? 'dark']]}
              onPress={() => __playTrack(0)}
            >
              <Ionicons
                name="play-circle"
                size={28}
                color={Colors[scheme ?? 'dark'].primaryButtonText}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: Colors[scheme ?? 'dark'].primaryButtonText },
                ]}
              >
                Play all
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderWidth: 1,
                  borderColor: Colors[scheme ?? 'dark'].secondaryButtonText,
                },
              ]}
              onPress={shuffleAll}
            >
              <MaterialIcons
                name="shuffle"
                size={26}
                color={Colors[scheme ?? 'dark'].secondaryButtonText}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: Colors[scheme ?? 'dark'].secondaryButtonText },
                ]}
              >
                Shuffle
              </Text>
            </TouchableOpacity>
          </View>

          {/* Song list */}
          <FlatList
            data={songs}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => __playTrack(index)}
                style={styles.songRow}
              >
                <View style={styles.songInfo}>
                  <Text numberOfLines={1} style={styles.songTitle}>
                    {item.filename}
                  </Text>
                  <Text style={styles.songSubtext}>
                    {formatDuration(item.duration)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
        </>
      )}
    </View>
  );
}

const getStyles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: Colors[scheme].primaryButtonText,
    },
    playControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[scheme].border, // subtle divider
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 24,
      width: '45%',
    },
    actionText: {
      fontSize: 16,
      fontWeight: '600',
    },
    listContent: {
      paddingVertical: 8,
    },
    songRow: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    songInfo: {
      flex: 1,
    },
    songTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors[scheme].text,
    },
    songSubtext: {
      fontSize: 13,
      color: Colors[scheme].subText,
      marginTop: 2,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#E5E5E5',
      marginLeft: 20, // aligns under text, not icons
    },
  });
