// F1 – Game catalogue and price comparison · Ferraglio Danut Octavian
// Every route here starts with /api/catalogue.
import { Router } from 'express';

const router = Router();

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