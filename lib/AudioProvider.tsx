import { AudioContext, setAudioMode } from './audioSound'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { useEffect, useState } from 'react'
import { Song } from './types'


export function AudioProvider({children}: {children: React.ReactNode}) {
    const audioPlayer = useAudioPlayer();
    const audioStatus = useAudioPlayerStatus(audioPlayer);

    const [queue, setQueue] = useState<Song[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
    const [index, setIndex] = useState<number>(0);

    const [loop, setLoop] = useState<boolean>(false);

    useEffect(() => {
        setAudioMode();
    }, [])

    useEffect(() => {
        // force the audio player to play, there's a bug where if you play all again at the end
        // of a song's duration, the audio player stop playing after the first song
        audioPlayer.play();
        if (!audioStatus.didJustFinish) return;

        // we just finished a song, play next
        if (index < queue.length - 1) {
            console.log("Finish Playing! \nCurrent Queue: ", queue);
            playNext();
        } else if (loop) {
            console.log("Looping!");
            setIndex(0);
            playSong(queue[0]);
        } else {
            cleanUp();
        }
        
        

    }, [audioStatus.didJustFinish, loop])

    const loopPlaylist = () => {
        setLoop(prev => {
            console.log("Loop button pressed! Loop:", !prev);
            return !prev;
        })
    }

    const playSong = (song: Song) => {
        console.log("Playing song: ", song.title, "\nFile: ", song.file);
        audioPlayer.replace(song.file);
        audioPlayer.play();
        setNowPlaying(song);
    };

    const playPlaylist = (songs: Song[]) => {
        console.log("Attempting to play: ", songs);
        
        if (!songs.length) return;
        setQueue(songs);
        setIndex(0);
        playSong(songs[0]);
    }

    const playNext = () => {
        setIndex(prev => {
            const next = prev + 1;
            playSong(queue[next]);
            return next;
        });
    }

    const pausePlayer = () => {
        audioPlayer.pause();
    }

    const cleanUp = () => {
        console.log("Cleaning up!");
        setNowPlaying(null);
        setQueue([]);
        setIndex(0);
    }

    return (
        <AudioContext.Provider value={{audioPlayer, queue, playPlaylist, playNext, playSong, loopPlaylist, loop}}>
            {children}
        </AudioContext.Provider>
    );
}