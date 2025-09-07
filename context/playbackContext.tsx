import { Track, TrackNode } from '@/type';
import { AVPlaybackStatus, Audio } from 'expo-av';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Defines the shape of the PlaybackContext.
 */
type PlaybackContextType = {
  /** Whether audio is currently playing */
  isPlaying: boolean;

  /** Total duration of the current track, in milliseconds */
  duration: number;

  /** Current playback position within the track, in milliseconds */
  position: number;

  /** Current track node being played */
  currentTrackNode?: TrackNode;

  /**
   * Plays a single track immediately, updating currentTrackNode.
   * @param track Track to play
   */
  playTrack: (track: Track) => Promise<void>;

  /**
   * Adds multiple tracks to the playback linked list.
   * If the list is empty, the first track becomes the head node.
   * @param tracks Array of Track objects to enqueue
   */
  addToQueue: (tracks: Track[]) => void;

  /** Plays the next track in the linked list. Stops if at the end. */
  playNext: () => void;

  /** Plays the previous track in the linked list, if available. */
  playPrevious: () => void;

  handleSlidingComplete: (value: number) => void;

  /** Toggles play/pause of the current track. */
  togglePlay: () => Promise<void>;

  /** Stops playback completely and clears the linked list. */
  stopTrack: () => Promise<void>;
};

/**
 * React context for audio playback.
 */
const PlaybackContext = createContext<PlaybackContextType | undefined>(
  undefined,
);

/**
 * Provider component that wraps the app and manages linked-list audio playback.
 */
export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { play, pause, stop, isPlaying, soundRef } = useAudioPlayer();

  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [currentTrackNode, setCurrentTrackNode] = useState<
    TrackNode | undefined
  >(); // Node currently playing

  /** Map to quickly reference nodes by track URI */
  const trackNodeMap = useRef<Map<string, TrackNode>>(new Map());

  useEffect(() => {
    // Setup audio + restore persisted state
    const loadState = async () => {
      // await Audio.setAudioModeAsync({
      //   allowsRecordingIOS: false,
      //   staysActiveInBackground: true,
      //   interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      //   playsInSilentModeIOS: true,
      //   shouldDuckAndroid: true,
      //   interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      //   playThroughEarpieceAndroid: true,
      // });
      // Restore queue
      const savedQueue = await AsyncStorage.getItem('trackQueue');
      if (savedQueue) {
        const tracks: Track[] = JSON.parse(savedQueue);
        addToQueue(tracks);
      }

      // Restore track
      const savedTrack = await AsyncStorage.getItem('currentTrack');
      if (savedTrack) {
        const track: Track = JSON.parse(savedTrack);

        // Recreate node reference
        const node = trackNodeMap.current.get(track.uri);
        setCurrentTrackNode(node);

        const { sound: restoredSound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: false },
        );
        soundRef.current = restoredSound;
        soundRef.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) =>
          onPlaybackStatusUpdate(status, node),
        );
      }
    };

    loadState();

    // Cleanup
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  // Persist track + queue whenever current changes
  useEffect(() => {
    if (!currentTrackNode) return;

    const persistState = async () => {
      if (!currentTrackNode) return;
      await AsyncStorage.setItem(
        'currentTrack',
        JSON.stringify(currentTrackNode.track),
      );
      // Convert linked list to ordered array
      const queue: Track[] = [];
      let node: TrackNode | undefined = currentTrackNode;
      while (node && node?.next?.track.uri !== currentTrackNode.track.uri) {
        queue.push(node.track);
        node = node.next;
      }
      await AsyncStorage.setItem('trackQueue', JSON.stringify(queue));
    };

    persistState();
  }, [currentTrackNode]);

  /**
   * Plays a single track immediately.
   * Stops any currently playing track.
   * Automatically sets up next track when finished.
   * @param track Track to play
   */
  const playTrack = async (track: Track) => {
    try {
      // Find the node immediately (don’t wait for React state)
      const node = trackNodeMap.current.get(track.uri);
      setCurrentTrackNode(node); // React state, async

      await play(track);

      // Handle completion
      soundRef.current?.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) =>
        onPlaybackStatusUpdate(status, node),
      );
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
  const onPlaybackStatusUpdate = (
    status: AVPlaybackStatus,
    node: TrackNode | undefined,
  ) => {
    if (!status.isLoaded) return;
    setDuration(status.durationMillis ?? 0);
    setPosition(status.positionMillis ?? 0);

    if (status.isLoaded && status.didJustFinish) {
      if (node?.next) {
        play(node.next.track); // use linked list directly
      } else {
        stop();
      }
    }
  };

  /**
   * Adds multiple tracks to the playback linked list.
   * Links nodes together to form a doubly-linked list.
   * @param tracks Array of Track objects
   */
  const addToQueue = (tracks: Track[]) => {
    let prevNode: TrackNode | undefined;
    let headNode: TrackNode | undefined;
    tracks.forEach(track => {
      const node: TrackNode = { track, prev: prevNode };
      if (prevNode) prevNode.next = node;
      else headNode = node; // Set head if list empty
      prevNode = node;
      trackNodeMap.current.set(track.uri, node);
    });
    if (prevNode) prevNode.next = headNode; // Create a loop
  };

  /**
   * Plays the next track in the linked list.
   * Stops playback if there is no next node.
   */
  const playNext = () => {
    if (!currentTrackNode?.next) {
      stop();
      return;
    }
    playTrack(currentTrackNode.next.track);
  };

  /**
   * Plays the previous track in the linked list.
   * Does nothing if there is no previous node.
   */
  const playPrevious = () => {
    if (!currentTrackNode?.prev) return;
    playTrack(currentTrackNode.prev.track);
  };

  const handleSlidingComplete = async (value: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(value);
  };

  /**
   * Toggles playback of the current track.
   * Pauses if playing, resumes if paused.
   */
  const togglePlay = async () => {
    if (!soundRef.current) return;
    const status = (await soundRef.current.getStatusAsync()) as AVPlaybackStatus;
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  /**
   * Stops playback completely
   */
  const stopTrack = async () => {
    stop()
  };

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        position,
        duration,
        currentTrackNode,
        playTrack,
        addToQueue,
        playNext,
        playPrevious,
        handleSlidingComplete,
        togglePlay,
        stopTrack,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

/**
 * Hook to access the playback context.
 * Throws an error if used outside of PlaybackProvider.
 */
export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used inside PlaybackProvider');
  return ctx;
};
