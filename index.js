import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';
import trackPlayerService from './service';

async function initPlayer() {
  // 1. Setup player
  await TrackPlayer.setupPlayer();

  // 2. Set capabilities
  await TrackPlayer.updateOptions({
    stopWithApp: true,
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
    ],
  });

  // 3. Register the playback service
  TrackPlayer.registerPlaybackService(() => trackPlayerService);
}

// call initialization
initPlayer();

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  const rootTag =
    document.getElementById('root') || document.getElementById('X');
  AppRegistry.runApplication('X', { rootTag });
}
