// F3 – Accounts, wishlists and alerts · Bujor David Marian
// Every route here starts with /api/accounts.
import { Router } from 'express';
import {
    createUser,
    verifyUserEmail,
    authenticateUser,
    regenerateVerificationToken,
    getUserById,
} from './userDb.js';

const router = Router();

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
            verificationLink, // Provided so user / frontend can test & click the fictional email link
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

export default router;
