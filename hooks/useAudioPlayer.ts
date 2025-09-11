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

// setNotificationHandler({
//   handleNotification: async () => ({
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

/**
 * Provider component that wraps the app and manages linked-list audio playback.
 */
export const useCustomAudioPlayer = () => {
  const didFinishRef = useRef<boolean>(false);

  const [title, setTitle] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  // const [currentTrackNode, setCurrentTrackNode] = useState<
  //   TrackNode | undefined
  // >(); // Node currently playing

  /** Map to quickly reference nodes by track URI */
  // const trackNodeMap = useRef<Map<string, TrackNode>>(new Map());

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

        // Show persistent notification on Android
        // if (Platform.OS === 'android') {
        //   await scheduleNotificationAsync({
        //     content: {
        //       title: 'Now Playing',
        //       body: title,
        //     },
        //     trigger: null,
        //   });
        // }
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

      // if (Platform.OS === 'android') {
      //   await setNotificationChannelAsync('music', {
      //     name: 'Music Playback',
      //     importance: AndroidImportance.MAX, // ✅ still works
      //     sound: null,
      //     vibrationPattern: [0, 250, 250, 250],
      //     lightColor: '#FF231F7C',
      //     lockscreenVisibility: AndroidNotificationVisibility.PUBLIC, // ✅ use this
      //   });
      // }
      // Restore queue
      // const savedQueue = await AsyncStorage.getItem('trackQueue');
      // if (savedQueue) {
      //   const tracks: Track[] = JSON.parse(savedQueue);

      //   await TrackPlayer.reset();
      //   await addToQueue(tracks);
      // }
    };

    setup();

    // Cleanup
    return () => {
      TrackPlayer.reset();
      // dismissAllNotificationsAsync();
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
   * Callback invoked by `Audio.Sound` whenever the playback status changes.
   * Updates the current track's playback position and duration, and handles track completion.
   *
   * @param status - The current playback status provided by `expo-av`.
   * @param node - The current `TrackNode` being played in the linked list.
   */
  // const onPlaybackStatusUpdate = (
  //   status: AudioStatus,
  //   node: TrackNode | undefined,
  // ) => {
  //   if (!status.isLoaded) return;
  //   setDuration(status.duration);
  //   setPosition(status.currentTime);

  //   if (status.isLoaded && status.didJustFinish && !didFinishRef.current) {
  //     didFinishRef.current = true;
  //     if (node?.next) {
  //       playTrack(node.next.track); // use linked list directly
  //     } else {
  //       stopTrack();
  //     }
  //   }
  // };

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

    // if (Platform.OS === 'android') {
    //   await dismissAllNotificationsAsync();
    // }
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
