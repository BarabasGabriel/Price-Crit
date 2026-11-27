// F3 – Accounts, wishlists and alerts · Bujor David Marian
// Secure user accounts storage with scrypt password hashing and email verification tokens
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '../../../../data');

function getDbFile() {
    const file = process.env.USERS_DB_FILE ?? join(dataDir, 'users.json');
    mkdirSync(dirname(file), { recursive: true });
    return file;
}

function loadData() {
    const dbFile = getDbFile();
    if (!existsSync(dbFile)) {
        const initial = { users: [] };
        saveData(initial);
        return initial;
    }
    try {
        const content = readFileSync(dbFile, 'utf8');
        return JSON.parse(content);
    } catch {
        return { users: [] };
    }
}

function saveData(data) {
    const dbFile = getDbFile();
    writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
}


/**
 * Hashes a plain-text password using Node.js crypto scrypt + salt.
 */
export function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a password against the stored salt:hash string.
 */
export function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKeyBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKeyBuffer);
}

/**
 * Creates a new user account with hashed password and verification token.
 */
export function createUser({ email, username, password }) {
    const data = loadData();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedUsername = username?.trim() || normalizedEmail.split('@')[0];

    // Check if email already registered
    const existing = data.users.find((u) => u.email === normalizedEmail);
    if (existing) {
        throw new Error('An account with this email already exists.');
    }

    const passwordHash = hashPassword(password);
    const verificationToken = randomBytes(32).toString('hex');
    // Token valid for 24 hours
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const newUser = {
        id: `user-${Date.now()}-${randomBytes(4).toString('hex')}`,
        email: normalizedEmail,
        username: trimmedUsername,
        passwordHash,
        isVerified: false,
        verificationToken,
        tokenExpiresAt,
        createdAt: new Date().toISOString(),
        verifiedAt: null,
    };

    data.users.push(newUser);
    saveData(data);

    return {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        isVerified: newUser.isVerified,
        verificationToken: newUser.verificationToken,
    };
}

/**
 * Verifies a user account using the verification token.
 */
export function verifyUserEmail(token) {
    const data = loadData();
    const user = data.users.find((u) => u.verificationToken === token);

    if (!user) {
        throw new Error('Invalid or expired verification token.');
    }

    if (user.isVerified) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            alreadyVerified: true,
        };
    }

    if (new Date(user.tokenExpiresAt) < new Date()) {
        throw new Error('Verification token has expired. Please request a new verification email.');
    }

    user.isVerified = true;
    user.verifiedAt = new Date().toISOString();
    // Keep verificationToken marked or preserve token reference for confirmation if needed
    user.tokenExpiresAt = null;

    saveData(data);

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: true,
    };
}

/**
 * Resends or regenerates a verification token for an unverified account.
 */
export function regenerateVerificationToken(email) {
    const data = loadData();
    const normalizedEmail = email.trim().toLowerCase();
    const user = data.users.find((u) => u.email === normalizedEmail);

    if (!user) {
        throw new Error('Account not found.');
    }

    if (user.isVerified) {
        throw new Error('Account is already verified.');
    }

    const newToken = randomBytes(32).toString('hex');
    user.verificationToken = newToken;
    user.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    saveData(data);

    return {
        email: user.email,
        verificationToken: newToken,
    };
}

/**
 * Authenticates user by email and password.
 */
export function authenticateUser(email, password) {
    const data = loadData();
    const normalizedEmail = email.trim().toLowerCase();
    const user = data.users.find((u) => u.email === normalizedEmail);

    if (!user) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;

    return {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
    };
}

/**
 * Gets user details by ID.
 */
export function getUserById(id) {
    const data = loadData();
    const user = data.users.find((u) => u.id === id);
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        verifiedAt: user.verifiedAt,
    };
}
