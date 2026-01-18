import { getDB } from "./db";

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

export async function insertPlaylist(name: string, description: string | null) {
    const db = await getDB();

    await db.runAsync(
        `INSERT OR REPLACE INTO PLAYLISTS (
            name, description
        ) VALUES (?, ?)`,
        [
            name, 
            description
        ]
    );
}

export async function getPlaylists() {
    const db = await getDB();

    const results = await db.getAllAsync(`SELECT * FROM PLAYLISTS`);

    return results;
}