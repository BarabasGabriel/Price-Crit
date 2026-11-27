// F3 – Accounts, wishlists and alerts · Bujor David Marian
// API client for account registration, verification and login

export async function registerUser({ email, username, password }) {
    const res = await fetch('/api/accounts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create account');
    return data;
}

export async function verifyEmail(token) {
    const res = await fetch(`/api/accounts/verify/${encodeURIComponent(token)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');
    return data;
}

export async function resendVerification(email) {
    const res = await fetch('/api/accounts/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend verification');
    return data;
}

export async function loginUser({ email, password }) {
    const res = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
}
