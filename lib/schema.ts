import { getDB } from "./db";
import { Playlist, PlaylistSongs, Song} from './types';

export async function createPlaylistTable() {
    const db = await getDB();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS PLAYLISTS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            image TEXT
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
            s.file
        FROM PLAYLIST_SONGS p
        INNER JOIN SONGS s
            ON s.id = p.song_id
        WHERE p.playlist_id = ?
        ORDER BY p.position ASC
        `, [playlistId]);

    return results;
}

export async function getPlaylistSongsFromSid(songId: number): Promise<PlaylistSongs[]> {
    const db = await getDB();
    const results = await db.getAllAsync<PlaylistSongs>(`
        SELECT
            p.id
        FROM PLAYLIST_SONGS p
        WHERE p.song_id = ?
        `, [songId]);
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

export async function getPlaylistSongsTable(): Promise<PlaylistSongs[]> {
    const db = await getDB();

    const results = await db.getAllAsync<PlaylistSongs>(`SELECT * FROM PLAYLIST_SONGS`);
    
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

/**
 * 
 * @param id 
 * @param column By default it will delete based on ID column, 
 *  else you can specify to delte by playlist_id or song_id
 */
export async function deletePlaylistSongs(
  id: number,
  column: 'id' | 'playlist_id' | 'song_id' = 'id'
) {
  const db = await getDB();
  await db.runAsync(
    `DELETE FROM PLAYLIST_SONGS WHERE ${column} = ?`,
    [id]
  );
}


export async function createSongTable() {
    const db = await getDB();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS SONGS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            file TEXT,
            image TEXT
        );
    `);
}

export async function getSongTable(): Promise<Song[]> {
    const db = await getDB();
    const results = await db.getAllAsync<Song>(`SELECT * FROM SONGS`);
    return results;
}

export async function deleteSong(id: number) {
    const db = await getDB();
    await db.runAsync(`DELETE FROM SONGS WHERE id = ${id}`);
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

export async function getSongImage(id: number): Promise<Song> {
    const db = await getDB();
    const results = await db.getAllAsync<Song>(`
        SELECT image
        FROM SONGS 
        WHERE id = ${id}`);
    return results[0];
}


export async function insertSong(title: string, file: string): Promise<number> {
    const db = await getDB();
    const result = await db.runAsync(
        `INSERT OR REPLACE INTO SONGS (
            title, file
        ) VALUES (?, ?)`,
        [
            title,
            file
        ]
    );
    return result.lastInsertRowId as number; // return the ID of the inserted song
}

export async function updateSong(id: number, column: 'title' | 'file' | 'image', toUpdate: string) {
    const db = await getDB();
    await db.runAsync(
        `UPDATE SONGS
        SET ${column} = ?
        WHERE id = ?`,
        [
            toUpdate,
            id
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