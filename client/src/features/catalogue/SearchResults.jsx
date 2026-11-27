import { useEffect, useState } from 'react';
import GameCover from '../../components/GameCover.jsx';
import './SearchResults.css';

function readUrl() {
    const params = new URLSearchParams(window.location.search);
    return {
        title: params.get('title') ?? '',
        sort: params.get('sort') === 'title' ? 'title' : 'price',
        page: Math.max(1, Number.parseInt(params.get('page'), 10) || 1),
    };
}

export default function SearchResults() {
    const [query, setQuery] = useState(readUrl);
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    // Back and forward buttons change the address bar, so read it again.
    useEffect(() => {
        const onPop = () => setQuery(readUrl());
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    useEffect(() => {
        if (!query.title) return;
        setData(null);
        setFailed(false);
        const params = new URLSearchParams({ title: query.title, sort: query.sort, page: String(query.page) });
        fetch(`/api/catalogue/results?${params}`)
            .then((response) => {
                if (!response.ok) throw new Error(`Results answered ${response.status}`);
                return response.json();
            })
            .then(setData)
            .catch(() => setFailed(true));
    }, [query]);

    const goTo = (changes) => {
        const next = { ...query, ...changes };
        const params = new URLSearchParams({ title: next.title, sort: next.sort, page: String(next.page) });
        window.history.pushState(null, '', `/search?${params}`);
        setQuery(next);
    };

    return (
        <main className="page results">
            <h1 className="results-heading">{query.title ? `Results for “${query.title}”` : 'Search'}</h1>

            {!query.title && <p className="results-message">Type a game name in the search box to find it.</p>}

            {query.title && (
                <div className="results-toolbar">
                    <span className="results-count">{data ? `${data.total} games` : ' '}</span>
                    <label className="results-sort">
                        Sort by
                        <select value={query.sort} onChange={(event) => goTo({ sort: event.target.value, page: 1 })}>
                            <option value="price">Lowest price</option>
                            <option value="title">Title A–Z</option>
                        </select>
                    </label>
                </div>
            )}

            {failed && <p className="results-message">These results can't be loaded right now. Try again in a minute.</p>}

            {query.title && !failed && !data && <p className="results-message">Loading…</p>}

            {data && data.results.length === 0 && <p className="results-message">No games found.</p>}

            {data && data.results.length > 0 && (
                <div className="results-grid">
                    {data.results.map((game) => (
                        <GameCover key={game.id} game={game} />
                    ))}
                </div>
            )}

            {data && data.totalPages > 1 && (
                <nav className="results-pages" aria-label="Pages">
                    <button type="button" disabled={data.page <= 1} onClick={() => goTo({ page: data.page - 1 })}>
                        Previous
                    </button>
                    <span>
                        Page {data.page} of {data.totalPages}
                    </span>
                    <button type="button" disabled={data.page >= data.totalPages} onClick={() => goTo({ page: data.page + 1 })}>
                        Next
                    </button>
                </nav>
            )}
        </main>
    );
}
