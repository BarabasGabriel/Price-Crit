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
import {
    createUser,
    verifyUserEmail,
    authenticateUser,
    regenerateVerificationToken,
    getUserById,
} from './userDb.js';

const router = Router();

// ==================== USER ACCOUNTS & EMAIL VERIFICATION (5.1) ====================

// POST /api/accounts/register - Create an account & generate verification link
router.post('/register', (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
        const user = createUser({ email, username, password });

        // Construct fictional/local verification link
        const host = req.get('host') || 'localhost:5173';
        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const verificationLink = `${protocol}://${host}/#verify=${user.verificationToken}`;

        res.status(201).json({
            message: 'Account created successfully. Please verify your email.',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
            },
            verificationToken: user.verificationToken,
            verificationLink,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/accounts/verify/:token - Verify email address with token
router.get('/verify/:token', (req, res) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    try {
        const result = verifyUserEmail(token);
        res.json({
            message: 'Email address verified successfully!',
            user: result,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/accounts/resend-verification - Resend verification email link
router.post('/resend-verification', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const result = regenerateVerificationToken(email);
        const host = req.get('host') || 'localhost:5173';
        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const verificationLink = `${protocol}://${host}/#verify=${result.verificationToken}`;

        res.json({
            message: 'Verification link resent.',
            verificationToken: result.verificationToken,
            verificationLink,
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/accounts/login - Login user with email & password
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = authenticateUser(email, password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
        message: 'Login successful.',
        user,
    });
});

// GET /api/accounts/profile/:id - Get user profile
router.get('/profile/:id', (req, res) => {
    const user = getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
});

// ==================== MULTIPLE WISHLISTS & GAME MANAGEMENT (5.3) ====================

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
