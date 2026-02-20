import { AudioPlayer } from "expo-audio";

export interface Playlist {
    id: number;
    name: string;
    description: string;
    image?: string;
}

export interface PlaylistSongs {
    id: number;
    playlist_id: number;
    song_id: number;
    position: number | null;
    image?: string;
    file: string;
    title: string;
}

export interface Song {
    id: number;
    title: string;
    file: string;
    image?: string;
}

export type Sheetmode = 'menu' | 'edit' | 'rename' | 'add' | 'position';

export interface PlaylistSongCardProp {
    playlist: PlaylistSongs
    isSelected: boolean
    onPress: () => void
}

export interface SongCardProps {
  song: Song
  isSelected: boolean
  destructiveColor: string
  onPress: () => void
  onLongPress?: () => void
}

export interface PlaylistCardProps {
  playlist: Playlist
  isSelected: boolean
  onPress: () => void
  onLongPress: () => void
  destructiveColor: string
}


export type AudioContextValue = {
    audioPlayer: AudioPlayer;
    queue: Song[];
    playPlaylist: (songs: Song[]) => void;
    playNext: () => void;
    playSong: (song: Song) => void;
}

export type DraggableSongListProps = {
    data: Song[]
    onReorder: (songs: Song[]) => void
}