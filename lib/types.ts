export interface Playlist {
    id: number;
    name: string;
    description: string;
    image?: File;
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
    image?: File;
}

export type Sheetmode = 'menu' | 'edit' | 'rename';

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