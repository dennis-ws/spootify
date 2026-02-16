import { AudioContext, setAudioMode } from './audioSound'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useEffect, useState, useCallback } from 'react'
import { Song } from './types'


export function AudioProvider({children}: {children: React.ReactNode}) {
    const audioPlayer = useAudioPlayer();
    const audioStatus = useAudioPlayerStatus(audioPlayer);

    const [queue, setQueue] = useState<Song[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Song | null>(null);

    useEffect(() => {
        setAudioMode();
    }, [])

    useEffect(() => {
        if (!audioStatus.didJustFinish) return;

        // we just finished a song, play next
        if (nowPlaying) {
            console.log("Finish playing: ", nowPlaying.title);
            playNext();
        }
        if (!queue.length) {cleanUp()}
        
        

    }, [audioStatus.didJustFinish])

    const playSong = (song: Song) => {
        console.log("Playing song: ", song.title);
        audioPlayer.replace(song.file);
        audioPlayer.play();
        setNowPlaying(song);
    };

    const playPlaylist = (songs: Song[]) => {
        if (!songs.length) return;

        console.log("Attempting to play: ", songs);
        setQueue(songs);
        playSong(songs[0]);
    }

    const playNext = () => {
        setQueue((prev) => {
            const [, ...rest] = prev;
            if (rest[0]) {
                playSong(rest[0]);
            }

            return rest;
        })
    }

    const cleanUp = () => {
        console.log("Cleaning up!");
        setNowPlaying(null);
        setQueue([]);
    }

    return (
        <AudioContext.Provider value={{audioPlayer, queue, playPlaylist, playNext, playSong}}>
            {children}
        </AudioContext.Provider>
    );
}