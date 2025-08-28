import {
  Audio,
  AVPlaybackStatus,
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

type PlaybackContextType = {
  sound: Audio.Sound | null;
  trackTitle: string;
  isPlaying: boolean;
  playTrack: (uri: string, title: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  stop: () => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextType | undefined>(
  undefined,
);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [trackTitle, setTrackTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const sound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Initialize background audio once on mount
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true, // <-- background playback
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
  }, []);

  const playTrack = async (uri: string, title: string) => {
    if (sound.current) {
      await sound.current.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    sound.current = newSound;
    setTrackTitle(title);
    await sound.current.playAsync();
    setIsPlaying(true);
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
    setIsPlaying(false);
  };

  return (
    <PlaybackContext.Provider
      value={{
        sound: sound.current,
        trackTitle,
        isPlaying,
        playTrack,
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
