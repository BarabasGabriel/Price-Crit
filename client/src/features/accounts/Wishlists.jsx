import { useEffect, useState } from 'react';
import {
    fetchWishlists,
    createWishlistApi,
    renameWishlistApi,
    deleteWishlistApi,
    addGameToWishlistApi,
    updateGameInWishlistApi,
    removeGameFromWishlistApi,
    moveGameBetweenWishlistsApi,
} from './api.js';
import WishlistGameCard from './WishlistGameCard.jsx';
import './Wishlists.css';

export default function Wishlists() {
    const [wishlists, setWishlists] = useState([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [newListName, setNewListName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form fields for custom manual add
    const [gameTitle, setGameTitle] = useState('');
    const [gameTargetPrice, setGameTargetPrice] = useState('');
    const [gameNote, setGameNote] = useState('');
    const [gameCurrentPrice, setGameCurrentPrice] = useState('');

    const loadData = async (preserveSelectedId = null) => {
        try {
            setError(null);
            const data = await fetchWishlists();
            setWishlists(data);
            if (data.length > 0) {
                if (preserveSelectedId && data.some((w) => w.id === preserveSelectedId)) {
                    setSelectedListId(preserveSelectedId);
                } else if (!selectedListId || !data.some((w) => w.id === selectedListId)) {
                    setSelectedListId(data[0].id);
                }
            } else {
                setSelectedListId('');
            }
        } catch {
            setError('Failed to connect to wishlist service');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentWishlist = wishlists.find((w) => w.id === selectedListId) || wishlists[0];

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        try {
            const created = await createWishlistApi(newListName.trim());
            setNewListName('');
            await loadData(created.id);
        } catch {
            setError('Could not create wishlist');
        }
    };

    const handleStartRename = () => {
        if (!currentWishlist) return;
        setRenameValue(currentWishlist.name);
        setIsRenaming(true);
    };

    const handleSaveRename = async (e) => {
        e.preventDefault();
        if (!renameValue.trim() || !currentWishlist) return;
        try {
            await renameWishlistApi(currentWishlist.id, renameValue.trim());
            setIsRenaming(false);
            await loadData(currentWishlist.id);
        } catch {
            setError('Could not rename wishlist');
        }
    };

    const handleDeleteList = async () => {
        if (!currentWishlist) return;
        if (!window.confirm(`Are you sure you want to delete "${currentWishlist.name}"?`)) return;
        try {
            await deleteWishlistApi(currentWishlist.id);
            await loadData();
        } catch {
            setError('Could not delete wishlist');
        }
    };

    const handleAddGame = async (e) => {
        e.preventDefault();
        if (!gameTitle.trim() || !currentWishlist) return;
        try {
            await addGameToWishlistApi(currentWishlist.id, {
                title: gameTitle.trim(),
                targetPrice: gameTargetPrice !== '' ? Number(gameTargetPrice) : null,
                currentPrice: gameCurrentPrice !== '' ? Number(gameCurrentPrice) : null,
                note: gameNote.trim(),
            });
            setGameTitle('');
            setGameTargetPrice('');
            setGameCurrentPrice('');
            setGameNote('');
            await loadData(currentWishlist.id);
        } catch {
            setError('Could not add game');
        }
    };

    const handleEditGame = async (listId, itemId, updates) => {
        try {
            await updateGameInWishlistApi(listId, itemId, updates);
            await loadData(listId);
        } catch {
            setError('Could not update game');
        }
    };

    const handleRemoveGame = async (listId, itemId) => {
        try {
            await removeGameFromWishlistApi(listId, itemId);
            await loadData(listId);
        } catch {
            setError('Could not remove game');
        }
    };

    const handleMoveGame = async (sourceListId, targetListId, itemId) => {
        try {
            await moveGameBetweenWishlistsApi(sourceListId, targetListId, itemId);
            await loadData(sourceListId);
        } catch {
            setError('Could not move game');
        }
    };

    if (loading) {
        return <div className="page" style={{ padding: '32px 0' }}>Loading wishlists...</div>;
    }

    return (
        <section className="wishlists-page">
            <div className="wishlists-header">
                <div className="wishlists-title-area">
                    <h2>Wishlists</h2>
                    <span className="wishlists-count-badge">
                        {wishlists.length} {wishlists.length === 1 ? 'list' : 'lists'}
                    </span>
                </div>

                <form className="new-list-form" onSubmit={handleCreateList}>
                    <input
                        type="text"
                        className="input-text"
                        placeholder="New list name (e.g. RPGs)"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        + Create list
                    </button>
                </form>
            </div>

            {error && <div style={{ color: '#e03131', background: '#ffe3e3', padding: '8px 12px', borderRadius: '8px' }}>{error}</div>}

            {wishlists.length > 0 && (
                <div className="wishlists-tabs">
                    {wishlists.map((w) => (
                        <button
                            key={w.id}
                            type="button"
                            className={`wishlist-tab ${w.id === currentWishlist?.id ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedListId(w.id);
                                setIsRenaming(false);
                            }}
                        >
                            <span>{w.name}</span>
                            <span className="tab-badge">{w.items?.length || 0}</span>
                        </button>
                    ))}
                </div>
            )}

            {currentWishlist ? (
                <div className="active-wishlist">
                    <div className="active-wishlist-header">
                        {isRenaming ? (
                            <form className="list-rename-form" onSubmit={handleSaveRename}>
                                <input
                                    type="text"
                                    className="input-text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsRenaming(false)}
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <h3 className="list-title">{currentWishlist.name}</h3>
                        )}

                        <div className="list-actions">
                            {!isRenaming && (
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleStartRename}>
                                    Rename list
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={handleDeleteList}
                                title="Delete this list"
                            >
                                Delete list
                            </button>
                        </div>
                    </div>

                    {/* Quick Add Game to Current Wishlist */}
                    <div className="quick-add-section">
                        <div className="quick-add-title">Add game to &ldquo;{currentWishlist.name}&rdquo;</div>
                        <form className="quick-add-form" onSubmit={handleAddGame}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Game Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="input-text"
                                    placeholder="e.g. Cyberpunk 2077"
                                    value={gameTitle}
                                    onChange={(e) => setGameTitle(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="input-text"
                                    placeholder="e.g. 29.99"
                                    value={gameTargetPrice}
                                    onChange={(e) => setGameTargetPrice(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Current Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="input-text"
                                    placeholder="e.g. 59.99"
                                    value={gameCurrentPrice}
                                    onChange={(e) => setGameCurrentPrice(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Note</label>
                                <input
                                    type="text"
                                    className="input-text"
                                    placeholder="e.g. Wait for complete edition"
                                    value={gameNote}
                                    onChange={(e) => setGameNote(e.target.value)}
                                />
                            </div>
                            <div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '38px' }}>
                                    + Add game
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Games Grid or Empty State */}
                    {currentWishlist.items && currentWishlist.items.length > 0 ? (
                        <div className="wishlist-grid">
                            {currentWishlist.items.map((item) => (
                                <WishlistGameCard
                                    key={item.id}
                                    item={item}
                                    currentListId={currentWishlist.id}
                                    allLists={wishlists}
                                    onEdit={handleEditGame}
                                    onRemove={handleRemoveGame}
                                    onMove={handleMoveGame}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>This wishlist is empty.</p>
                            <p style={{ fontSize: '0.9rem' }}>Add games above or from deal cards to track prices and personal notes.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-state">
                    <p>No wishlists found. Create one above to get started!</p>
                </div>
            )}
        </section>
    );
}
