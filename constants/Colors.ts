import { TextStyle } from "react-native";

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
type ButtonStyle = {
  backgroundColor: string;
  alignItems: 'center';
  justifyContent: 'center';
};

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     text: '#11181C',
//     background: '#fff',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };

export const Colors = {
  light: {
    background: '#f5f5f5',
    tint: tintColorLight,
    icon: '#687076',
    card: '#fff',
    text: '#000',
    subText: '#555',
    track: '#333',
    disc: '#ccc',
    primaryButtonText: '#ffffff',
    secondaryButtonText: '#000000',
    secondaryButtonBg: '#f0f0f0',
    progressBg: '#000000',
    border: '#E5E5E5',
  },
  dark: {
    background: '#121212',
    tint: tintColorDark,
    icon: '#9BA1A6',
    card: '#1e1e1e',
    text: '#ddd',
    subText: '#aaa',
    track: '#bbb',
    disc: '#333',
    primaryButtonText: '#000000',
    secondaryButtonText: '#ffffff',
    secondaryButtonBg: '#2a2a2a',
    progressBg: '#ffffff',
    border: '#2A2A2A',
  },
};

export const primaryButton: Record<'light' | 'dark', ButtonStyle> = {
  light: {
    backgroundColor: '#303030', // light gray surface (like YT Music cards)
    alignItems: 'center',
    justifyContent: 'center',
  },
  dark: {
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const songTitle: Record<'light' | 'dark', TextStyle> = {
  light: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors['light'].text,
  },
  dark: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors['dark'].text,
  },
};

const center = {
  alignItems: 'center',
  justifyContent: 'center',
};
