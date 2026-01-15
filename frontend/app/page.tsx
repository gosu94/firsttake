'use client';

import { useEffect, useMemo, useState } from 'react';

type Asset = {
    id: number;
    assetType: 'AUDIO' | 'IMAGE' | 'VIDEO';
    url: string;
    provider?: string;
    mimeType?: string;
    durationSeconds?: number;
    createdAt?: string;
};

type Beat = {
    id: number;
    orderIndex: number;
    scriptSentence: string;
    scenePrompt: string;
    sceneType: 'IMAGE' | 'VIDEO';
    selectedForGeneration: boolean;
    assets: Asset[];
};

type ProjectSummary = {
    id: number;
    name: string;
    generalPrompt?: string;
    tone?: string;
    narratorVoice?: string;
    narratorVoicePrompt?: string;
    visualStylePrompt?: string;
};

type ProjectDetail = {
    id: number;
    name: string;
    generalPrompt?: string;
    tone?: string;
    narratorVoice?: string;
    narratorVoicePrompt?: string;
    visualStylePrompt?: string;
    beats: Beat[];
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
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
};

export default function Page() {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('professional');
    const [narrator, setNarrator] = useState('alloy');
    const [narratorPrompt, setNarratorPrompt] = useState('');
    const [visualStylePrompt, setVisualStylePrompt] = useState('');
    const [format, setFormat] = useState('16:9');
    const [duration, setDuration] = useState('30s');
    const [ctaStyle, setCtaStyle] = useState('soft');
    const [projectId, setProjectId] = useState<number | null>(null);
    const [beats, setBeats] = useState<Beat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [animationKey, setAnimationKey] = useState(0);

    const projectLoaded = useMemo(() => projectId !== null, [projectId]);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const projects = await fetchJson<ProjectSummary[]>('/api/projects');
                if (projects.length === 0) {
                    setProjectId(null);
                    setBeats([]);
                    return;
                }
                const first = projects[0];
                setProjectId(first.id);
                await loadProject(first.id);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load project.');
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const loadProject = async (id: number) => {
        const detail = await fetchJson<ProjectDetail>(`/api/projects/${id}`);
        setPrompt(detail.generalPrompt ?? '');
        setTone(detail.tone ?? 'professional');
        setNarrator(detail.narratorVoice ?? 'alloy');
        setNarratorPrompt(detail.narratorVoicePrompt ?? '');
        setVisualStylePrompt(detail.visualStylePrompt ?? '');
        setBeats(detail.beats ?? []);
    };

    const updateProject = async (updates: Partial<ProjectDetail>) => {
        if (!projectLoaded) {
            return;
        }
        await fetchJson<ProjectSummary>(`/api/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: updates.name,
                generalPrompt: updates.generalPrompt,
                tone: updates.tone,
                narratorVoice: updates.narratorVoice,
                narratorVoicePrompt: updates.narratorVoicePrompt,
                visualStylePrompt: updates.visualStylePrompt,
            }),
        });
    };

    const updateBeat = async (beatId: number, updates: Partial<Beat>) => {
        await fetchJson<Beat>(`/api/beats/${beatId}`, {
            method: 'PUT',
            body: JSON.stringify({
                orderIndex: updates.orderIndex,
                scriptSentence: updates.scriptSentence,
                scenePrompt: updates.scenePrompt,
                sceneType: updates.sceneType,
                selectedForGeneration: updates.selectedForGeneration,
            }),
        });
    };

    const updateBeatLocal = (beatId: number, updates: Partial<Beat>) => {
        setBeats((items) =>
            items.map((item) => (item.id === beatId ? { ...item, ...updates } : item)),
        );
    };

    const handleGenerateScript = async () => {
        if (!projectLoaded) {
            return;
        }
        setIsGeneratingScript(true);
        setError(null);
        try {
            const result = await fetchJson<Beat[]>(`/api/projects/${projectId}/generate-script`, {
                method: 'POST',
                body: JSON.stringify({
                    generalPrompt: prompt,
                    tone,
                    narratorVoice: narrator,
                    narratorVoicePrompt: narratorPrompt,
                    visualStylePrompt,
                }),
            });
            setBeats(result);
            setAnimationKey((prev) => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate script.');
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleGenerateAssets = async () => {
        if (!projectLoaded) {
            return;
        }
        setIsGeneratingAssets(true);
        setError(null);
        try {
            const result = await fetchJson<Beat[]>(`/api/projects/${projectId}/generate-assets`, {
                method: 'POST',
                body: JSON.stringify({ aspectRatio: format }),
            });
            setBeats(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate assets.');
        } finally {
            setIsGeneratingAssets(false);
        }
    };

    const shouldAnimate = animationKey > 0;
    const hasAssets = beats.some((beat) => beat.assets && beat.assets.length > 0);

    return (
        <div className="min-h-screen bg-gray-800 blueprint-grid" data-oid="sn:jvm8">
            <nav
                className="bg-black/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex justify-between items-center"
                data-oid=":949wnf"
            >
                <div className="text-white font-bold text-xl" data-oid="8-c1j3u">
                    AdScript AI
                </div>
                <div className="flex items-center space-x-4" data-oid="mpduif4">
                    <button
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        data-oid="wj57jec"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="qydf_l2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                data-oid="-r_4mym"
                            />
                        </svg>
                    </button>
                    <button
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        data-oid="_he_i7v"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="g:s6gku"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                data-oid="6a_tb0."
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                data-oid="66kw5p5"
                            />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className="flex min-h-[calc(100vh-80px)] p-6 gap-6" data-oid="_0-3vjy">
                <div
                    className="w-1/3 bg-black/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700"
                    data-oid="5_ab5.k"
                >
                    <h2 className="text-white text-xl font-semibold mb-6" data-oid="inwpe9-">
                        Script Generator
                    </h2>

                    <div className="space-y-6" data-oid="v:51w37">
                        <div data-oid="v4inihj">
                            <label
                                className="block text-gray-300 text-sm font-medium mb-2"
                                data-oid="6u43poq"
                            >
                                General Prompt
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onBlur={() => updateProject({ generalPrompt: prompt })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={4}
                                placeholder="Describe your ad concept..."
                                data-oid="t4hqnd2"
                            />
                        </div>

                        <div className="flex space-x-4" data-oid="httpjw3">
                            <div className="flex-1" data-oid="zakf9wn">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="0dtg.sx"
                                >
                                    Tone
                                </label>
                                <select
                                    value={tone}
                                    onChange={(e) => {
                                        setTone(e.target.value);
                                        void updateProject({ tone: e.target.value });
                                    }}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="m46yds3"
                                >
                                    <option value="professional" data-oid="ugqxfo9">
                                        Professional
                                    </option>
                                    <option value="funny" data-oid="wsegq71">
                                        Funny
                                    </option>
                                    <option value="serious" data-oid="i2kdsly">
                                        Serious
                                    </option>
                                    <option value="casual" data-oid="vr:8889">
                                        Casual
                                    </option>
                                    <option value="dramatic" data-oid="3-dwsld">
                                        Dramatic
                                    </option>
                                    <option value="upbeat" data-oid="e480hjc">
                                        Upbeat
                                    </option>
                                </select>
                            </div>

                            <div className="flex-1" data-oid="e4ph900">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="p2xfd.5"
                                >
                                    Narrator Voice
                                </label>
                                <select
                                    value={narrator}
                                    onChange={(e) => {
                                        setNarrator(e.target.value);
                                        void updateProject({ narratorVoice: e.target.value });
                                    }}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="7-perv3"
                                >
                                    <option value="alloy" data-oid="-xdsib9">
                                        Alloy
                                    </option>
                                    <option value="fable" data-oid="esgmxv_">
                                        Fable
                                    </option>
                                    <option value="nova" data-oid="329eh.o">
                                        Nova
                                    </option>
                                    <option value="onyx" data-oid="h-pmmbf">
                                        Onyx
                                    </option>
                                    <option value="shimmer" data-oid="5ogdaaf">
                                        Shimmer
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div data-oid="narrator-prompt">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Narrator Voice Prompt
                            </label>
                            <textarea
                                value={narratorPrompt}
                                onChange={(e) => setNarratorPrompt(e.target.value)}
                                onBlur={() => updateProject({ narratorVoicePrompt: narratorPrompt })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                                placeholder="e.g., warm, energetic, confident"
                            />
                        </div>

                        <div data-oid="visual-style-prompt">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Visual Style Prompt
                            </label>
                            <textarea
                                value={visualStylePrompt}
                                onChange={(e) => setVisualStylePrompt(e.target.value)}
                                onBlur={() => updateProject({ visualStylePrompt })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                                placeholder="e.g., cinematic lighting, high contrast, 35mm film"
                            />
                        </div>

                        <div className="flex space-x-4" data-oid="7hdd9jq">
                            <div className="flex-1" data-oid="j-b63zj">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="lr03lk5"
                                >
                                    Time Duration
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="6ddbp-g"
                                >
                                    <option value="10s" data-oid=":y2hgvy">
                                        10s
                                    </option>
                                    <option value="15s" data-oid="c2o8zfl">
                                        15s
                                    </option>
                                    <option value="30s" data-oid="y2lmp12">
                                        30s
                                    </option>
                                    <option value="60s" data-oid="wo9.xi7">
                                        60s
                                    </option>
                                </select>
                            </div>

                            <div className="flex-1" data-oid="5pktiqb">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="kw1igaa"
                                >
                                    CTA Style
                                </label>
                                <select
                                    value={ctaStyle}
                                    onChange={(e) => setCtaStyle(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="ok43i03"
                                >
                                    <option value="soft" data-oid="xkckkua">
                                        Soft (learn more)
                                    </option>
                                    <option value="direct" data-oid="h6r78jv">
                                        Direct (buy now)
                                    </option>
                                    <option value="urgent" data-oid="tq4p1xv">
                                        Urgent (limited offer)
                                    </option>
                                    <option value="informational" data-oid="fvo.316">
                                        Informational
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div data-oid="2e4ba0y">
                            <label
                                className="block text-gray-300 text-sm font-medium mb-2"
                                data-oid="s3jr5kh"
                            >
                                Format
                            </label>
                            <div className="flex space-x-4" data-oid="jnbw0ny">
                                <button
                                    onClick={() => setFormat('16:9')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                        format === '16:9'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                                    data-oid=".59ih7v"
                                >
                                    <div
                                        className="w-6 h-4 bg-current rounded-sm opacity-60"
                                        data-oid="esq_xva"
                                    ></div>
                                    <span data-oid="fu-z21w">16:9</span>
                                </button>
                                <button
                                    onClick={() => setFormat('9:16')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                        format === '9:16'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                                    data-oid="3pi1giu"
                                >
                                    <div
                                        className="w-4 h-6 bg-current rounded-sm opacity-60"
                                        data-oid="8g-tdyd"
                                    ></div>
                                    <span data-oid="g4vy:ni">9:16</span>
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateScript}
                            disabled={!projectLoaded || isGeneratingScript}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
                            data-oid="qx5-qx1"
                        >
                            {isGeneratingScript ? 'Generating...' : 'Generate Script'}
                        </button>

                        {error && (
                            <div className="text-red-300 text-sm" data-oid="error">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="flex-1 bg-gray-600/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-500 w-[983px] flex flex-col min-h-0"
                    data-oid="adq0q6s"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-xl font-semibold" data-oid="ik41s-8">
                            Script Timeline
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="text-gray-200">Loading project...</div>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto pr-2" data-oid="timeline-scroll">
                            <div key={animationKey} className="relative" data-oid="uuqdw6e">
                                <div
                                    className={`absolute left-1/2 transform -translate-x-0.5 w-0.5 bg-white/30 top-0 bottom-0 ${shouldAnimate ? 'timeline-reveal' : ''}`}
                                    data-oid="o2sp6h3"
                                ></div>

                                <div className="space-y-6" data-oid="z:ev92q">
                                    {beats.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`relative flex items-start ${shouldAnimate ? 'beat-reveal' : ''}`}
                                            style={
                                                shouldAnimate ? { animationDelay: `${index * 120}ms` } : undefined
                                            }
                                            data-oid="9ofvvzi"
                                        >
                                            <div
                                                className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border-4 border-gray-600 z-10"
                                                data-oid="2ru5:cv"
                                            ></div>

                                        <div className="w-[42%] pr-12" data-oid="_4c6a4t">
                                            <textarea
                                                value={item.scriptSentence ?? ''}
                                                onChange={(e) =>
                                                    updateBeatLocal(item.id, {
                                                        scriptSentence: e.target.value,
                                                    })
                                                }
                                                    onBlur={(e) =>
                                                        void updateBeat(item.id, {
                                                            scriptSentence: e.target.value,
                                                        })
                                                    }
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[96px]"
                                                    rows={3}
                                                    data-oid="b7:ppa4"
                                                />
                                                {item.assets && item.assets.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {item.assets
                                                            .filter((asset) => asset.assetType === 'AUDIO')
                                                            .map((asset) => (
                                                                <audio
                                                                    key={asset.id}
                                                                    controls
                                                                    src={asset.url}
                                                                    className="w-full"
                                                                />
                                                            ))}
                                                    </div>
                                                )}
                                            </div>

                                        <div className="w-[38%] pl-16 ml-auto" data-oid="eb_nnht">
                                            <div
                                                className="bg-gray-700/80 border border-gray-500 rounded-lg p-3 max-w-[280px]"
                                                data-oid="ch93ky."
                                            >
                                                <textarea
                                                    value={item.scenePrompt ?? ''}
                                                    onChange={(e) =>
                                                        updateBeatLocal(item.id, {
                                                            scenePrompt: e.target.value,
                                                        })
                                                    }
                                                    onBlur={(e) =>
                                                        void updateBeat(item.id, {
                                                            scenePrompt: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-transparent text-white text-xs resize-none focus:outline-none mb-2 min-h-[80px]"
                                                    rows={2}
                                                    data-oid="qygv_f3"
                                                />

                                                    <div
                                                        className="flex items-center justify-between"
                                                        data-oid="whb5y5n"
                                                    >
                                                        <div
                                                            className="flex items-center space-x-2"
                                                            data-oid="pm:s-l."
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    updateBeatLocal(item.id, {
                                                                        sceneType: 'IMAGE',
                                                                    });
                                                                    void updateBeat(item.id, {
                                                                        sceneType: 'IMAGE',
                                                                    });
                                                                }}
                                                                className={`p-2 rounded ${item.sceneType === 'IMAGE' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'} transition-colors`}
                                                                data-oid="xala_yd"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                    data-oid="hcx6m:8"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                                        clipRule="evenodd"
                                                                        data-oid="tcta3yx"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    updateBeatLocal(item.id, {
                                                                        sceneType: 'VIDEO',
                                                                    });
                                                                    void updateBeat(item.id, {
                                                                        sceneType: 'VIDEO',
                                                                    });
                                                                }}
                                                                className={`p-2 rounded ${item.sceneType === 'VIDEO' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'} transition-colors`}
                                                                data-oid="kts976j"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                    data-oid="gdb.qwi"
                                                                >
                                                                    <path
                                                                        d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                                                                        data-oid="sg-p0wq"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        <label
                                                            className="flex items-center"
                                                            data-oid="ju:z5n_"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={item.selectedForGeneration}
                                                                onChange={(e) => {
                                                                    updateBeatLocal(item.id, {
                                                                        selectedForGeneration: e.target.checked,
                                                                    });
                                                                    void updateBeat(item.id, {
                                                                        selectedForGeneration: e.target.checked,
                                                                    });
                                                                }}
                                                                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                                                                data-oid="9f.ebmx"
                                                            />

                                                            <span
                                                                className="ml-2 text-sm text-gray-300"
                                                                data-oid="se:a9jt"
                                                            >
                                                                Generate
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {item.assets && item.assets.length > 0 && (
                                                    <div className="mt-3 space-y-2 max-w-[280px]">
                                                        {item.assets
                                                            .filter(
                                                                (asset) =>
                                                                    asset.assetType === 'IMAGE' ||
                                                                    asset.assetType === 'VIDEO',
                                                            )
                                                            .map((asset) => {
                                                                if (asset.assetType === 'IMAGE') {
                                                                    return (
                                                                        <img
                                                                            key={asset.id}
                                                                            src={asset.url}
                                                                            alt="Generated scene"
                                                                            className="w-full rounded transition-transform duration-200 ease-out hover:scale-110 hover:z-10"
                                                                        />
                                                                    );
                                                                }
                                                                if (asset.assetType === 'VIDEO') {
                                                                    return (
                                                                        <video
                                                                            key={asset.id}
                                                                            controls
                                                                            src={asset.url}
                                                                            className="w-full rounded transition-transform duration-200 ease-out hover:scale-110 hover:z-10"
                                                                        />
                                                                    );
                                                                }
                                                                return null;
                                                            })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-6 flex flex-col items-center gap-3" data-oid="9alignl">
                        {isGeneratingAssets && (
                            <div className="progress-track w-48" data-oid="progress-line">
                                <div className="progress-line"></div>
                            </div>
                        )}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleGenerateAssets}
                                disabled={!projectLoaded || isGeneratingAssets}
                                className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105 disabled:opacity-60"
                                data-oid="l:e4:9b"
                            >
                                {isGeneratingAssets ? 'Generating...' : 'Generate Assets'}
                            </button>
                            {projectLoaded && hasAssets && (
                                <a
                                    className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors"
                                    href={`/api/projects/${projectId}/export.zip`}
                                    data-oid="download-zip"
                                >
                                    Download ZIP
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
