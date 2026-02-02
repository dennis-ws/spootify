import { createContext, useContext, useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export const AudioContext = createContext<AudioPlayer | null>(null);

export function useAudioContext() {
    const ap = useContext(AudioContext);
    if (!ap) {
        throw new Error('useAudioContext must be used within an AudioContext.Provider');
    }

    return ap;
}

export async function setAudioMode() {
    await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers'
    })
}