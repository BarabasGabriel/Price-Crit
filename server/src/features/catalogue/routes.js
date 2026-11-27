// F1 – Game catalogue and price comparison · Ferraglio Danut Octavian
// Every route here starts with /api/catalogue.
import { Router } from 'express';
import { cheapSharkGet } from './cheapshark.js';
import { getUsdToRon } from './exchangeRate.js';

const router = Router();

const DEAL_FILTERS = ['sortBy', 'desc', 'AAA', 'onSale', 'upperPrice', 'lowerPrice', 'storeID', 'pageNumber', 'pageSize'];

// GET /api/catalogue/deals?sortBy=Savings&onSale=1 → the deals for the home page shelves
router.get('/deals', async (req, res) => {
    const params = Object.fromEntries(DEAL_FILTERS.filter((key) => req.query[key] !== undefined).map((key) => [key, String(req.query[key])]));
    const [deals, rate] = await Promise.all([cheapSharkGet('deals', params), getUsdToRon().catch(() => null)]);
    const toRon = (usd) => (rate === null ? null : Math.round(Number(usd) * rate * 100) / 100);
    res.json(deals.map((deal) => ({ ...deal, salePriceRon: toRon(deal.salePrice), normalPriceRon: toRon(deal.normalPrice) })));
});

// GET /api/catalogue/search?title=portal → games whose title matches, with their cheapest price
router.get('/search', async (req, res) => {
    const title = String(req.query.title ?? '').trim();
    if (!title) return res.json([]);
    const [games, rate] = await Promise.all([cheapSharkGet('games', { title, limit: '8' }), getUsdToRon().catch(() => null)]);
    res.json(
        games.slice(0, 8).map((game) => ({
            id: game.gameID,
            title: game.external,
            cheapestRon: rate === null ? null : Math.round(Number(game.cheapest) * rate * 100) / 100,
            steamAppId: game.steamAppID,
        })),
    );
});

// Example: the stores CheapShark tracks → GET /api/catalogue/stores
router.get('/stores', async (req, res) => {
    const response = await fetch('https://www.cheapshark.com/api/1.0/stores', {
        headers: { 'User-Agent': 'PriceCrit/1.0 (university project)', Accept: 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`CheapShark answered ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
    const stores = await response.json();
    res.json(stores.filter((store) => store.isActive === 1).map((store) => ({ id: Number(store.storeID), name: store.storeName })));
});

export default router;