'use client';

import { useEffect, useState } from 'react';

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

const packs = [
    { id: 'starter', coins: 200, price: '$9' },
    { id: 'creator', coins: 600, price: '$24' },
    { id: 'studio', coins: 1500, price: '$49' },
];

export default function StorePage() {
    const [mode, setMode] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handlePurchase = async (packId: string) => {
        setError(null);
        setMessage(null);
        try {
            const response = await fetchJson<{ status: string; message: string }>('/api/me/coins/purchase-intent', {
                method: 'POST',
                body: JSON.stringify({ packId }),
            });
            setMessage(response.message || 'Purchase intent created.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Purchase failed.');
        }
    };

    const handleAddCoins = async () => {
        setError(null);
        setMessage(null);
        try {
            await fetchJson('/api/me/coins/add', {
                method: 'POST',
                body: JSON.stringify({ amount: 250, reason: 'Dev test coins' }),
            });
            setMessage('Added test coins.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add coins.');
        }
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 py-12">
            <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white text-glow">Coin store</h1>
                    <p className="text-sm text-gray-400">Purchase coins to generate more assets.</p>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {packs.map((pack) => (
                        <div key={pack.id} className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white">{pack.coins} coins</h2>
                            <p className="mt-2 text-sm text-gray-400">{pack.price} one-time</p>
                            <button
                                type="button"
                                className="btn-glow mt-6 w-full"
                                onClick={() => handlePurchase(pack.id)}
                            >
                                Buy pack
                            </button>
                        </div>
                    ))}
                </div>
                {mode === 'DEV_DEFAULT_USER' && (
                    <button
                        type="button"
                        className="mt-8 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
                        onClick={handleAddCoins}
                    >
                        Add test coins (dev)
                    </button>
                )}
                {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
            </div>
        </div>
    );
}
