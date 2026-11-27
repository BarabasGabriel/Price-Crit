import { useEffect, useState } from 'react';
import './SearchBox.css';

const ron = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' });

export default function SearchBox() {
    const [text, setText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const title = text.trim();
        if (title.length < 2) {
            setSuggestions([]);
            setFailed(false);
            return undefined;
        }

        // Wait a moment after the last key press before asking the server.
        const timer = setTimeout(() => {
            fetch(`/api/catalogue/search?title=${encodeURIComponent(title)}`)
                .then((response) => {
                    if (!response.ok) throw new Error(`Search answered ${response.status}`);
                    return response.json();
                })
                .then((games) => {
                    setSuggestions(games);
                    setFailed(false);
                })
                .catch(() => setFailed(true));
        }, 250);

        return () => clearTimeout(timer);
    }, [text]);

    const showList = open && text.trim().length >= 2;

    return (
        <form className="search" role="search" action="/search" onSubmit={(event) => event.preventDefault()}>
            <input
                type="search"
                name="title"
                className="search-input"
                placeholder="Search games"
                aria-label="Search games by title"
                value={text}
                autoComplete="off"
                onChange={(event) => setText(event.target.value)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
            />
            {showList && (
                <ul className="search-suggestions" onMouseDown={(event) => event.preventDefault()}>
                    {failed && <li className="search-message">Search isn't available right now. Try again in a minute.</li>}
                    {!failed && suggestions.length === 0 && <li className="search-message">No games found.</li>}
                    {suggestions.map((game) => (
                        <li key={game.id}>
                            <a href={`/search?title=${encodeURIComponent(game.title)}`} className="search-suggestion">
                                <span className="search-title">{game.title}</span>
                                {game.cheapestRon !== null && <span className="search-price">from {ron.format(game.cheapestRon)}</span>}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
}
