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

/**
 * Represents a single audio track with a URI and title.
 */
type Track = {
  uri: string;
  title: string;
};

/**
 * Defines the shape of the PlaybackContext.
 */
type PlaybackContextType = {
  /** The title of the currently playing track */
  trackTitle: string;

  /** Whether audio is currently playing */
  isPlaying: boolean;

  /** Queue of tracks to be played next */
  queue: Track[];

  /**
   * Plays a single track immediately.
   * If a track is already playing, it stops it first.
   * @param uri The URI of the track to play
   * @param title The display title of the track
   */
  playTrack: (uri: string, title: string) => Promise<void>;

  /**
   * Sets the playback queue.
   * @param tracks Array of Track objects to queue
   */
  setQueue: (tracks: Track[]) => void;

  /**
   * Plays the next track in the queue.
   * If the queue is empty, stops playback.
   */
  playNext: () => void;

  /**
   * Toggles playback of the current track.
   * Pauses if playing, resumes if paused.
   */
  togglePlay: () => Promise<void>;

  /**
   * Stops playback and clears the queue and current track.
   */
  stop: () => Promise<void>;
};

// Create React context for playback
const PlaybackContext = createContext<PlaybackContextType | undefined>(
  undefined,
);

/**
 * Provider component that wraps the app and manages audio playback.
 */
export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sound = useRef<Audio.Sound | null>(null); // Ref to the currently playing Audio.Sound
  const [trackTitle, setTrackTitle] = useState(''); // Current track title
  const [isPlaying, setIsPlaying] = useState(false); // Playback state
  const [queue, setQueueState] = useState<Track[]>([]); // Tracks queued to play next

  /**
   * Configure audio mode for background playback and cleanup on unmount.
   */
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true, // Continue playing when app is backgrounded
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });

    // Cleanup when component unmounts
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  /**
   * Plays a track immediately, stopping any currently playing track.
   * Automatically triggers `playNext()` when the track finishes.
   */
  const playTrack = async (uri: string, title: string) => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current.setOnPlaybackStatusUpdate(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
      );

      sound.current = newSound;
      setTrackTitle(title);
      setIsPlaying(true);

      // Auto-play next track when current track finishes
      sound.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          playNext();
        }
      });
    } catch (e) {
      console.error('Error playing track:', e);
      setIsPlaying(false);
    }
  };

  /**
   * Updates the playback queue.
   */
  const setQueue = (tracks: Track[]) => {
    setQueueState(tracks);
  };

  /**
   * Plays the next track in the queue.
   * Clears playback if queue is empty.
   */
  const playNext = () => {
    if (queue.length === 0) {
      stop();
      return;
    }

    const [nextTrack, ...rest] = queue;
    setQueueState(rest);
    playTrack(nextTrack.uri, nextTrack.title);
  };

  /**
   * Toggles play/pause of the current track.
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
   * Stops playback completely and clears the queue.
   */
  const stop = async () => {
    if (!sound.current) return;
    await sound.current.stopAsync();
    await sound.current.unloadAsync();
    setIsPlaying(false);
    setTrackTitle('');
    setQueueState([]);
  };

  return (
    <PlaybackContext.Provider
      value={{
        trackTitle,
        isPlaying,
        queue,
        playTrack,
        setQueue,
        playNext,
        togglePlay,
        stop,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

/**
 * Hook to use the playback context.
 * Throws an error if used outside of the PlaybackProvider.
 */
export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used inside PlaybackProvider');
  return ctx;
};
