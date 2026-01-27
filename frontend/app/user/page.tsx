'use client';

import { useEffect, useState } from 'react';

type MeResponse = {
    email?: string | null;
    emailVerified: boolean;
    displayName?: string | null;
    coinBalance: number;
};

type CoinBalanceResponse = {
    balance: number;
    recent: { id: number; type: string; amount: number; createdAt: string }[];
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
        const text = await response.text();
        throw new Error(text || `Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
};

export default function UserPage() {
    const [me, setMe] = useState<MeResponse | null>(null);
    const [coins, setCoins] = useState<CoinBalanceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const meResponse = await fetchJson<MeResponse>('/api/me');
                setMe(meResponse);
                const coinResponse = await fetchJson<CoinBalanceResponse>('/api/me/coins');
                setCoins(coinResponse);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load profile.');
            }
        };
        void load();
    }, []);

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 py-12">
            <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white text-glow">Account overview</h1>
                    <p className="text-sm text-gray-400">Manage your profile and account status.</p>
                </div>
                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white">Profile</h2>
                        <div className="mt-4 space-y-2 text-sm text-gray-300">
                            <p>Email: <span className="text-white">{me?.email || '—'}</span></p>
                            <p>Status: <span className="text-white">{me?.emailVerified ? 'Verified' : 'Unverified'}</span></p>
                            <p>Display name: <span className="text-white">{me?.displayName || '—'}</span></p>
                        </div>
                        <button
                            type="button"
                            className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
                        >
                            Manage account
                        </button>
                    </div>
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-white">Coins</h2>
                        <p className="mt-2 text-sm text-gray-400">Balance available for generation.</p>
                        <div className="mt-4 text-3xl font-semibold text-white">
                            {coins?.balance ?? me?.coinBalance ?? '—'}
                        </div>
                        <div className="mt-4 space-y-2 text-xs text-gray-400">
                            {(coins?.recent ?? []).slice(0, 5).map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <span>{item.type}</span>
                                    <span>{item.amount > 0 ? `+${item.amount}` : item.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
