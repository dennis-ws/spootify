import { getDB } from "./db";
import { Playlist, Track, Song} from './types';

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

export async function updatePlaylist(id: number, column: 'name' | 'description' | 'image', toUpdate: string) {
    const db = await getDB();
    await db.runAsync(
        `UPDATE PLAYLISTS
        SET ${column} = ?
        WHERE id = ?`,
        [
            toUpdate,
            id
        ]
    );
}

export async function deletePlaylist(id: number) {
    const db = await getDB();

    await db.runAsync(
        `DELETE FROM PLAYLISTS WHERE id = ${id}`
    )
}

export async function getPlaylists(): Promise<Playlist[]> {
    const db = await getDB();

    const results = await db.getAllAsync<Playlist>(`SELECT * FROM PLAYLISTS`);

    return results;
}

export async function getPlaylist(id: number): Promise<Playlist> {
    const db = await getDB();
    const result = await db.getAllAsync<Playlist>(
        `SELECT * FROM PLAYLISTS
        WHERE id = ?`,
        [
            id
        ]
    );

    return result[0];
}

export async function createTrackTable() {
    const db = await getDB();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS TRACKS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            playlist_id INTEGER,
            song_id INTEGER,
            position INTEGER,
            image TEXT,
            file TEXT,

            UNIQUE (playlist_id, song_id),

            FOREIGN KEY (playlist_id) REFERENCES PLAYLISTS(id)
            FOREIGN KEY (song_id) REFERENCES SONGS(id)
        );
    `);
}

export async function updateTrackPosition(playlistId: number, songId: number, position: number) {
    const db = await getDB();

    await db.runAsync(`
        UPDATE TRACKS 
        SET position = ?
        WHERE playlist_id = ? AND song_id = ?`,
        [
            position,
            playlistId,
            songId
        ]
    );
}

export async function getSongsFromPid(playlistId: number): Promise<Track[]> {
    const db = await getDB();

    const results = await db.getAllAsync<Track>(`
        SELECT
            s.id,
            s.title,
            s.file,
            s.image
        FROM TRACKS p
        INNER JOIN SONGS s
            ON s.id = p.song_id
        WHERE p.playlist_id = ?
        ORDER BY p.position ASC
        `, [playlistId]);

    return results;
}

export async function getTrackFromSid(songId: number): Promise<Track[]> {
    const db = await getDB();
    const results = await db.getAllAsync<Track>(`
        SELECT
            p.id
        FROM TRACKS p
        WHERE p.song_id = ?
        `, [songId]);
    return results;
}

export async function insertTrackTable(playlistId: number, songId: number, position: number) {
    const db = await getDB();

    await db.runAsync(`
        INSERT OR IGNORE INTO TRACKS (
            playlist_id, song_id, position
        ) VALUES (?, ?, ?)`,
        [
            playlistId, 
            songId,
            position,
        ]    
    );
}

export async function getTrackTable(): Promise<Track[]> {
    const db = await getDB();

    const results = await db.getAllAsync<Track>(`SELECT * FROM TRACKS`);
    
    return results;
}

export async function getTrack(playlistId: number, column: string = 'playlist_id', append: string = ''): Promise<Track[]> {
    const db = await getDB();
    const results = await db.getAllAsync<Track>(`
        SELECT * 
        FROM TRACKS
        WHERE ${column} = ?
        ${append}
    `, [playlistId]);

    return results;
}

export async function getTrackAsSong(playlistId: number, column: string = 'playlist_id', append: string = ''): Promise<Song[]> {
    const db = await getDB();
    const results = await db.getAllAsync<Song>(`
        SELECT
            s.id,
            s.title,
            s.file,
            s.image
        FROM TRACKS p
        INNER JOIN SONGS s
            ON s.id = p.song_id
        WHERE p.playlist_id = ?
        ORDER BY p.position ASC
    `, [playlistId])

    return results;
}

/**
 * 
 * @param id 
 * @param column By default it will delete based on ID column, 
 *  else you can specify to delete by playlist_id or song_id
 */
export async function deleteTrack(songId: number, playlistId: number) {
  const db = await getDB();
  await db.runAsync(
    `DELETE FROM TRACKS WHERE song_id = ? AND playlist_id = ?`,
    [songId, playlistId]
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
        SELECT 
            file,
            image,
            title
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
        DROP TABLE IF EXISTS TRACKS;
        DROP TABLE IF EXISTS PLAYLISTS;
        DROP TABLE IF EXISTS SONGS;
    `);
}

export async function clearTrack() {
    const db = await getDB();
    await db.execAsync(`
        DROP TABLE IF EXISTS TRACKS;
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