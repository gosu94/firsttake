'use client';

import { useEffect, useMemo, useState } from 'react';

type GalleryAsset = {
    id: number;
    projectId: number | null;
    beatId: number | null;
    assetType: 'AUDIO' | 'IMAGE' | 'VIDEO';
    url: string;
    provider?: string;
    mimeType?: string;
    durationSeconds?: number;
    originalPrompt?: string | null;
    createdAt?: string;
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

export default function GalleryPage() {
    const [assets, setAssets] = useState<GalleryAsset[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'AUDIO' | 'IMAGE' | 'VIDEO'>('ALL');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setError(null);
            try {
                const query = filter === 'ALL' ? '' : `?type=${filter}`;
                const response = await fetchJson<GalleryAsset[]>(`/api/me/gallery${query}`);
                setAssets(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load gallery.');
            }
        };
        void load();
    }, [filter]);

    const grouped = useMemo(() => {
        const map = new Map<string, GalleryAsset[]>();
        assets.forEach((asset) => {
            const key = asset.projectId ? `Project ${asset.projectId}` : 'Ungrouped';
            const existing = map.get(key) ?? [];
            existing.push(asset);
            map.set(key, existing);
        });
        return Array.from(map.entries());
    }, [assets]);

    const renderAsset = (asset: GalleryAsset) => {
        if (asset.assetType === 'AUDIO') {
            return <audio controls className="w-full" src={asset.url} />;
        }
        if (asset.assetType === 'VIDEO') {
            return <video controls className="w-full rounded-xl" src={asset.url} />;
        }
        return <img src={asset.url} alt="Generated" className="w-full rounded-xl object-cover" />;
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 py-12">
            <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white text-glow">Your gallery</h1>
                    <p className="text-sm text-gray-400">All generated assets, ready to preview.</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                    {(['ALL', 'AUDIO', 'IMAGE', 'VIDEO'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={
                                filter === type
                                    ? 'rounded-full bg-white/10 px-4 py-2 text-xs text-white'
                                    : 'rounded-full border border-white/10 px-4 py-2 text-xs text-gray-300 hover:bg-white/10'
                            }
                            onClick={() => setFilter(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
                <div className="mt-8 flex flex-col gap-8">
                    {grouped.map(([group, items]) => (
                        <div key={group} className="space-y-4">
                            <h2 className="text-lg font-semibold text-white">{group}</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {items.map((asset) => (
                                    <div key={asset.id} className="glass-card p-4">
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{asset.assetType}</span>
                                            {asset.createdAt && <span>{new Date(asset.createdAt).toLocaleString()}</span>}
                                        </div>
                                        <div className="mt-4">{renderAsset(asset)}</div>
                                        {asset.originalPrompt && (
                                            <p className="mt-3 max-h-16 overflow-hidden text-xs text-gray-500">
                                                {asset.originalPrompt}
                                            </p>
                                        )}
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                type="button"
                                                className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/10"
                                                onClick={() => window.open(asset.url, '_blank')}
                                            >
                                                Open Preview
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {grouped.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
                            No assets yet. Generate scenes from the dashboard to populate your gallery.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
