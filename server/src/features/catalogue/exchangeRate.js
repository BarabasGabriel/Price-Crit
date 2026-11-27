// F1 – Game catalogue and price comparison · Ferraglio Danut Octavian
// Gets the daily USD → RON rate from the National Bank of Romania and keeps it in our database.
import db from '../price-history/db.js';

// The BNR site loads its rates from this endpoint; the old XML file no longer exists.
const BNR_URL = 'https://www.bnr.ro/seriizilnice';

db.exec(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
        currency TEXT PRIMARY KEY,
        rate REAL NOT NULL,
        fetched_on TEXT NOT NULL
    );
`);

const readRate = db.prepare("SELECT rate, fetched_on FROM exchange_rates WHERE currency = 'USD'");
const writeRate = db.prepare(`
    INSERT INTO exchange_rates (currency, rate, fetched_on) VALUES ('USD', ?, ?)
    ON CONFLICT (currency) DO UPDATE SET rate = excluded.rate, fetched_on = excluded.fetched_on
`);

function today() {
    return new Date().toISOString().slice(0, 10);
}

// The NBR publishes one rate per working day, so one fetch per day is enough.
export async function getUsdToRon() {
    const stored = readRate.get();
    if (stored && stored.fetched_on === today()) return stored.rate;

    try {
        const response = await fetch(BNR_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
            body: new URLSearchParams({ limit: '5', valute: 'USD' }),
        });
        if (!response.ok) throw new Error(`BNR answered ${response.status}`);
        const answer = await response.json();
        const latestDay = Object.keys(answer.data ?? {}).sort().at(-1);
        const rate = Number(answer.data?.[latestDay]?.USD?.valuta);
        if (!latestDay || !rate) throw new Error('USD rate not found in the BNR answer');
        writeRate.run(rate, today());
        return rate;
    } catch (error) {
        if (stored) return stored.rate;
        throw error;
    }
}
