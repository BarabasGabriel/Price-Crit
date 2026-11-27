// F2 – Price history and analytics · Avram Maria Eliana
// Saves today's price of every tracked game at every store. A timer checks once an hour
// and takes the snapshot if today's prices are not saved yet.
import db from './db.js';
import { getUsdToRon } from '../catalogue/exchangeRate.js';

const ONE_HOUR = 60 * 60 * 1000;
const HEADERS = { 'User-Agent': 'PriceCrit/1.0 (university project)', Accept: 'application/json' };

const upsertStore = db.prepare(`
    INSERT INTO stores (cheapshark_store_id, name) VALUES (?, ?)
    ON CONFLICT (cheapshark_store_id) DO UPDATE SET name = excluded.name
`);
const findStore = db.prepare('SELECT id FROM stores WHERE cheapshark_store_id = ?');
const trackedGames = db.prepare('SELECT id, cheapshark_game_id FROM games WHERE tracked = 1 AND cheapshark_game_id IS NOT NULL');
const upsertPrice = db.prepare(`
    INSERT INTO prices (game_id, store_id, price_ron, discount_percent, recorded_on) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (game_id, store_id, recorded_on) DO UPDATE SET price_ron = excluded.price_ron, discount_percent = excluded.discount_percent
`);
const pricesSavedOn = db.prepare('SELECT 1 FROM prices WHERE recorded_on = ? LIMIT 1');

function today() {
    return new Date().toISOString().slice(0, 10);
}

async function cheapSharkJson(path) {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/${path}`, { headers: HEADERS });
    if (!response.ok) throw new Error(`CheapShark answered ${response.status} for ${path}`);
    return response.json();
}

async function refreshStores() {
    const stores = await cheapSharkJson('stores');
    for (const store of stores.filter((item) => item.isActive === 1)) {
        upsertStore.run(Number(store.storeID), store.storeName);
    }
}

// Returns how many store prices were saved.
export async function takeSnapshot() {
    const games = trackedGames.all();
    if (games.length === 0) return 0;

    await refreshStores();
    const rate = await getUsdToRon();
    const day = today();
    let saved = 0;

    for (const game of games) {
        const info = await cheapSharkJson(`games?id=${game.cheapshark_game_id}`);
        for (const deal of info.deals ?? []) {
            const store = findStore.get(Number(deal.storeID));
            if (!store) continue;
            const priceRon = Math.round(Number(deal.price) * rate * 100) / 100;
            upsertPrice.run(game.id, store.id, priceRon, Math.round(Number(deal.savings)), day);
            saved += 1;
        }
        // A short pause between games keeps us well within CheapShark's limits.
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return saved;
}

export function startSnapshotTimer() {
    const check = () => {
        if (pricesSavedOn.get(today())) return;
        takeSnapshot().catch((error) => console.error('Price snapshot failed:', error.message));
    };
    check();
    setInterval(check, ONE_HOUR).unref();
}
