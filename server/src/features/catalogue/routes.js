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

const RESULTS_PER_PAGE = 12;

// GET /api/catalogue/results?title=portal&sort=title&page=2 → one page of results, cards shaped like the deals
router.get('/results', async (req, res) => {
    const title = String(req.query.title ?? '').trim();
    const sortByTitle = req.query.sort === 'title';
    const requestedPage = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    if (!title) return res.json({ results: [], page: 1, totalPages: 0, total: 0 });

    const [games, rate] = await Promise.all([cheapSharkGet('games', { title, limit: '60' }), getUsdToRon().catch(() => null)]);
    const sorted = [...games].sort((a, b) =>
        sortByTitle ? (a.external ?? '').localeCompare(b.external ?? '') : Number(a.cheapest) - Number(b.cheapest),
    );
    const totalPages = Math.ceil(sorted.length / RESULTS_PER_PAGE);
    const page = Math.min(requestedPage, Math.max(totalPages, 1));
    const pageItems = sorted.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);
    const toRon = (usd) => (rate === null ? null : Math.round(Number(usd) * rate * 100) / 100);

    res.json({
        results: pageItems.map((game) => ({
            id: game.gameID,
            title: game.external,
            price: toRon(game.cheapest),
            regularPrice: toRon(game.cheapest),
            discount: 0,
            image: game.steamAppID ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppID}/header.jpg` : game.thumb,
            fallbackImage: game.thumb,
            // cheapestDealID is already URL-encoded by CheapShark.
            url: `https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}`,
        })),
        page,
        totalPages,
        total: sorted.length,
    });
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