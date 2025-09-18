import { useEffect, useState } from 'react';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  Track,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import AsyncStorage from '@react-native-async-storage/async-storage';

const fadeVolume = async (target: number, duration: number = 500) => {
  const current = await TrackPlayer.getVolume();
  const steps = 10;
  const stepTime = duration / steps;
  const diff = target - current;

  for (let i = 1; i <= steps; i++) {
    const newVolume = current + (diff * i) / steps;
    await TrackPlayer.setVolume(newVolume);
    await new Promise(resolve => setTimeout(resolve, stepTime));
  }
};

/**
 * Provider component that wraps the app and manages linked-list audio playback.
 */
export const useCustomAudioPlayer = () => {
  const [title, setTitle] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // --- TrackPlayer event listeners ---
  useTrackPlayerEvents(
    [
      Event.PlaybackState,
      Event.PlaybackProgressUpdated,
      Event.PlaybackActiveTrackChanged,
      Event.RemoteDuck,
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
      }

      if (event.type === Event.RemoteDuck) {
        if (event.paused) {
          // Call interruption → fade out and pause
          await fadeVolume(0.0, 800); // fade out in 0.8s
          await TrackPlayer.pause();
        } else {
          // Ducking released → fade back in
          await TrackPlayer.play();
          await fadeVolume(1.0, 800); // fade in in 0.8s
        }
      }
    },
  );

  useEffect(() => {
    const setup = async () => {
      try {
        // Prevent initializing the player twice
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.ContinuePlayback, // or StopPlayback, or PausePlayback
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
      } catch {}

      const savedQueue = await AsyncStorage.getItem('trackQueue');
      if (savedQueue) {
        const tracks: Track[] = JSON.parse(savedQueue);
        setTitle(tracks[0].title);
        await addToQueue(tracks);
        await TrackPlayer.skip(0);
      }
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
    await TrackPlayer.add(tracks);
    // await AsyncStorage.setItem('trackQueue', JSON.stringify(tracks));
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

  const getQueue = async () => {
    try {
      return await TrackPlayer.getQueue();
    } catch (err) {
      console.log('Error fetching queue:', err);
    }
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
    getQueue,
  };
};
