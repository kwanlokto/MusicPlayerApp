import { useEffect, useRef, useState } from 'react';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  Track,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Provider component that wraps the app and manages linked-list audio playback.
 */
export const useCustomAudioPlayer = () => {
  const didFinishRef = useRef<boolean>(false);

  const [title, setTitle] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // --- TrackPlayer event listeners ---
  useTrackPlayerEvents(
    [
      Event.PlaybackState,
      Event.PlaybackProgressUpdated,
      Event.PlaybackActiveTrackChanged,
    ],
    async event => {
      if (event.type === Event.PlaybackState) {
        setIsPlaying(event.state === State.Playing);
      }

      if (event.type === Event.PlaybackProgressUpdated) {
        setPosition(event.position);
        setDuration(event.duration);
      }

      if (
        event.type === Event.PlaybackActiveTrackChanged &&
        event.index != null
      ) {
        const track = await TrackPlayer.getTrack(event.index);
        const { title } = track || {};
        setTitle(title);

        const queue = await TrackPlayer.getQueue();
        await AsyncStorage.setItem('trackQueue', JSON.stringify(queue));

        setIsPlaying(true);
      }
    },
  );

  useEffect(() => {
    const setup = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback, // or StopPlayback, or PausePlayback
        },
        progressUpdateEventInterval: 0.1,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });
    };

    setup();

    // Cleanup
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  /**
   * Plays a single track immediately.
   * Stops any currently playing track.
   * Automatically sets up next track when finished.
   * @param track Track to play
   */
  const playTrack = async (index: number) => {
    try {
      // Find the node immediately (don’t wait for React state)

      // Load and play new track
      await TrackPlayer.skip(index);
      await TrackPlayer.play();

      didFinishRef.current = false;

      // Show persistent notification on Android

      // reset if playback restarted
      didFinishRef.current = false;
    } catch (e) {
      console.error('Error playing track:', e);
    }
  };

  /**
   * Adds multiple tracks to the playback linked list.
   * Links nodes together to form a doubly-linked list.
   * @param tracks Array of Track objects
   */
  const addToQueue = async (tracks: Track[]) => {
    await TrackPlayer.reset();
    await TrackPlayer.add(
      tracks.map(track => {
        return {
          url: track.url,
          title: track.title,
          artist: '',
        };
      }),
    );
  };

  /**
   * Plays the next track in the linked list.
   * Stops playback if there is no next node.
   */
  const playNext = async () => {
    await TrackPlayer.skipToNext();
  };

  /**
   * Plays the previous track in the linked list.
   * Does nothing if there is no previous node.
   */
  const playPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  const handleSlidingComplete = async (value: number) => {
    await TrackPlayer.seekTo(value); // TrackPlayer uses seconds
  };

  /**
   * Toggles playback of the current track.
   * Pauses if playing, resumes if paused.
   */
  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  /**
   * Stops playback completely
   */
  const stopTrack = async () => {
    await TrackPlayer.stop();
    await AsyncStorage.removeItem('currentTrack');
    await AsyncStorage.removeItem('trackQueue');
  };

  return {
    title,
    isPlaying,
    position,
    duration,
    playTrack,
    addToQueue,
    playNext,
    playPrevious,
    handleSlidingComplete,
    togglePlay,
    stopTrack,
  };
};
