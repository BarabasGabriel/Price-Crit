import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
    createUser,
    verifyUserEmail,
    authenticateUser,
    regenerateVerificationToken,
    hashPassword,
    verifyPassword,
} from './userDb.js';
import { unlinkSync, existsSync } from 'node:fs';

const TEST_DB = './data/test-users.json';
process.env.USERS_DB_FILE = TEST_DB;

describe('User Authentication & Verification Service (5.1)', () => {
    beforeEach(() => {
        if (existsSync(TEST_DB)) {
            unlinkSync(TEST_DB);
        }
    });

    it('hashes passwords using scrypt with unique salts', () => {
        const password = 'mySecretPassword123';
        const hash1 = hashPassword(password);
        const hash2 = hashPassword(password);

        assert.notEqual(hash1, hash2, 'Salts should ensure hashes differ');
        assert.ok(verifyPassword(password, hash1), 'Password matches hash1');
        assert.ok(verifyPassword(password, hash2), 'Password matches hash2');
        assert.ok(!verifyPassword('wrongPassword', hash1), 'Wrong password fails');
    });

    it('creates an unverified user account with verification token', () => {
        const user = createUser({
            email: 'gamer@example.com',
            username: 'GamerOne',
            password: 'secretPassword123',
        });

        assert.equal(user.email, 'gamer@example.com');
        assert.equal(user.username, 'GamerOne');
        assert.equal(user.isVerified, false);
        assert.ok(user.verificationToken, 'Verification token must be generated');

        // Cannot duplicate registration with same email
        assert.throws(() => {
            createUser({
                email: 'gamer@example.com',
                password: 'anotherPassword',
            });
        }, /already exists/);
    });

    it('verifies an account when given a valid verification token', () => {
        const user = createUser({
            email: 'test@example.com',
            password: 'testPassword123',
        });

        const verified = verifyUserEmail(user.verificationToken);
        assert.equal(verified.isVerified, true);
        assert.equal(verified.email, 'test@example.com');

        // Verifying again is idempotent
        const secondAttempt = verifyUserEmail(user.verificationToken);
        assert.equal(secondAttempt.alreadyVerified, true);
    });

    it('authenticates user only with correct credentials', () => {
        createUser({
            email: 'login@example.com',
            username: 'LoginUser',
            password: 'correctPassword',
        });

        const success = authenticateUser('login@example.com', 'correctPassword');
        assert.ok(success);
        assert.equal(success.email, 'login@example.com');

        const failedWrongPass = authenticateUser('login@example.com', 'badPassword');
        assert.equal(failedWrongPass, null);

        const failedUnknownUser = authenticateUser('unknown@example.com', 'correctPassword');
        assert.equal(failedUnknownUser, null);
    });

    it('can regenerate verification token if needed', () => {
        const user = createUser({
            email: 'resend@example.com',
            password: 'password123',
        });

        const oldToken = user.verificationToken;
        const regen = regenerateVerificationToken('resend@example.com');
        assert.notEqual(regen.verificationToken, oldToken);

        const verified = verifyUserEmail(regen.verificationToken);
        assert.equal(verified.isVerified, true);
    });
});
