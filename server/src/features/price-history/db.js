// F2 – Price history and analytics · Avram Maria Eliana
// Opens the SQLite database and creates the tables for tracked games and daily prices.
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.DB_FILE ?? join(here, '../../../data/price-crit.db');
mkdirSync(dirname(dbFile), { recursive: true });

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
        id INTEGER PRIMARY KEY,
        cheapshark_store_id INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY,
        cheapshark_game_id INTEGER UNIQUE,
        steam_app_id INTEGER UNIQUE,
        title TEXT NOT NULL,
        tracked INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY,
        game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
        store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        price_ron REAL NOT NULL,
        discount_percent INTEGER NOT NULL DEFAULT 0,
        recorded_on TEXT NOT NULL,
        UNIQUE (game_id, store_id, recorded_on)
    );

    CREATE INDEX IF NOT EXISTS idx_prices_game_day ON prices (game_id, recorded_on);
`);

export default db;
