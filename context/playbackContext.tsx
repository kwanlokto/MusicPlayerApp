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

type Track = {
  uri: string;
  title: string;
};

type PlaybackContextType = {
  trackTitle: string;
  isPlaying: boolean;
  queue: Track[];
  playTrack: (uri: string, title: string) => Promise<void>;
  setQueue: (tracks: Track[]) => void;
  playNext: () => void;
  togglePlay: () => Promise<void>;
  stop: () => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sound = useRef<Audio.Sound | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueueState] = useState<Track[]>([]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const playTrack = async (uri: string, title: string) => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current.setOnPlaybackStatusUpdate(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      sound.current = newSound;
      setTrackTitle(title);
      setIsPlaying(true);

      // Auto-play next track when finished
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

  const setQueue = (tracks: Track[]) => {
    setQueueState(tracks);
  };

  const playNext = () => {
    if (queue.length === 0) {
      stop();
      return;
    }

    const [nextTrack, ...rest] = queue;
    setQueueState(rest);
    playTrack(nextTrack.uri, nextTrack.title);
  };

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

export const usePlayback = () => {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used inside PlaybackProvider');
  return ctx;
};
