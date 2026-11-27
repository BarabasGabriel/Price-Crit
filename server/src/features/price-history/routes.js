// F2 – Price history and analytics · Avram Maria Eliana
// Every route here starts with /api/price-history.
import { Router } from 'express';
import db from './db.js';
import { startSnapshotTimer } from './snapshot.js';

const router = Router();

const markTracked = db.prepare(`
    INSERT INTO games (cheapshark_game_id, title, tracked) VALUES (?, ?, 1)
    ON CONFLICT (cheapshark_game_id) DO UPDATE SET tracked = 1, title = excluded.title
`);

// POST /api/price-history/track { "cheapsharkGameId": 82, "title": "Portal" } → save this game's price every day
router.post('/track', (req, res) => {
    const cheapsharkGameId = Number(req.body?.cheapsharkGameId);
    const title = String(req.body?.title ?? '').trim();
    if (!Number.isInteger(cheapsharkGameId) || cheapsharkGameId <= 0 || !title) {
        return res.status(400).json({ error: 'Send a CheapShark game id and a title.' });
    }
    markTracked.run(cheapsharkGameId, title);
    res.status(201).json({ cheapsharkGameId, title, tracked: true });
});

// The daily price snapshot runs while the API is running.
startSnapshotTimer();

export default router;
