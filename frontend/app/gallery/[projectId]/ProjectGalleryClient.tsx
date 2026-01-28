'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type GalleryAsset = {
    id: number;
    projectId: number | null;
    beatId: number | null;
    beatOrderIndex?: number | null;
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

export default function ProjectGalleryClient({ projectId }: { projectId: string }) {
    const numericProjectId = Number(projectId);
    const [assets, setAssets] = useState<GalleryAsset[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'AUDIO' | 'IMAGE' | 'VIDEO'>('ALL');
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (!Number.isFinite(numericProjectId)) {
            setError('Invalid project.');
            return;
        }
        const load = async () => {
            setError(null);
            try {
                const query = filter === 'ALL' ? '' : `?type=${filter}`;
                const response = await fetchJson<GalleryAsset[]>(
                    `/api/gallery/projects/${numericProjectId}/assets${query}`,
                );
                setAssets(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load assets.');
            }
        };
        void load();
    }, [filter, numericProjectId]);

    const grouped = useMemo(() => {
        const map = new Map<string, GalleryAsset[]>();
        assets.forEach((asset) => {
            const key =
                asset.beatOrderIndex !== null && asset.beatOrderIndex !== undefined
                    ? `Beat ${asset.beatOrderIndex + 1}`
                    : 'Unassigned';
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

    const handleDeleteAsset = async (assetId: number) => {
        setDeletingId(assetId);
        setError(null);
        try {
            const response = await fetch(`/api/gallery/assets/${assetId}`, { method: 'DELETE' });
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Failed to delete asset.');
            }
            setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete asset.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 py-12">
            <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-white text-glow">Project assets</h1>
                            <p className="text-sm text-gray-400">Assets for this project.</p>
                        </div>
                        <Link
                            href="/gallery"
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-200 hover:bg-white/10"
                        >
                            Back to projects
                        </Link>
                    </div>
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
                                            {asset.createdAt && (
                                                <span>{new Date(asset.createdAt).toLocaleString()}</span>
                                            )}
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
                                            <button
                                                type="button"
                                                className="rounded-xl border border-rose-400/50 px-3 py-2 text-xs text-rose-200 hover:bg-rose-500/20"
                                                onClick={() => handleDeleteAsset(asset.id)}
                                                disabled={deletingId === asset.id}
                                            >
                                                {deletingId === asset.id ? 'Deleting...' : 'Delete'}
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
