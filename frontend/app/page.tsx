'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

type NarrationPreset = {
    id: string;
    label: string;
    description: string;
    ttsPrompt: string;
};

const NARRATION_PRESETS: NarrationPreset[] = [
    {
        "id": "blockbuster_trailer",
        "label": "Blockbuster Trailer",
        "description": "Epic, cinematic narration with dramatic weight and authority.",
        "ttsPrompt": "Deep male cinematic trailer voice. Slow, commanding delivery with long dramatic pauses. Low pitch, rich resonance, and controlled power. Slight breath before key lines. Calm intensity that escalates into epic authority. Every word feels heavy and consequential, like a summer blockbuster trailer."
    },
    {
        "id": "energetic_social_ad",
        "label": "Energetic Social Ad",
        "description": "Fast, upbeat delivery designed to grab attention instantly.",
        "ttsPrompt": "Bright, energetic commercial voice. Fast-paced, upbeat delivery with lively rhythm and sharp emphasis. Short pauses, quick transitions, and playful energy. Sound excited, confident, and immediately engaging, like a high-performing TikTok or Instagram ad."
    },
    {
        "id": "professional_commercial",
        "label": "Professional Commercial",
        "description": "Polished, confident, and brand-safe narration.",
        "ttsPrompt": "Confident professional commercial voice. Medium pacing with clean articulation and controlled emphasis. Calm authority, smooth delivery, and steady rhythm. Sound trustworthy, modern, and polished, like a national brand commercial."
    },
    {
        "id": "calm_explainer",
        "label": "Calm Explainer",
        "description": "Clear, neutral narration for tutorials and explanations.",
        "ttsPrompt": "Clear, calm explainer voice. Neutral tone with steady, even pacing. Gentle pauses between ideas, minimal emotional variation. Sound informative, reassuring, and easy to follow, like a high-quality product walkthrough."
    },
    {
        "id": "friendly_conversational",
        "label": "Friendly Conversational",
        "description": "Warm, natural, and approachable delivery.",
        "ttsPrompt": "Warm, friendly conversational voice. Natural pacing with slight pauses and relaxed phrasing. Light emphasis and subtle emotional variation. Sound human, approachable, and engaging, like speaking directly to a friend."
    },
    {
        "id": "inspirational_motivational",
        "label": "Inspirational / Motivational",
        "description": "Uplifting, confident voice that inspires action.",
        "ttsPrompt": "Confident inspirational voice. Steady pacing that gradually builds in energy. Clear emphasis on action words, emotional lift in key moments, and a strong, encouraging finish. Sound empowering, optimistic, and motivating."
    },
    {
        "id": "urgent_limited_time",
        "label": "Urgent / Limited Time",
        "description": "Persuasive delivery with a strong sense of urgency.",
        "ttsPrompt": "Urgent promotional voice. Faster pacing with tight pauses and strong emphasis. Controlled intensity that creates pressure without panic. Sound persuasive, decisive, and time-sensitive, like a limited-time offer announcement."
    }
]

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
    const [narratorPrompt, setNarratorPrompt] = useState(NARRATION_PRESETS[0].ttsPrompt);
    const [narrationPresetId, setNarrationPresetId] = useState(NARRATION_PRESETS[0].id);
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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [isPreviewPaused, setIsPreviewPaused] = useState(false);
    const previewTimerRef = useRef<number | null>(null);
    const previewStepMsRef = useRef<number | null>(null);
    const previewIndexRef = useRef(0);
    const previewScrollTimeoutRef = useRef<number | null>(null);
    const beatRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const voiceOptions = [
        { id: 'alloy', label: 'Alloy' },
        { id: 'fable', label: 'Fable' },
        { id: 'nova', label: 'Nova' },
        { id: 'onyx', label: 'Onyx' },
        { id: 'shimmer', label: 'Shimmer' },
    ];

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
        const matchedPreset = detail.narratorVoicePrompt
            ? NARRATION_PRESETS.find((preset) => preset.ttsPrompt === detail.narratorVoicePrompt)
            : undefined;
        const selectedPreset = matchedPreset ?? NARRATION_PRESETS[0];
        setNarrationPresetId(selectedPreset.id);
        setNarratorPrompt(selectedPreset.ttsPrompt);
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

    const insertBeatAt = async (targetOrderIndex: number) => {
        const activeProjectId = projectId;
        if (activeProjectId === null) {
            return;
        }
        const sorted = [...beats].sort((a, b) => a.orderIndex - b.orderIndex);
        const updates = sorted
            .filter((beat) => beat.orderIndex >= targetOrderIndex)
            .map((beat) => ({ id: beat.id, orderIndex: beat.orderIndex + 1 }));
        setBeats((prev) =>
            prev.map((beat) => {
                const match = updates.find((item) => item.id === beat.id);
                return match ? { ...beat, orderIndex: match.orderIndex } : beat;
            }),
        );
        await Promise.all(
            updates.map((item) =>
                updateBeat(item.id, {
                    orderIndex: item.orderIndex,
                }),
            ),
        );
        await fetchJson<Beat>(`/api/projects/${activeProjectId}/beats`, {
            method: 'POST',
            body: JSON.stringify({
                orderIndex: targetOrderIndex,
                scriptSentence: '',
                scenePrompt: '',
                sceneType: 'IMAGE',
                selectedForGeneration: true,
            }),
        });
        await loadProject(activeProjectId);
    };

    const scrollToBeatIndex = (index: number) => {
        const beat = beats[index];
        if (!beat) {
            return;
        }
        const node = beatRefs.current.get(beat.id);
        if (!node) {
            return;
        }
        window.requestAnimationFrame(() => {
            node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    };

    const clearPreviewTimer = () => {
        if (previewTimerRef.current) {
            window.clearInterval(previewTimerRef.current);
            previewTimerRef.current = null;
        }
    };

    const startPreviewTimer = (stepMs: number) => {
        clearPreviewTimer();
        previewTimerRef.current = window.setInterval(() => {
            scrollToBeatIndex(previewIndexRef.current);
            previewIndexRef.current += 1;
            if (previewIndexRef.current >= beats.length) {
                clearPreviewTimer();
            }
        }, stepMs);
    };

    const stopPreview = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        clearPreviewTimer();
        if (previewScrollTimeoutRef.current) {
            window.clearTimeout(previewScrollTimeoutRef.current);
            previewScrollTimeoutRef.current = null;
        }
        previewIndexRef.current = 0;
        previewStepMsRef.current = null;
        setIsPreviewPlaying(false);
        setIsPreviewPaused(false);
    };

    const playPreview = () => {
        if (isPreviewPlaying) {
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                setIsPreviewPlaying(false);
                setIsPreviewPaused(true);
                clearPreviewTimer();
            }
            return;
        }
        if (isPreviewPaused) {
            const audio = audioRef.current;
            if (!audio) {
                setIsPreviewPaused(false);
                return;
            }
            const stepMs = previewStepMsRef.current;
            if (stepMs) {
                previewIndexRef.current = Math.min(
                    Math.floor((audio.currentTime * 1000) / stepMs),
                    Math.max(beats.length - 1, 0),
                );
                scrollToBeatIndex(previewIndexRef.current);
                previewIndexRef.current += 1;
                startPreviewTimer(stepMs);
            }
            setIsPreviewPlaying(true);
            setIsPreviewPaused(false);
            void audio.play();
            return;
        }
        const narrationAsset = beats
            .flatMap((beat) => beat.assets || [])
            .find((asset) => asset.assetType === 'AUDIO');
        if (!narrationAsset) {
            return;
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (previewScrollTimeoutRef.current) {
            window.clearTimeout(previewScrollTimeoutRef.current);
        }
        previewScrollTimeoutRef.current = window.setTimeout(() => {
            const audio = new Audio(narrationAsset.url);
            audioRef.current = audio;
            previewIndexRef.current = 0;
            setIsPreviewPlaying(true);
            setIsPreviewPaused(false);
            audio.onended = () => {
                stopPreview();
            };
            audio.onloadedmetadata = () => {
                const duration = audio.duration || 0;
                const beatCount = beats.length || 1;
                const stepMs = Math.max((duration / beatCount) * 1000, 800);
                previewStepMsRef.current = stepMs;
                previewIndexRef.current = 0;
                scrollToBeatIndex(0);
                previewIndexRef.current = 1;
                startPreviewTimer(stepMs);
            };
            void audio.play();
        }, 300);
    };

    const playVoiceSample = (voiceId: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        const audio = new Audio(`/voices/${voiceId}.mp3`);
        audioRef.current = audio;
        void audio.play();
    };

    const applyNarrationPreset = (preset: NarrationPreset) => {
        setNarrationPresetId(preset.id);
        setNarratorPrompt(preset.ttsPrompt);
        void updateProject({ narratorVoicePrompt: preset.ttsPrompt });
    };

    const selectedNarrationPreset =
        NARRATION_PRESETS.find((preset) => preset.id === narrationPresetId) ?? NARRATION_PRESETS[0];

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

            <div
                className="flex min-h-[calc(100vh-80px)] p-4 md:p-6 gap-6 flex-col lg:flex-row"
                data-oid="_0-3vjy"
            >
                <div
                    className="w-full lg:w-1/3 bg-black/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 min-w-0"
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
                                <div className="relative" data-oid="7-perv3">
                                    <button
                                        type="button"
                                        onClick={() => setIsVoiceOpen((prev) => !prev)}
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                                    >
                                        <span>
                                            {voiceOptions.find((voice) => voice.id === narrator)?.label ??
                                                'Select voice'}
                                        </span>
                                        <span className="text-gray-400">{isVoiceOpen ? '▲' : '▼'}</span>
                                    </button>
                                    {isVoiceOpen && (
                                        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
                                            {voiceOptions.map((voice) => (
                                                <div
                                                    key={voice.id}
                                                    className={`flex items-center justify-between px-3 py-2 text-sm ${
                                                        narrator === voice.id
                                                            ? 'bg-blue-700/60 text-white'
                                                            : 'text-gray-200 hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <button
                                                        className="flex-1 text-left"
                                                        onClick={() => {
                                                            setNarrator(voice.id);
                                                            setIsVoiceOpen(false);
                                                            void updateProject({ narratorVoice: voice.id });
                                                        }}
                                                    >
                                                        {voice.label}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => playVoiceSample(voice.id)}
                                                        className="ml-3 h-8 w-8 rounded-full border border-gray-500 text-gray-200 hover:text-white hover:border-gray-300 transition-colors"
                                                        aria-label={`Play ${voice.label} sample`}
                                                    >
                                                        ▶
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div data-oid="narrator-prompt">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Narration Style
                            </label>
                            <div className="flex items-center gap-3">
                                <select
                                    value={narrationPresetId}
                                    onChange={(e) => {
                                        const preset =
                                            NARRATION_PRESETS.find((item) => item.id === e.target.value) ??
                                            NARRATION_PRESETS[0];
                                        applyNarrationPreset(preset);
                                    }}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {NARRATION_PRESETS.map((preset) => (
                                        <option key={preset.id} value={preset.id}>
                                            {preset.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="relative group">
                                    <button
                                        type="button"
                                        aria-label={`About ${selectedNarrationPreset.label}`}
                                        className="h-9 w-9 rounded-full border border-gray-500 text-sm text-gray-200 hover:text-white hover:border-gray-300"
                                    >
                                        i
                                    </button>
                                    <div className="absolute right-0 z-20 mt-2 w-64 rounded-md border border-gray-700 bg-gray-900 p-3 text-xs text-gray-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                        {selectedNarrationPreset.description}
                                    </div>
                                </div>
                            </div>
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
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
                            data-oid="qx5-qx1"
                        >
                            {isGeneratingScript && (
                                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                            )}
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
                    className="flex-1 bg-gray-600/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-500 w-full flex flex-col min-h-0 min-w-0"
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
                        <div className="flex-1 pr-2" data-oid="timeline-scroll">
                            <div key={animationKey} className="relative" data-oid="uuqdw6e">
                                <div
                                    className={`absolute left-1/2 transform -translate-x-0.5 w-0.5 bg-white/30 top-0 bottom-0 ${shouldAnimate ? 'timeline-reveal' : ''}`}
                                    data-oid="o2sp6h3"
                                ></div>

                                <div className="space-y-6" data-oid="z:ev92q">
                                    {beats.map((item, index) => (
                                        <div
                                            key={item.id}
                                            ref={(node) => {
                                                if (node) {
                                                    beatRefs.current.set(item.id, node);
                                                }
                                            }}
                                            className={`relative flex flex-col lg:flex-row items-start ${shouldAnimate ? 'beat-reveal' : ''}`}
                                            style={
                                                shouldAnimate ? { animationDelay: `${index * 120}ms` } : undefined
                                            }
                                            data-oid="9ofvvzi"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => insertBeatAt(item.orderIndex)}
                                                className="timeline-plus -top-5"
                                                aria-label="Add beat above"
                                            >
                                                +
                                            </button>
                                            <div
                                                className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border-4 border-gray-600 z-10"
                                                data-oid="2ru5:cv"
                                            ></div>
                                            <button
                                                type="button"
                                                onClick={() => insertBeatAt(item.orderIndex + 1)}
                                                className="timeline-plus top-full mt-2"
                                                aria-label="Add beat below"
                                            >
                                                +
                                            </button>

                                        <div className="w-full lg:w-[42%] lg:pr-12" data-oid="_4c6a4t">
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
                                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] script-float"
                                                rows={4}
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

                                        <div className="w-full lg:w-[38%] lg:pl-20 lg:ml-auto mt-4 lg:mt-0" data-oid="eb_nnht">
                                            <div
                                                className="bg-gray-700/80 border border-gray-500 rounded-lg p-3 max-w-full lg:max-w-[220px]"
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
                                                    className="w-full bg-transparent text-white text-xs resize-none focus:outline-none mb-2 min-h-[110px]"
                                                    rows={3}
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
                                                    <div className="mt-3 space-y-2 max-w-full lg:max-w-[220px]">
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
                                                                            className="w-full rounded media-hover"
                                                                        />
                                                                    );
                                                                }
                                                                if (asset.assetType === 'VIDEO') {
                                                                    return (
                                                                        <video
                                                                            key={asset.id}
                                                                            controls
                                                                            src={asset.url}
                                                                            className="w-full rounded media-hover"
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

                    <div className="mt-auto pt-10 flex flex-col items-center gap-4" data-oid="9alignl">
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
            {hasAssets && (
                <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2" data-oid="preview-controls">
                    <button
                        type="button"
                        onClick={playPreview}
                        className="text-white text-sm uppercase tracking-wide border border-white/40 px-6 py-2 rounded-full bg-black/70 backdrop-blur-md hover:bg-white/10 transition-colors"
                    >
                        {isPreviewPlaying ? 'Pause' : isPreviewPaused ? 'Resume' : 'Play Preview'}
                    </button>
                </div>
            )}
        </div>
    );
}
