import { useState } from 'react';
import Header from './components/Header.jsx';
import Shelf from './components/Shelf.jsx';
import Wishlists from './features/accounts/Wishlists.jsx';

const SHELVES = [
    { title: 'Biggest discounts', query: { sortBy: 'Savings', AAA: '1' } },
    { title: 'Newest deals', query: { sortBy: 'Recent' } },
    { title: 'Top rated on sale', query: { sortBy: 'Reviews', onSale: '1' } },
    { title: 'Free to keep', query: { upperPrice: '0' } },
];

export default function App() {
    const [currentView, setCurrentView] = useState('deals');

    return (
        <>
            <Header currentView={currentView} onViewChange={setCurrentView} />
            <main className="page">
                {currentView === 'deals' ? (
                    SHELVES.map((shelf) => (
                        <Shelf key={shelf.title} title={shelf.title} query={shelf.query} />
                    ))
                ) : (
                    <Wishlists />
                )}
            </main>
        </>
    );
}