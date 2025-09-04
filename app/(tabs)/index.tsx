import { Colors, primaryButton } from '@/constants/Colors';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { usePlayback } from '@/context/playbackContext';
import { formatTime } from '@/helpers';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export default function Index() {
  const {
    position,
    duration,
    currentTrackNode,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    handleSlidingComplete,
  } = usePlayback();
  const [seekPosition, setSeekPosition] = useState(0);
  const scheme = useColorScheme();
  const styles = getStyles(scheme ?? 'dark');

  return (
    <View style={styles.container}>
      {!currentTrackNode?.track?.title ? (
        <>
          <Text style={styles.title}>🎶 Music Player</Text>
          <Text style={styles.track}>No track playing</Text>
        </>
      ) : (
        <View style={styles.card}>
          {/* <Image source={{ uri: albumArt }} style={styles.albumArt} /> */}
          <View style={styles.cdContainer}>
            <View style={styles.outerDisc}>
              <View style={styles.innerHole}></View>
            </View>
          </View>

          <View
            style={{ marginBottom: 20, alignItems: 'center', width: '90%' }}
          >
            <Text style={styles.title}>{currentTrackNode.track.title}</Text>
            <Text style={styles.artist}>Unknown Artist</Text>

            {/* Progress Bar */}
            <Slider
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onValueChange={val => {
                setSeekPosition(val);
              }}
              onSlidingComplete={(value: number) => {
                handleSlidingComplete(value);
              }}
              minimumTrackTintColor="#ffffff"
              maximumTrackTintColor="#666"
              thumbTintColor="#ffffff"
              style={{ width: '100%' }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text style={{ color: Colors[scheme ?? 'dark'].subText }}>
                {formatTime(position)}
              </Text>
              <Text style={{ color: Colors[scheme ?? 'dark'].subText }}>
                {formatTime(duration)}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={playPrevious}
                style={{
                  ...styles.controlButton,
                }}
              >
                <Ionicons
                  name="play-skip-back"
                  size={32}
                  color={Colors[scheme ?? 'dark'].secondaryButtonText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlay}
                style={{
                  ...styles.playButton,
                  ...primaryButton[scheme ?? 'dark'],
                }}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color={Colors[scheme ?? 'dark'].primaryButtonText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={playNext}
                style={{
                  ...styles.controlButton,
                }}
              >
                <Ionicons
                  name="play-skip-forward"
                  size={32}
                  color={Colors[scheme ?? 'dark'].secondaryButtonText}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    cdContainer: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      marginTop: '40%',
    },
    card: {
      display: 'flex',
      width: '100%',
      height: '100%',
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    albumArt: {
      width: 250,
      height: 250,
      borderRadius: 20,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors[scheme].text,
      textAlign: 'center',
    },
    artist: {
      fontSize: 16,
      color: Colors[scheme].subText,
      marginBottom: 40,
      textAlign: 'center',
    },
    track: {
      color: Colors[scheme].track,
      fontSize: 18,
      marginBottom: 40,
    },
    progressContainer: {
      width: '100%',
      height: 4,
      backgroundColor: Colors[scheme].progressBg,
      borderRadius: 2,
      marginBottom: 24,
    },
    progress: {
      width: '40%', // you can tie this to actual playback progress
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 2,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '80%',
    },
    controlButton: {
      padding: 14,
      borderRadius: 50,
    },
    playButton: {
      padding: 20,
      borderRadius: 50,
      marginHorizontal: 20,
    },
    outerDisc: {
      width: 250,
      height: 250,
      borderRadius: 125,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors[scheme].disc,
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
      backgroundColor: Colors[scheme].card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderLetter: {
      fontSize: 32,
      fontWeight: '700',
      color: '#000',
    },
  });
