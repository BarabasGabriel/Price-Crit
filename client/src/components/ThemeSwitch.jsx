import { useState } from 'react';
import './ThemeSwitch.css';

function currentTheme() {
    const chosen = document.documentElement.dataset.theme;
    if (chosen) return chosen;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeSwitch() {
    const [theme, setTheme] = useState(currentTheme);
    const isDark = theme === 'dark';

    const toggle = () => {
        const next = isDark ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem('theme', next);
        } catch {
            // Private browsing: the choice just isn't remembered.
        }
        setTheme(next);
    };

    return (
        <button
            type="button"
            className={`theme-switch${isDark ? ' is-dark' : ''}`}
            onClick={toggle}
            role="switch"
            aria-checked={isDark}
            aria-label="Dark theme"
        >
            <span className="knob">
                {isDark ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="4.5" />
                        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </svg>
                )}
            </span>
        </button>
    );
}