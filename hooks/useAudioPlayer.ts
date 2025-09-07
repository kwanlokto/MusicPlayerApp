import { Track, TrackNode } from '@/type';
import {
  AudioPlayer,
  AudioStatus,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';
import {
  useEffect,
  useRef,
  useState
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Provider component that wraps the app and manages linked-list audio playback.
 */
export const useAudioPlayer = () => {
  const sound = useRef<AudioPlayer | null>(null); // Currently playing Audio.Sound
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
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
      await setAudioModeAsync({
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
      });
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

        const newSound = createAudioPlayer(track.uri);
        newSound.addListener('playbackStatusUpdate', (status: AudioStatus) => {
          onPlaybackStatusUpdate(status, node);
        });
        sound.current = newSound;
      }
    };

    loadState();

    // Cleanup
    return () => {
      if (sound.current) sound.current.pause();
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

      // Load and play new track
      const newSound = createAudioPlayer(track.uri);
      newSound.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        onPlaybackStatusUpdate(status, node);
      });

      sound.current = newSound;
      setIsPlaying(true);
      setCurrentTrackNode(node); // React state, async
    } catch (e) {
      console.error('Error playing track:', e);
      setIsPlaying(false);
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
    status: AudioStatus,
    node: TrackNode | undefined,
  ) => {
    if (!status.isLoaded) return;
    console.log(status);
    setDuration(status.duration ?? 0);
    setPosition(status.currentTime ?? 0);

    if (status.isLoaded && status.didJustFinish) {
      if (node?.next) {
        playTrack(node.next.track); // use linked list directly
      } else {
        stopTrack();
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
      stopTrack();
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
    if (!sound.current) return;
    await sound.current.seekTo(value);
  };

  /**
   * Toggles playback of the current track.
   * Pauses if playing, resumes if paused.
   */
  const togglePlay = async () => {
    if (!sound.current) return;
    if (!sound.current.isLoaded) return;

    if (sound.current.playing) {
      sound.current.pause();
      setIsPlaying(false);
    } else {
      sound.current.play();
      setIsPlaying(true);
    }
  };

  /**
   * Stops playback completely
   */
  const stopTrack = async () => {
    if (!sound.current) return;
    sound.current.pause();
    // await sound.current.stopAndUnloadAsync();
    setIsPlaying(false);
    setCurrentTrackNode(undefined);
    trackNodeMap.current.clear();
  };

  return {
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
  };
};

