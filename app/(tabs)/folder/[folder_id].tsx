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
          {/* Play / Shuffle buttons */}
          <View style={styles.playControls}>
            {/* Play All */}
            <TouchableOpacity
              style={[styles.actionButton, primaryButton[scheme ?? 'dark']]}
              onPress={() => __playTrack(0)}
            >
              <Ionicons
                name="play-circle"
                size={24}
                color={Colors[scheme ?? 'dark'].primaryButtonText}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.playButtonText}>Play All</Text>
            </TouchableOpacity>

            {/* Shuffle All */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors[scheme ?? 'dark'].secondaryButtonBg },
              ]}
              onPress={shuffleAll}
            >
              <MaterialIcons
                name="shuffle"
                size={24}
                color={Colors[scheme ?? 'dark'].secondaryButtonText}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.shuffleButtonText}>Shuffle All</Text>
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
const getStyles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    playControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 32,
      paddingVertical: 12,
      width: '100%', // make container span full width
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 24,
      width: '47.5%',
    },
    playButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors[scheme ?? 'dark'].primaryButtonText,
    },
    shuffleButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors[scheme ?? 'dark'].secondaryButtonText,
    },
    songItem: {
      backgroundColor: Colors[scheme].card,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    songTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[scheme].text,
      flexShrink: 1,
    },
    songSubtext: {
      fontSize: 12,
      color: Colors[scheme].subText,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: Colors[scheme].subText,
    },
  });
