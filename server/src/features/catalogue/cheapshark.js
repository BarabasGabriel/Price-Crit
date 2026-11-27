// F1 – Game catalogue and price comparison · Ferraglio Danut Octavian
// Fetches from CheapShark and keeps each answer in our database for one hour.
import db from '../price-history/db.js';

const ONE_HOUR = 60 * 60 * 1000;
const HEADERS = { 'User-Agent': 'PriceCrit/1.0 (university project)', Accept: 'application/json' };

db.exec(`
    CREATE TABLE IF NOT EXISTS cheapshark_cache (
        cache_key TEXT PRIMARY KEY,
        body TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
    );
`);

const readCache = db.prepare('SELECT body, fetched_at FROM cheapshark_cache WHERE cache_key = ?');
const writeCache = db.prepare(`
    INSERT INTO cheapshark_cache (cache_key, body, fetched_at) VALUES (?, ?, ?)
    ON CONFLICT (cache_key) DO UPDATE SET body = excluded.body, fetched_at = excluded.fetched_at
`);

// Returns the parsed CheapShark answer. If CheapShark is down, an old copy is better than nothing.
export async function cheapSharkGet(path, params) {
    const query = new URLSearchParams(params).toString();
    const key = `${path}?${query}`;
    const cached = readCache.get(key);

    if (cached && Date.now() - cached.fetched_at < ONE_HOUR) {
        return JSON.parse(cached.body);
    }

    try {
        const response = await fetch(`https://www.cheapshark.com/api/1.0/${key}`, { headers: HEADERS });
        if (!response.ok) throw new Error(`CheapShark answered ${response.status}`);
        const body = await response.text();
        writeCache.run(key, body, Date.now());
        return JSON.parse(body);
    } catch (error) {
        if (cached) return JSON.parse(cached.body);
        throw error;
    }
}
