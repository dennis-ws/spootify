import { AudioContext, setAudioMode } from './audioSound'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useEffect, useState } from 'react'
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
        if (!audioStatus.didJustFinish || !nowPlaying) return;

        // we just finished a song, play next
        if (queue.length > 0) {
            playNext();
        } else {
            cleanUp();
        }
        
        

    }, [audioStatus.didJustFinish])

    const playSong = (song: Song) => {
        console.log("Playing song: ", song.title, "\nFile: ", song.file);
        audioPlayer.replace(song.file);
        audioPlayer.play();
        setNowPlaying(song);
        console.log("Finish playing: ", song.title);
    };

    const playPlaylist = (songs: Song[]) => {
        console.log("Attempting to play: ", songs);
        
        if (!songs.length) return;

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