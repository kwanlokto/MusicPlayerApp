import {
  AVPlaybackStatus,
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from '@/type';

/**
 * Node in a doubly-linked list for playback.
 */
type TrackNode = {
  /** The track stored in this node */
  track: Track;
  /** Next node in the list */
  next?: TrackNode;
  /** Previous node in the list */
  prev?: TrackNode;
};

/**
 * Defines the shape of the PlaybackContext.
 */
type PlaybackContextType = {
  /** Whether audio is currently playing */
  isPlaying: boolean;

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

  /** Toggles play/pause of the current track. */
  togglePlay: () => Promise<void>;

  /** Stops playback completely and clears the linked list. */
  stop: () => Promise<void>;
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
  const sound = useRef<Audio.Sound | null>(null); // Currently playing Audio.Sound
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
  const [currentTrackNode, setCurrentTrackNode] = useState<
    TrackNode | undefined
  >(); // Node currently playing

  /** Map to quickly reference nodes by track URI */
  const trackNodeMap = useRef<Map<string, TrackNode>>(new Map());

  useEffect(() => {
    // Setup audio + restore persisted state
    (async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      // Restore track
      const savedTrack = await AsyncStorage.getItem('currentTrackNode');
      if (savedTrack) {
        const track: Track = JSON.parse(savedTrack);

        // Ensure it's added back into the queue (so linked list works)
        if (!trackNodeMap.current.has(track.uri)) {
          addToQueue([track]);
        }

        // Recreate node reference
        const node = trackNodeMap.current.get(track.uri);
        setCurrentTrackNode(node);

        // 🔥 Reload audio, but paused by default
        const { sound: restoredSound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: false },
        );
        sound.current = restoredSound;
      }

      // Restore queue
      const savedQueue = await AsyncStorage.getItem('trackQueue');
      if (savedQueue) {
        const tracks: Track[] = JSON.parse(savedQueue);
        addToQueue(tracks);
      }
    })();

    // Cleanup
    return () => {
      if (sound.current) sound.current.unloadAsync();
    };
  }, []);

  // Persist track + queue whenever current changes
  useEffect(() => {
    if (!currentTrackNode) return;

    const persistState = async () => {
      await AsyncStorage.setItem(
        'currentTrackNode',
        JSON.stringify(currentTrackNode.track),
      );

      const queue = Array.from(trackNodeMap.current.values()).map(n => n.track);
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

      // Unload previous track safely
      if (sound.current) {
        await sound.current.stopAsync();
        await sound.current.unloadAsync();
        sound.current.setOnPlaybackStatusUpdate(null);
      }

      // Load and play new track
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true },
      );

      sound.current = newSound;
      setIsPlaying(true);
      setCurrentTrackNode(node); // React state, async

      // Handle completion
      sound.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          if (node?.next) {
            playTrack(node.next.track); // use linked list directly
          } else {
            stop();
          }
        }
      });
    } catch (e) {
      console.error('Error playing track:', e);
      setIsPlaying(false);
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

  /**
   * Toggles playback of the current track.
   * Pauses if playing, resumes if paused.
   */
  const togglePlay = async () => {
    if (!sound.current) return;
    const status = (await sound.current.getStatusAsync()) as AVPlaybackStatus;
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.current.playAsync();
      setIsPlaying(true);
    }
  };

  /**
   * Stops playback completely
   */
  const stop = async () => {
    if (!sound.current) return;
    await sound.current.stopAsync();
    await sound.current.unloadAsync();
    setIsPlaying(false);
    setCurrentTrackNode(undefined);
    // trackNodeMap.current.clear();
  };

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        currentTrackNode,
        playTrack,
        addToQueue,
        playNext,
        playPrevious,
        togglePlay,
        stop,
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
