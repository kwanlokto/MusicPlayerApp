
import * as MediaLibrary from 'expo-media-library';

export type Playlist = {
  id: string;        // unique id (uuid or Date.now().toString())
  name: string;
  tracks: MediaLibrary.Asset[]; // or just store asset.id/uri
};
