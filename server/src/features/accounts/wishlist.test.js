import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
    getAllWishlists,
    createWishlist,
    renameWishlist,
    deleteWishlist,
    addGameToWishlist,
    updateGameInWishlist,
    removeGameFromWishlist,
    moveGameBetweenWishlists,
} from './db.js';
import { unlinkSync, existsSync } from 'node:fs';

const TEST_DB = './data/test-wishlists.json';
process.env.WISHLISTS_DB_FILE = TEST_DB;

describe('Wishlist service', () => {
    beforeEach(() => {
        if (existsSync(TEST_DB)) {
            unlinkSync(TEST_DB);
        }
    });

    it('creates and lists wishlists', () => {
        const initial = getAllWishlists();
        assert.equal(initial.length, 1);
        assert.equal(initial[0].name, 'My Wishlist');

        const created = createWishlist('RPG Favorites');
        assert.equal(created.name, 'RPG Favorites');
        assert.equal(getAllWishlists().length, 2);
    });

    it('renames a wishlist', () => {
        const list = createWishlist('Old Name');
        const renamed = renameWishlist(list.id, 'New Name');
        assert.equal(renamed.name, 'New Name');
    });

    it('adds and updates game target price and note in a wishlist', () => {
        const list = createWishlist('Strategy');
        const item = addGameToWishlist(list.id, {
            title: 'Civilization VII',
            targetPrice: 39.99,
            currentPrice: 69.99,
            note: 'Wait for steam winter sale',
        });

        assert.equal(item.title, 'Civilization VII');
        assert.equal(item.targetPrice, 39.99);
        assert.equal(item.note, 'Wait for steam winter sale');

        const updated = updateGameInWishlist(list.id, item.id, {
            targetPrice: 29.99,
            note: 'Updated note',
        });
        assert.equal(updated.targetPrice, 29.99);
        assert.equal(updated.note, 'Updated note');
    });

    it('moves a game from one wishlist to another', () => {
        const list1 = createWishlist('List 1');
        const list2 = createWishlist('List 2');

        const item = addGameToWishlist(list1.id, {
            title: 'Hades II',
            targetPrice: 20.0,
            note: 'Early access',
        });

        const moved = moveGameBetweenWishlists(list1.id, list2.id, item.id);
        assert.equal(moved.id, item.id);

        const all = getAllWishlists();
        const l1 = all.find((l) => l.id === list1.id);
        const l2 = all.find((l) => l.id === list2.id);

        assert.equal(l1.items.length, 0);
        assert.equal(l2.items.length, 1);
        assert.equal(l2.items[0].title, 'Hades II');
    });

    it('removes a game and deletes a wishlist', () => {
        const list = createWishlist('Temp');
        const item = addGameToWishlist(list.id, { title: 'Doom' });
        assert.equal(removeGameFromWishlist(list.id, item.id), true);

        const deleted = deleteWishlist(list.id);
        assert.equal(deleted, true);
    });
});
