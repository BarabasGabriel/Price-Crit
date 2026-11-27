// F3 – Accounts, wishlists and alerts · Bujor David Marian
// Every route here starts with /api/accounts.
import { Router } from 'express';
import {
    getAllWishlists,
    getWishlistById,
    createWishlist,
    renameWishlist,
    deleteWishlist,
    addGameToWishlist,
    updateGameInWishlist,
    removeGameFromWishlist,
    moveGameBetweenWishlists,
} from './db.js';

const router = Router();

// GET all wishlists
router.get('/wishlists', (req, res) => {
    const wishlists = getAllWishlists();
    res.json(wishlists);
});

// POST create a new wishlist
router.post('/wishlists', (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Wishlist name is required' });
    }
    const created = createWishlist(name);
    res.status(201).json(created);
});

// GET single wishlist
router.get('/wishlists/:id', (req, res) => {
    const wishlist = getWishlistById(req.params.id);
    if (!wishlist) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }
    res.json(wishlist);
});

// PATCH rename wishlist
router.patch('/wishlists/:id', (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Wishlist name is required' });
    }
    const updated = renameWishlist(req.params.id, name);
    if (!updated) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }
    res.json(updated);
});

// DELETE wishlist
router.delete('/wishlists/:id', (req, res) => {
    const success = deleteWishlist(req.params.id);
    if (!success) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }
    res.json({ ok: true });
});

// POST add game to wishlist
router.post('/wishlists/:id/games', (req, res) => {
    const { title, image, currentPrice, regularPrice, targetPrice, note, url, gameId } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Game title is required' });
    }
    const item = addGameToWishlist(req.params.id, {
        title,
        image,
        currentPrice,
        regularPrice,
        targetPrice,
        note,
        url,
        gameId,
    });
    if (!item) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }
    res.status(201).json(item);
});

// PATCH update game in wishlist (targetPrice, note)
router.patch('/wishlists/:id/games/:itemId', (req, res) => {
    const { targetPrice, note, currentPrice } = req.body;
    const item = updateGameInWishlist(req.params.id, req.params.itemId, {
        targetPrice,
        note,
        currentPrice,
    });
    if (!item) {
        return res.status(404).json({ error: 'Wishlist or game item not found' });
    }
    res.json(item);
});

// DELETE remove game from wishlist
router.delete('/wishlists/:id/games/:itemId', (req, res) => {
    const success = removeGameFromWishlist(req.params.id, req.params.itemId);
    if (!success) {
        return res.status(404).json({ error: 'Wishlist or game item not found' });
    }
    res.json({ ok: true });
});

// POST move game to another wishlist
router.post('/wishlists/:id/games/:itemId/move', (req, res) => {
    const { targetWishlistId } = req.body;
    if (!targetWishlistId) {
        return res.status(400).json({ error: 'targetWishlistId is required' });
    }
    const item = moveGameBetweenWishlists(req.params.id, targetWishlistId, req.params.itemId);
    if (!item) {
        return res.status(404).json({ error: 'Failed to move game: check source/target list or item' });
    }
    res.json(item);
});

export default router;
