// F1 – Game catalogue and price comparison · Ferraglio Danut Octavian
// Gets game details from the Steam store and keeps each game for one day in our database.
import db from '../price-history/db.js';

const ONE_DAY = 24 * 60 * 60 * 1000;
const HEADERS = { 'User-Agent': 'PriceCrit/1.0 (university project)', Accept: 'application/json' };

db.exec(`
    CREATE TABLE IF NOT EXISTS steam_details (
        steam_app_id INTEGER PRIMARY KEY,
        body TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
    );
`);

const readDetails = db.prepare('SELECT body, fetched_at FROM steam_details WHERE steam_app_id = ?');
const writeDetails = db.prepare(`
    INSERT INTO steam_details (steam_app_id, body, fetched_at) VALUES (?, ?, ?)
    ON CONFLICT (steam_app_id) DO UPDATE SET body = excluded.body, fetched_at = excluded.fetched_at
`);

function toDetails(appId, data) {
    return {
        steamAppId: appId,
        title: data.name,
        description: data.short_description ?? '',
        headerImage: data.header_image,
        genres: (data.genres ?? []).map((genre) => genre.description),
        releaseDate: data.release_date?.date ?? null,
        metacriticScore: data.metacritic?.score ?? null,
        screenshots: (data.screenshots ?? []).slice(0, 6).map((shot) => shot.path_thumbnail),
    };
}

// Returns the game's details, or null if Steam has no store page for that app.
export async function getSteamDetails(appId) {
    const cached = readDetails.get(appId);
    if (cached && Date.now() - cached.fetched_at < ONE_DAY) {
        return JSON.parse(cached.body);
    }

    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`, { headers: HEADERS });
        if (!response.ok) throw new Error(`Steam answered ${response.status}`);
        const answer = await response.json();
        const entry = answer[String(appId)];
        if (!entry?.success) return null;

        const details = toDetails(appId, entry.data);
        writeDetails.run(appId, JSON.stringify(details), Date.now());
        return details;
    } catch (error) {
        if (cached) return JSON.parse(cached.body);
        throw error;
    }
}
