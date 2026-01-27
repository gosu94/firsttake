'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type MeResponse = {
    id: number;
    email: string | null;
    emailVerified: boolean;
    displayName?: string | null;
    coinBalance: number;
    securityMode: string;
};

type ModeResponse = {
    mode: string;
};

const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers ?? {}),
        },
        ...options,
    });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
};

export function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mode, setMode] = useState<string>('');
    const [me, setMe] = useState<MeResponse | null>(null);
    const [coinBalance, setCoinBalance] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const modeResponse = await fetchJson<ModeResponse>('/api/auth/mode');
                if (isMounted) {
                    setMode(modeResponse.mode);
                }
            } catch (_) {
                if (isMounted) {
                    setMode('');
                }
            }

            try {
                const meResponse = await fetchJson<MeResponse>('/api/me');
                if (isMounted) {
                    setMe(meResponse);
                    setCoinBalance(meResponse.coinBalance ?? null);
                }
            } catch (_) {
                if (isMounted) {
                    setMe(null);
                }
            }

            try {
                const coinsResponse = await fetchJson<{ balance: number }>('/api/me/coins');
                if (isMounted) {
                    setCoinBalance(coinsResponse.balance);
                }
            } catch (_) {
                if (isMounted) {
                    setCoinBalance((prev) => prev ?? null);
                }
            }
        };
        void load();
        return () => {
            isMounted = false;
        };
    }, []);

    const links = useMemo(
        () => [
            { href: '/', label: 'Dashboard' },
            { href: '/gallery', label: 'Gallery' },
            { href: '/store', label: 'Store' },
            { href: '/user', label: 'User' },
            { href: '/settings', label: 'Settings' },
        ],
        [],
    );

    const handleLogout = async () => {
        await fetchJson('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <nav className="glass-nav sticky top-0 z-50 w-full">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-lg font-semibold text-white text-glow">
                        FirstTake
                    </Link>
                    <div className="hidden items-center gap-4 md:flex">
                        {links.map((link) => {
                            const active = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={
                                        active
                                            ? 'rounded-full bg-white/10 px-3 py-1 text-sm text-white'
                                            : 'rounded-full px-3 py-1 text-sm text-gray-400 hover:text-white'
                                    }
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 md:flex">
                        <span>Coins</span>
                        <span className="text-white">{coinBalance ?? '—'}</span>
                    </div>
                    {mode === 'DEV_DEFAULT_USER' && (
                        <span className="hidden rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-200 md:inline">
                            Dev User
                        </span>
                    )}
                    {me ? (
                        <div className="flex items-center gap-3">
                            <span className="hidden text-sm text-gray-300 md:inline">
                                {me.displayName || me.email || 'Account'}
                            </span>
                            {mode === 'REAL_AUTH' ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:bg-white/10"
                                >
                                    Logout
                                </button>
                            ) : null}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:bg-white/10"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
