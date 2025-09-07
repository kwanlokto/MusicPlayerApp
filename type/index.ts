import * as MediaLibrary from 'expo-media-library';

export type Playlist = {
  id: string; // unique id (uuid or Date.now().toString())
  name: string;
  tracks: MediaLibrary.Asset[]; // or just store asset.id/uri
};

export type Track = {
  /** URI of the track to play */
  uri: string;
  /** Display title of the track */
  title: string;
};

/**
 * Node in a doubly-linked list for playback.
 */
export type TrackNode = {
  /** The track stored in this node */
  track: Track;
  /** Next node in the list */
  next?: TrackNode;
  /** Previous node in the list */
  prev?: TrackNode;
};
