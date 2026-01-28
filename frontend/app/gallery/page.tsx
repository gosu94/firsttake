'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type GalleryProject = {
    id: number;
    name: string;
    status: 'DRAFT' | 'SAVED' | 'ARCHIVED';
    createdAt?: string;
    updatedAt?: string;
    assetCount: number;
    previewUrl?: string | null;
    previewAssetType?: 'IMAGE' | 'VIDEO' | null;
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
    const [projects, setProjects] = useState<GalleryProject[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setError(null);
            try {
                const response = await fetchJson<GalleryProject[]>('/api/gallery/projects');
                setProjects(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load gallery.');
            }
        };
        void load();
    }, []);

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 py-12">
            <div className="glass-panel rounded-3xl p-8">
                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white text-glow">Your gallery</h1>
                    <p className="text-sm text-gray-400">Browse assets by project.</p>
                </div>
                {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/gallery/${project.id}`}
                            className="glass-card p-5 transition-all hover:scale-[1.01]"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">{project.status}</p>
                                    <h2 className="text-lg font-semibold text-white">{project.name}</h2>
                                </div>
                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                                    {project.assetCount} assets
                                </span>
                            </div>
                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                                {project.previewUrl ? (
                                    project.previewAssetType === 'VIDEO' ? (
                                        <video
                                            className="h-40 w-full rounded-xl object-cover"
                                            src={project.previewUrl}
                                        />
                                    ) : (
                                        <img
                                            src={project.previewUrl}
                                            alt={`${project.name} preview`}
                                            className="h-40 w-full rounded-xl object-cover"
                                        />
                                    )
                                ) : (
                                    <div className="flex h-40 items-center justify-center text-xs text-gray-400">
                                        No preview yet
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-xs text-gray-400">
                                Updated {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : '—'}
                            </div>
                        </Link>
                    ))}
                    {projects.length === 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
                            No projects yet. Generate scenes from the dashboard to populate your gallery.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
