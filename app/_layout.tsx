import { ThemeProvider } from '@/theme/theme-provider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import AppLayout from './applayout';
import { AudioContext } from '@/lib/audioSound';
import { useAudioPlayer } from 'expo-audio';

export default function RootLayout() {
  const audioPlayer = useAudioPlayer({ uri: '' });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AudioContext.Provider value={audioPlayer}>
          <ThemeProvider>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen name='+not-found' />
            </Stack>
            <StatusBar style='auto' />
          </ThemeProvider>
        </ AudioContext.Provider>
    </GestureHandlerRootView>
  );
}
