export interface Playlist {
    id: number,
    name: string,
    description: string
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
}

export interface PlaylistSongCardProp {
    playlist: PlaylistSongs
    isSelected: boolean
    onPress: () => void
}