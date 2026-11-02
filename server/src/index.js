import express from 'express';
import catalogue from './features/catalogue/routes.js';
import priceHistory from './features/price-history/routes.js';
import accounts from './features/accounts/routes.js';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// Each feature has its own router, so the three developers rarely edit the same file.
app.use('/api/catalogue', catalogue); // F1 – Ferraglio Danut Octavian
app.use('/api/price-history', priceHistory); // F2 – Avriam Maria Eliana
app.use('/api/accounts', accounts); // F3 – Bujor David Marian

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Try again in a minute.' });
});

const port = process.env.PORT ?? 3001;
app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});