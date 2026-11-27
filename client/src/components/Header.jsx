import ThemeSwitch from './ThemeSwitch.jsx';
import './Header.css';

export default function Header({ currentView, onViewChange }) {
    return (
        <header className="header">
            <a
                href="#deals"
                className="brand"
                onClick={(e) => {
                    e.preventDefault();
                    onViewChange?.('deals');
                }}
            >
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <rect width="32" height="32" rx="8" fill="var(--accent)" />
                    <path d="M16 5C17 12 20 15 27 16C20 17 17 20 16 27C15 20 12 17 5 16C12 15 15 12 16 5Z" fill="var(--on-accent)" />
                    <circle cx="24.5" cy="8" r="2" fill="var(--deal-bg)" />
                </svg>
                Price Crit
            </a>
            <div className="header-nav">
                <nav className="nav-links">
                    <button
                        type="button"
                        className={`nav-button ${currentView === 'deals' ? 'active' : ''}`}
                        onClick={() => onViewChange?.('deals')}
                    >
                        Deals
                    </button>
                    <button
                        type="button"
                        className={`nav-button ${currentView === 'wishlists' ? 'active' : ''}`}
                        onClick={() => onViewChange?.('wishlists')}
                    >
                        Wishlists
                    </button>
                </nav>
                <ThemeSwitch />
            </div>
        </header>
    );
}
