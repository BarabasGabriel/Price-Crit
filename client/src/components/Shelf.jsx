import { useEffect, useState } from 'react';
import { getDeals } from '../api/cheapshark.js';
import GameCover from './GameCover.jsx';
import './Shelf.css';

export default function Shelf({ title, query }) {
    const [games, setGames] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        getDeals(query)
            .then(setGames)
            .catch(() => setFailed(true));
        // Each shelf loads once, when the page opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (games && games.length === 0) return null;

    return (
        <section className="shelf">
            <h2>{title}</h2>
            {failed && <p className="shelf-error">These deals can't be loaded right now. Try again in a minute.</p>}
            <div className="shelf-row">
                {games
                    ? games.map((game) => <GameCover key={game.id} game={game} />)
                    : !failed && Array.from({ length: 6 }, (_, i) => <div key={i} className="shelf-placeholder" />)}
            </div>
        </section>
    );
}