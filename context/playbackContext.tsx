import React, { createContext, useContext } from 'react';

import { Track } from 'react-native-track-player';
import { useCustomAudioPlayer } from '@/hooks/useAudioPlayer';

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
  title?: string;

  /**
   * Plays a single track immediately, updating currentTrackNode.
   * @param track Track to play
   */
  playTrack: (index: number) => Promise<void>;

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
  const {
    isPlaying,
    position,
    duration,
    title,
    playTrack,
    addToQueue,
    playNext,
    playPrevious,
    handleSlidingComplete,
    togglePlay,
    stopTrack,
  } = useCustomAudioPlayer();

  return (
    <PlaybackContext.Provider
      value={{
        isPlaying,
        position,
        duration,
        title,
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
