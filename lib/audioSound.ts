import { createContext, useContext } from 'react';
import { setAudioModeAsync } from 'expo-audio';
import { AudioContextValue } from './types'

export const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudioContext() {
    const ap = useContext(AudioContext);
    if (!ap) {
        throw new Error('useAudioContext must be used within an AudioContext.Provider');
    }

    return ap;
}

export async function setAudioMode() {
    await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
    })
}