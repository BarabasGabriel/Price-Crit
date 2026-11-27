import { useState, useEffect } from 'react';
import { registerUser, verifyEmail, loginUser, resendVerification } from './authApi.js';
import './Auth.css';

export default function AccountAuth({ currentUser, onUserChange }) {
    const [mode, setMode] = useState('register'); // 'register' | 'login'
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Simulated email inbox showing verification link
    const [mockEmailReceived, setMockEmailReceived] = useState(null);

    // Check for #verify=<token> in the URL hash
    useEffect(() => {
        const checkHash = async () => {
            const hash = window.location.hash;
            if (hash.startsWith('#verify=')) {
                const token = hash.replace('#verify=', '');
                if (token) {
                    setLoading(true);
                    try {
                        const res = await verifyEmail(token);
                        setSuccessMessage(res.message || 'Email successfully verified! You can now log in.');
                        if (currentUser && currentUser.email === res.user?.email) {
                            onUserChange({ ...currentUser, isVerified: true });
                        }
                    } catch (err) {
                        setError(err.message);
                    } finally {
                        setLoading(false);
                        window.location.hash = '';
                    }
                }
            }
        };

        checkHash();
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, [currentUser, onUserChange]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setMockEmailReceived(null);
        setLoading(true);

        try {
            const res = await registerUser({ email, username, password });
            setSuccessMessage(res.message);
            // Save mock email delivery
            setMockEmailReceived({
                email: res.user.email,
                link: res.verificationLink,
                token: res.verificationToken,
            });
            onUserChange(res.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            const res = await loginUser({ email, password });
            setSuccessMessage(`Welcome back, ${res.user.username}!`);
            onUserChange(res.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!currentUser?.email && !email) return;
        setError(null);
        try {
            const res = await resendVerification(currentUser?.email || email);
            setSuccessMessage('A fresh verification link has been issued.');
            setMockEmailReceived({
                email: res.email || currentUser?.email || email,
                link: res.verificationLink,
                token: res.verificationToken,
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        onUserChange(null);
        setMockEmailReceived(null);
        setSuccessMessage('You have logged out.');
    };

    // If already logged in, show user profile card and verification state
    if (currentUser) {
        return (
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Account Profile</h2>
                    <p>Signed in as <strong>{currentUser.username}</strong></p>
                </div>

                {successMessage && <div className="auth-alert auth-alert-success">{successMessage}</div>}
                {error && <div className="auth-alert auth-alert-error">{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Email:</span>
                        <strong>{currentUser.email}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Status:</span>
                        {currentUser.isVerified ? (
                            <span className="account-status-badge badge-verified">
                                ✓ Email Verified
                            </span>
                        ) : (
                            <span className="account-status-badge badge-unverified">
                                ⚠ Unverified Email
                            </span>
                        )}
                    </div>

                    {!currentUser.isVerified && (
                        <div style={{ marginTop: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                                onClick={handleResend}
                            >
                                Resend verification email
                            </button>
                        </div>
                    )}

                    {mockEmailReceived && (
                        <div className="verification-inbox-sim">
                            <div className="inbox-title">
                                ✉ Simulated Email to {mockEmailReceived.email}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                Subject: <strong>Verify your Price Crit account</strong>
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                Click the link below to confirm your email address:
                            </p>
                            <a
                                href={mockEmailReceived.link}
                                className="verification-link-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.hash = `verify=${mockEmailReceived.token}`;
                                }}
                            >
                                Confirm Email Address
                            </a>
                        </div>
                    )}

                    <button
                        type="button"
                        className="btn btn-danger"
                        style={{ marginTop: '12px' }}
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h2>{mode === 'register' ? 'Create an Account' : 'Sign In'}</h2>
                <p>
                    {mode === 'register'
                        ? 'Follow price drops, build wishlists, and track games.'
                        : 'Welcome back! Enter your details to continue.'}
                </p>
            </div>

            {error && <div className="auth-alert auth-alert-error">{error}</div>}
            {successMessage && <div className="auth-alert auth-alert-success">{successMessage}</div>}

            {mockEmailReceived && (
                <div className="verification-inbox-sim">
                    <div className="inbox-title">
                        ✉ Simulated Email to {mockEmailReceived.email}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        Subject: <strong>Verify your Price Crit account</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        Click the button below to simulate opening the email verification link:
                    </p>
                    <a
                        href={mockEmailReceived.link}
                        className="verification-link-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.hash = `verify=${mockEmailReceived.token}`;
                        }}
                    >
                        Confirm Email Address
                    </a>
                </div>
            )}

            <form className="auth-form" onSubmit={mode === 'register' ? handleRegister : handleLogin}>
                {mode === 'register' && (
                    <div className="form-group">
                        <label htmlFor="auth-username">Username (optional)</label>
                        <input
                            id="auth-username"
                            type="text"
                            className="form-input"
                            placeholder="GamerTag"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="auth-email">Email Address *</label>
                    <input
                        id="auth-email"
                        type="email"
                        required
                        className="form-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="auth-password">Password *</label>
                    <input
                        id="auth-password"
                        type="password"
                        required
                        minLength={6}
                        className="form-input"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {mode === 'register' && (
                        <span className="form-hint">Must be at least 6 characters. Hashed securely with scrypt.</span>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginTop: '8px', padding: '10px' }}
                >
                    {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
                </button>
            </form>

            <div className="auth-toggle">
                {mode === 'register' ? (
                    <span>
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                        >
                            Sign In
                        </button>
                    </span>
                ) : (
                    <span>
                        Don&apos;t have an account yet?{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setMode('register');
                                setError(null);
                                setSuccessMessage(null);
                            }}
                        >
                            Create one
                        </button>
                    </span>
                )}
            </div>
        </div>
    );
}
