import { useState } from 'react';
import Header from './components/Header.jsx';
import Shelf from './components/Shelf.jsx';
import AccountAuth from './features/accounts/AccountAuth.jsx';

const SHELVES = [
    { title: 'Biggest discounts', query: { sortBy: 'Savings', AAA: '1' } },
    { title: 'Newest deals', query: { sortBy: 'Recent' } },
    { title: 'Top rated on sale', query: { sortBy: 'Reviews', onSale: '1' } },
    { title: 'Free to keep', query: { upperPrice: '0' } },
];

export default function App() {
    const [currentView, setCurrentView] = useState('deals');
    const [currentUser, setCurrentUser] = useState(null);

    return (
        <>
            <Header
                currentView={currentView}
                onViewChange={setCurrentView}
                currentUser={currentUser}
            />
            <main className="page">
                {currentView === 'deals' ? (
                    SHELVES.map((shelf) => (
                        <Shelf key={shelf.title} title={shelf.title} query={shelf.query} />
                    ))
                ) : (
                    <AccountAuth
                        currentUser={currentUser}
                        onUserChange={setCurrentUser}
                    />
                )}
            </main>
        </>
    );
}
