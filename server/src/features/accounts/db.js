// F3 – Accounts, wishlists and alerts · Bujor David Marian
// JSON file-based database for wishlists and wishlist items
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '../../../../data');
const dbFile = process.env.WISHLISTS_DB_FILE ?? join(dataDir, 'wishlists.json');

mkdirSync(dirname(dbFile), { recursive: true });

function loadData() {
    if (!existsSync(dbFile)) {
        const initial = {
            wishlists: [
                {
                    id: 'default',
                    name: 'My Wishlist',
                    createdAt: new Date().toISOString(),
                    items: [],
                },
            ],
        };
        saveData(initial);
        return initial;
    }
    try {
        const content = readFileSync(dbFile, 'utf8');
        return JSON.parse(content);
    } catch {
        return { wishlists: [] };
    }
}

function saveData(data) {
    writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
}

export function getAllWishlists() {
    const data = loadData();
    return data.wishlists;
}

export function getWishlistById(id) {
    const data = loadData();
    return data.wishlists.find((w) => w.id === id) || null;
}

export function createWishlist(name) {
    const data = loadData();
    const trimmedName = name?.trim() || 'Untitled List';
    const newWishlist = {
        id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        createdAt: new Date().toISOString(),
        items: [],
    };
    data.wishlists.push(newWishlist);
    saveData(data);
    return newWishlist;
}

export function renameWishlist(id, name) {
    const data = loadData();
    const wishlist = data.wishlists.find((w) => w.id === id);
    if (!wishlist) return null;
    wishlist.name = name.trim() || wishlist.name;
    saveData(data);
    return wishlist;
}

export function deleteWishlist(id) {
    const data = loadData();
    const index = data.wishlists.findIndex((w) => w.id === id);
    if (index === -1) return false;
    data.wishlists.splice(index, 1);
    // Ensure at least one wishlist exists if all are deleted
    if (data.wishlists.length === 0) {
        data.wishlists.push({
            id: 'default',
            name: 'My Wishlist',
            createdAt: new Date().toISOString(),
            items: [],
        });
    }
    saveData(data);
    return true;
}

export function addGameToWishlist(listId, game) {
    const data = loadData();
    const wishlist = data.wishlists.find((w) => w.id === listId);
    if (!wishlist) return null;

    // Check if game already exists in this list (by gameId or title)
    const existingIndex = wishlist.items.findIndex((item) => (game.gameId && item.gameId === game.gameId) || item.title === game.title);

    const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        gameId: game.gameId || null,
        title: game.title,
        image: game.image || '',
        currentPrice: game.currentPrice !== undefined ? Number(game.currentPrice) : null,
        regularPrice: game.regularPrice !== undefined ? Number(game.regularPrice) : null,
        targetPrice: game.targetPrice !== undefined && game.targetPrice !== null ? Number(game.targetPrice) : null,
        note: game.note ? String(game.note) : '',
        url: game.url || '',
        addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
        // Update targetPrice or note if already in list
        wishlist.items[existingIndex] = {
            ...wishlist.items[existingIndex],
            targetPrice: newItem.targetPrice ?? wishlist.items[existingIndex].targetPrice,
            note: newItem.note || wishlist.items[existingIndex].note,
            currentPrice: newItem.currentPrice ?? wishlist.items[existingIndex].currentPrice,
            regularPrice: newItem.regularPrice ?? wishlist.items[existingIndex].regularPrice,
            image: newItem.image || wishlist.items[existingIndex].image,
            url: newItem.url || wishlist.items[existingIndex].url,
        };
        saveData(data);
        return wishlist.items[existingIndex];
    }

    wishlist.items.push(newItem);
    saveData(data);
    return newItem;
}

export function updateGameInWishlist(listId, itemId, updates) {
    const data = loadData();
    const wishlist = data.wishlists.find((w) => w.id === listId);
    if (!wishlist) return null;

    const item = wishlist.items.find((i) => i.id === itemId);
    if (!item) return null;

    if (updates.targetPrice !== undefined) {
        item.targetPrice = updates.targetPrice === null || updates.targetPrice === '' ? null : Number(updates.targetPrice);
    }
    if (updates.note !== undefined) {
        item.note = String(updates.note);
    }
    if (updates.currentPrice !== undefined) {
        item.currentPrice = Number(updates.currentPrice);
    }

    saveData(data);
    return item;
}

export function removeGameFromWishlist(listId, itemId) {
    const data = loadData();
    const wishlist = data.wishlists.find((w) => w.id === listId);
    if (!wishlist) return false;

    const index = wishlist.items.findIndex((i) => i.id === itemId);
    if (index === -1) return false;

    wishlist.items.splice(index, 1);
    saveData(data);
    return true;
}

export function moveGameBetweenWishlists(sourceListId, targetListId, itemId) {
    const data = loadData();
    const sourceList = data.wishlists.find((w) => w.id === sourceListId);
    const targetList = data.wishlists.find((w) => w.id === targetListId);
    if (!sourceList || !targetList) return null;

    const index = sourceList.items.findIndex((i) => i.id === itemId);
    if (index === -1) return null;

    const [item] = sourceList.items.splice(index, 1);
    // Add to target list
    targetList.items.push(item);
    saveData(data);
    return item;
}
