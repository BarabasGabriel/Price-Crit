import { useState } from 'react';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function WishlistGameCard({
    item,
    currentListId,
    allLists,
    onEdit,
    onRemove,
    onMove,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTargetPrice, setEditTargetPrice] = useState(item.targetPrice ?? '');
    const [editNote, setEditNote] = useState(item.note ?? '');

    const hasTargetPrice = item.targetPrice !== null && item.targetPrice !== undefined && item.targetPrice !== '';
    const hitsTarget = hasTargetPrice && item.currentPrice !== null && item.currentPrice <= Number(item.targetPrice);

    const handleSave = (e) => {
        e.preventDefault();
        onEdit(currentListId, item.id, {
            targetPrice: editTargetPrice === '' ? null : Number(editTargetPrice),
            note: editNote,
        });
        setIsEditing(false);
    };

    const otherLists = allLists.filter((l) => l.id !== currentListId);

    return (
        <div className="wishlist-card">
            <div className="card-img-wrap">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="card-img" loading="lazy" />
                ) : (
                    <div style={{ height: '100%', background: 'var(--cover)' }} />
                )}
                {hitsTarget && <span className="price-alert-badge">🎯 Target reached!</span>}
            </div>

            <div className="card-body">
                <h3 className="card-title">
                    {item.url ? (
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                            {item.title}
                        </a>
                    ) : (
                        item.title
                    )}
                </h3>

                <div className="card-prices">
                    {item.currentPrice !== null ? (
                        <span className="current-price">{item.currentPrice === 0 ? 'Free' : usd.format(item.currentPrice)}</span>
                    ) : (
                        <span className="current-price" style={{ color: 'var(--muted)' }}>No price data</span>
                    )}
                    {item.regularPrice && item.regularPrice > item.currentPrice && (
                        <s style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{usd.format(item.regularPrice)}</s>
                    )}
                </div>

                <div className="target-price-tag">
                    {hasTargetPrice ? (
                        <span>Target: <strong>{usd.format(item.targetPrice)}</strong></span>
                    ) : (
                        <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No target price</span>
                    )}
                </div>

                {item.note && (
                    <div className="card-note">
                        &ldquo;{item.note}&rdquo;
                    </div>
                )}

                {isEditing ? (
                    <form className="edit-game-form" onSubmit={handleSave}>
                        <div className="form-group">
                            <label>Target Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="input-text"
                                placeholder="e.g. 19.99"
                                value={editTargetPrice}
                                onChange={(e) => setEditTargetPrice(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Note</label>
                            <input
                                type="text"
                                className="input-text"
                                placeholder="Note about this game..."
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="card-actions">
                        <div className="card-button-row">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    setEditTargetPrice(item.targetPrice ?? '');
                                    setEditNote(item.note ?? '');
                                    setIsEditing(true);
                                }}
                            >
                                Edit details
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => onRemove(currentListId, item.id)}
                            >
                                Remove
                            </button>
                        </div>

                        {otherLists.length > 0 && (
                            <select
                                className="move-select"
                                defaultValue=""
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onMove(currentListId, e.target.value, item.id);
                                    }
                                }}
                            >
                                <option value="" disabled>
                                    Move to list...
                                </option>
                                {otherLists.map((list) => (
                                    <option key={list.id} value={list.id}>
                                        {list.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
