import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { usePlayback } from '@/context/playbackContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function Index() {
  const { currentTrackNode, isPlaying, togglePlay, playNext, playPrevious } =
    usePlayback();
  const scheme = useColorScheme();
  const styles = getStyles(scheme);

  return (
    <View style={styles.container}>
      {!currentTrackNode?.track?.title ? (
        <View style={styles.container}>
          <Text style={styles.title}>🎶 Music Player</Text>
          <Text style={styles.track}>No track playing</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {/* <Image source={{ uri: albumArt }} style={styles.albumArt} /> */}
          <View style={styles.cdContainer}>
            <View style={styles.outerDisc}>
              <View style={styles.innerHole}></View>
            </View>
          </View>
          <Text style={styles.title}>{currentTrackNode.track.title}</Text>
          <Text style={styles.artist}>Unknown Artist</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progress}></View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={playPrevious}
              style={styles.controlButton}
            >
              <Ionicons name="play-skip-back" size={36} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={playNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={36} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (scheme: 'light' | 'dark' | null | undefined) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === 'dark' ? '#121212' : '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      width: '100%',
      backgroundColor: scheme === 'dark' ? '#1e1e1e' : '#fff',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    albumArt: {
      width: 250,
      height: 250,
      borderRadius: 20,
      marginBottom: 20,
    },
    title: {
      marginTop: 24,
      fontSize: 24,
      fontWeight: '700',
      color: scheme === 'dark' ? '#fff' : '#000',
      textAlign: 'center',
    },
    artist: {
      fontSize: 16,
      color: scheme === 'dark' ? '#bbb' : '#555',
      marginBottom: 20,
      textAlign: 'center',
    },
    track: {
      color: scheme === 'dark' ? '#bbb' : '#333',
      fontSize: 18,
      marginBottom: 40,
    },
    progressContainer: {
      width: '80%',
      height: 4,
      backgroundColor: scheme === 'dark' ? '#333' : '#ccc',
      borderRadius: 2,
      marginBottom: 30,
    },
    progress: {
      width: '40%', // you can tie this to actual playback progress
      height: '100%',
      backgroundColor: '#1DB954',
      borderRadius: 2,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '80%',
    },
    controlButton: {
      backgroundColor: '#1DB954',
      padding: 14,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playButton: {
      backgroundColor: '#1DB954',
      padding: 22,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
    },
    cdContainer: {
      marginBottom: 20,
    },
    outerDisc: {
      width: 250,
      height: 250,
      borderRadius: 125,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: scheme === 'dark' ? '#333' : '#ccc',
      shadowOpacity: scheme === 'dark' ? 0.1 : 0.3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 6,
      elevation: 5,
    },
    innerHole: {
      width: 80,
      height: 80,
      borderRadius: 45,
      backgroundColor: scheme === 'dark' ? '#1e1e1e' : '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderLetter: {
      fontSize: 32,
      fontWeight: '700',
      color: '#000',
    },
  });
