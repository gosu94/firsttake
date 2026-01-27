'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers ?? {}),
        },
        ...options,
    });
    const text = await response.text();
    if (!response.ok) {
        throw new Error(text || `Request failed: ${response.status}`);
    }
    return text ? (JSON.parse(text) as T) : ({} as T);
};

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetchJson<{ mode: string }>('/api/auth/mode');
                setMode(response.mode);
            } catch {
                setMode('');
            }
        };
        void load();
    }, []);

    const handleLogin = async () => {
        setError(null);
        setMessage(null);
        setIsLoading(true);
        try {
            await fetchJson('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setError(null);
        setMessage(null);
        setIsLoading(true);
        try {
            const response = await fetchJson<{ message: string }>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setMessage(response.message || 'Registration complete. Check your inbox.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 py-12">
            <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white text-glow">Welcome back</h1>
                    <p className="text-sm text-gray-400">
                        Sign in to manage projects, assets, and coins.
                    </p>
                    {mode === 'DEV_DEFAULT_USER' && (
                        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-sm text-indigo-200">
                            Dev mode: you are automatically signed in as the default user.
                        </div>
                    )}
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
                    <div className="glass-card p-6">
                        <div className="flex flex-col gap-4">
                            <label className="text-sm text-gray-400">Email</label>
                            <input
                                type="email"
                                className="input-glossy"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@company.com"
                            />
                        </div>
                        <div className="mt-4 flex flex-col gap-4">
                            <label className="text-sm text-gray-400">Password</label>
                            <input
                                type="password"
                                className="input-glossy"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleLogin}
                                className="btn-glow"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                            <button
                                type="button"
                                onClick={handleRegister}
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/10"
                                disabled={isLoading}
                            >
                                Create account
                            </button>
                        </div>
                        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
                        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
                    </div>
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white">Continue with Google</h2>
                        <p className="mt-2 text-sm text-gray-400">
                            Use Google OAuth2 for a one-click login.
                        </p>
                        <a
                            href="/oauth2/authorization/google"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/10"
                        >
                            Continue with Google
                        </a>
                        <p className="mt-4 text-xs text-gray-500">
                            OAuth configuration is required in REAL_AUTH mode.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
