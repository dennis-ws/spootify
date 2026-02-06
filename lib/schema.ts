import { getDB } from "./db";
import { Playlist, PlaylistSongs, Song} from './types';

export async function createPlaylistTable() {
    const db = await getDB();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS PLAYLISTS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        );
    `);
}

export async function insertPlaylist(name: string) {
    const db = await getDB();

    await db.runAsync(`
        INSERT INTO PLAYLISTS (
            name, description
        ) VALUES (?, ?)`,
    [
        name,
        ""
    ]
    );
}

export async function deletePlaylist(id: number) {
    const db = await getDB();

    await db.runAsync(
        `DELETE FROM PLAYLISTS WHERE id = ${id}`
    )
}

export async function getPlaylists() {
    const db = await getDB();

    const results = await db.getAllAsync(`SELECT * FROM PLAYLISTS`);

    return results;
}

export async function createPlaylistSongsTable() {
    const db = await getDB();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS PLAYLIST_SONGS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            playlist_id INTEGER,
            song_id INTEGER,
            position INTEGER,
            image TEXT,
            file TEXT,
            FOREIGN KEY (playlist_id) REFERENCES PLAYLISTS(id)
            FOREIGN KEY (song_id) REFERENCES SONGS(id)
        );
    `);
}

export async function getSongsFromPid(playlistId: number): Promise<PlaylistSongs[]> {
    const db = await getDB();

    const results = await db.getAllAsync<PlaylistSongs>(`
        SELECT
            s.id,
            s.title,
            s.file,
        FROM PLAYLIST_SONGS p
        INNER JOIN SONGS s
            ON s.id = p.song_id
        WHERE p.playlist_id = ?
        ORDER BY p.position ASC
        `, [playlistId]);

    return results;
}

export async function insertPlaylistSongsTable(playlistId: number, songId: number) {
    const db = await getDB();

    await db.runAsync(`
        INSERT OR REPLACE INTO PLAYLIST_SONGS (
            playlist_id, song_id
        ) VALUES (?, ?)`,
        [
            playlistId, 
            songId
        ]    
    );
}

export async function getPlaylistSongsTable() {
    const db = await getDB();

    const results = await db.getAllAsync(`SELECT * FROM PLAYLIST_SONGS`);
    
    return results;
}

export async function getPlaylistSongs(playlistId: number): Promise<PlaylistSongs[]> {
    const db = await getDB();
    const results = await db.getAllAsync<PlaylistSongs>(`
        SELECT * 
        FROM PLAYLIST_SONGS
        WHERE playlist_id = ${playlistId}
    `);

    return results;
}

export async function createSongTable() {
    const db = await getDB();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS SONGS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            file TEXT NOT NULL
        );
    `);
}

export async function getSongTable(): Promise<Song[]> {
    const db = await getDB();
    const results = await db.getAllAsync<Song>(`SELECT * FROM SONGS`);
    return results;
}

export async function getSong(id: number): Promise<Song> {
    const db = await getDB();
    const results = await db.getAllAsync<Song>(`
        SELECT file
        FROM SONGS 
        WHERE id = ${id}`);

    if (results.length === 0) {
        throw new Error(`Song with ID ${id} not found.`);
    }
    return results[0]; // this should only return the file because it comes in an array lmao
}

export async function insertSong(title: string, file: string) {
    const db = await getDB();
    await db.runAsync(
        `INSERT OR REPLACE INTO SONGS (
            title, file
        ) VALUES (?, ?)`,
        [
            title,
            file
        ]
    );
}

// ** The following function is very destructive and should be used with caution*/
export async function clearDatabase() {
    const db = await getDB();
    await db.execAsync(`
        DROP TABLE IF EXISTS PLAYLIST_SONGS;
        DROP TABLE IF EXISTS PLAYLISTS;
        DROP TABLE IF EXISTS SONGS;
    `);
}

export async function clearPlaylistSongs() {
    const db = await getDB();
    await db.execAsync(`
        DROP TABLE IF EXISTS PLAYLIST_SONGS;
    `);
}

export async function clearPlaylists() {
    const db = await getDB();
    await db.execAsync(`
        DROP TABLE IF EXISTS PLAYLISTS;
    `);
}

export async function clearSongs() {
    const db = await getDB();
    await db.execAsync(`
        DROP TABLE IF EXISTS SONGS;
    `);
}