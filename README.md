# Price Crit

Compare PC game prices across stores, follow each game's price history and get alerts when the games you want drop in price.

## Team

| Member | Role | Folders |
| --- | --- | --- |
| Barabas Gabriel Lucian | Project manager | Jira, documentation, repository |
| Ferraglio Danut Octavian | F1 – Game catalogue and price comparison | `client/src/features/catalogue`, `server/src/features/catalogue` |
| Avriam Maria Eliana | F2 – Price history and analytics | `client/src/features/price-history`, `server/src/features/price-history` |
| Bujor David Marian | F3 – Accounts, wishlists and alerts | `client/src/features/accounts`, `server/src/features/accounts` |

Work inside your feature's folders. Shared files (`App.jsx`, `index.css`, `components/`, `server/src/index.js`) change only when needed, and the pull request says why.

## Getting started

You need [Node.js](https://nodejs.org) 24 LTS and Git.

```
git clone https://github.com/BarabasGabriel/Price-Crit.git
cd Price-Crit
npm run setup
npm run dev
```

- Site: http://localhost:5173
- Server check: http://localhost:5173/api/health

`npm run dev` starts both the site and the server. Keep the terminal open while you work.

## Project structure

```
client/                 the website (React + Vite)
  src/index.css         colours and fonts for light and dark – use these variables, never new colours
  src/components/       shared pieces: header, theme switch, shelves, game covers
  src/features/         one folder per feature
server/                 the API (Node.js + Express)
  src/index.js          starts the server, connects each feature's routes
  src/features/         one folder per feature, each with its own routes.js
```

Each feature's server routes live under their own address: `/api/catalogue`, `/api/price-history`, `/api/accounts`.

## Data sources

- [CheapShark API](https://apidocs.cheapshark.com) – deals and prices. Always send a `User-Agent` header, or CheapShark answers 400. See `server/src/features/catalogue/routes.js`.

## How we work

1. Pick a task in Jira and move it to **In Progress**.
2. Create a branch named after the task key: `git checkout -b PC-12-search-filters`
3. Commit small steps, starting with the key: `git commit -m "PC-12 Add the genre filter"`
4. Push and open a pull request into `main`.
5. Another team member reviews and approves it, then it's merged and the task moves to **Done**.

Nobody pushes directly to `main`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run setup` | installs everything (run once, and again after pulling new packages) |
| `npm run dev` | starts the site and the server |