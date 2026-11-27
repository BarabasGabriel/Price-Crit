// F3 – Accounts, wishlists and alerts · Bujor David Marian
// API client for wishlists

export async function fetchWishlists() {
    const res = await fetch('/api/accounts/wishlists');
    if (!res.ok) throw new Error('Failed to load wishlists');
    return res.json();
}

export async function createWishlistApi(name) {
    const res = await fetch('/api/accounts/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to create wishlist');
    return res.json();
}

export async function renameWishlistApi(id, name) {
    const res = await fetch(`/api/accounts/wishlists/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to rename wishlist');
    return res.json();
}

export async function deleteWishlistApi(id) {
    const res = await fetch(`/api/accounts/wishlists/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete wishlist');
    return res.json();
}

export async function addGameToWishlistApi(listId, game) {
    const res = await fetch(`/api/accounts/wishlists/${encodeURIComponent(listId)}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
    });
    if (!res.ok) throw new Error('Failed to add game to wishlist');
    return res.json();
}

export async function updateGameInWishlistApi(listId, itemId, updates) {
    const res = await fetch(`/api/accounts/wishlists/${encodeURIComponent(listId)}/games/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update game');
    return res.json();
}

export async function removeGameFromWishlistApi(listId, itemId) {
    const res = await fetch(`/api/accounts/wishlists/${encodeURIComponent(listId)}/games/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove game');
    return res.json();
}

export async function moveGameBetweenWishlistsApi(sourceListId, targetWishlistId, itemId) {
    const res = await fetch(`/api/accounts/wishlists/${encodeURIComponent(sourceListId)}/games/${encodeURIComponent(itemId)}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetWishlistId }),
    });
    if (!res.ok) throw new Error('Failed to move game');
    return res.json();
}
