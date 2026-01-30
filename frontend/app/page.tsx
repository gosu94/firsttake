'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { NARRATION_PRESETS, VOICE_OPTIONS } from './constants';
import { AssetsFooter } from './components/AssetsFooter';
import { PreviewControls } from './components/PreviewControls';
import { PreviewModal } from './components/PreviewModal';
import { ProjectSidebar } from './components/ProjectSidebar';
import { TimelinePanel } from './components/TimelinePanel';
import type { Beat, NarrationPreset, ProjectDetail, ProjectSummary } from './types';

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
    const [generateNarration, setGenerateNarration] = useState(true);
    const [projectId, setProjectId] = useState<number | null>(null);
    const [projectName, setProjectName] = useState('');
    const [projectStatus, setProjectStatus] = useState<ProjectDetail['status']>('DRAFT');
    const [savedProjects, setSavedProjects] = useState<ProjectSummary[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
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
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const previewTimerRef = useRef<number | null>(null);
    const previewStepMsRef = useRef<number | null>(null);
    const previewIndexRef = useRef(0);
    const previewScrollTimeoutRef = useRef<number | null>(null);
    const [isCreatingBlank, setIsCreatingBlank] = useState(false);
    const beatRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const projectLoaded = useMemo(() => projectId !== null, [projectId]);

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const sessionProject = await fetchJson<ProjectDetail>('/api/session/project');
                applyProjectDetail(sessionProject);
                const projects = await fetchJson<ProjectSummary[]>('/api/projects');
                setSavedProjects(projects);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load project.');
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const applyProjectDetail = (detail: ProjectDetail) => {
        setProjectId(detail.id);
        setProjectName(detail.name ?? '');
        setProjectStatus(detail.status ?? 'DRAFT');
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

    const loadProject = async (id: number) => {
        const detail = await fetchJson<ProjectDetail>(`/api/projects/${id}`);
        applyProjectDetail(detail);
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

    const refreshSavedProjects = async () => {
        const projects = await fetchJson<ProjectSummary[]>('/api/projects');
        setSavedProjects(projects);
    };

    const handleNewProject = async () => {
        setError(null);
        try {
            const detail = await fetchJson<ProjectDetail>('/api/session/project/new', { method: 'POST' });
            applyProjectDetail(detail);
            setSelectedProjectId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project.');
        }
    };

    const handleSaveProject = async () => {
        if (!projectLoaded) {
            return;
        }
        setError(null);
        try {
            const saved = await fetchJson<ProjectSummary>(`/api/projects/${projectId}/save`, {
                method: 'POST',
                body: JSON.stringify({ name: projectName }),
            });
            setProjectName(saved.name ?? projectName);
            setProjectStatus('SAVED');
            await refreshSavedProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save project.');
        }
    };

    const handleRenameProject = async () => {
        if (!projectLoaded) {
            return;
        }
        setError(null);
        try {
            await fetchJson<ProjectSummary>(`/api/projects/${projectId}`, {
                method: 'PUT',
                body: JSON.stringify({ name: projectName }),
            });
            await refreshSavedProjects();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to rename project.');
        }
    };

    const handleDeleteProject = async () => {
        if (!projectLoaded) {
            return;
        }
        setError(null);
        try {
            const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Failed to delete project.');
            }
            await refreshSavedProjects();
            const detail = await fetchJson<ProjectDetail>('/api/session/project/new', { method: 'POST' });
            applyProjectDetail(detail);
            setSelectedProjectId(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project.');
        }
    };

    const handleLoadProject = async () => {
        if (!selectedProjectId) {
            return;
        }
        setError(null);
        try {
            const detail = await fetchJson<ProjectDetail>(`/api/session/project/select/${selectedProjectId}`, {
                method: 'POST',
            });
            applyProjectDetail(detail);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project.');
        }
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
                videoGenerateAudio: updates.videoGenerateAudio,
                videoModel: updates.videoModel,
            }),
        });
    };

    const updateBeatLocal = (beatId: number, updates: Partial<Beat>) => {
        setBeats((items) =>
            items.map((item) => (item.id === beatId ? { ...item, ...updates } : item)),
        );
    };

    const generateScript = async () => {
        if (!projectLoaded) {
            return;
        }
        setIsGeneratingScript(true);
        setError(null);
        try {
            const durationSeconds = Number.parseInt(duration, 10);
            const result = await fetchJson<Beat[]>(`/api/projects/${projectId}/generate-script`, {
                method: 'POST',
                body: JSON.stringify({
                    generalPrompt: prompt,
                    tone,
                    narratorVoice: narrator,
                    narratorVoicePrompt: narratorPrompt,
                    visualStylePrompt,
                    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
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

    const handleGenerateScript = async () => {
        await generateScript();
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
                body: JSON.stringify({ aspectRatio: format, generateNarration }),
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
                        videoGenerateAudio: false,
                        videoModel: 'VEO3_FAST',
                    }),
                });
        await loadProject(activeProjectId);
    };

    const clearPreviewTimer = () => {
        if (previewTimerRef.current) {
            window.clearTimeout(previewTimerRef.current);
            previewTimerRef.current = null;
        }
    };

    const scheduleDefaultPreviewStep = (currentIndex: number) => {
        const stepMs = previewStepMsRef.current ?? 2500;
        previewStepMsRef.current = stepMs;
        const beat = beats[currentIndex];
        const asset = beat?.assets?.find(
            (item) => item.assetType === 'IMAGE' || item.assetType === 'VIDEO',
        );
        previewIndexRef.current = currentIndex + 1;
        if (asset?.assetType !== 'VIDEO') {
            schedulePreviewStep(stepMs);
        }
    };

    const advancePreview = () => {
        setPreviewIndex(previewIndexRef.current);
        previewIndexRef.current += 1;
        if (previewIndexRef.current >= beats.length) {
            clearPreviewTimer();
            setIsPreviewPlaying(false);
            setIsPreviewPaused(false);
        }
    };

    const schedulePreviewStep = (stepMs: number) => {
        clearPreviewTimer();
        previewTimerRef.current = window.setTimeout(() => {
            advancePreview();
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
        setPreviewIndex(0);
    };

    useEffect(() => {
        if (!isPreviewOpen && (isPreviewPlaying || isPreviewPaused)) {
            stopPreview();
        }
    }, [isPreviewOpen, isPreviewPaused, isPreviewPlaying]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPreview();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopPreview();
        };
    }, []);

    const playPreview = () => {
        if (isPreviewPlaying) {
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
            }
            setIsPreviewPlaying(false);
            setIsPreviewPaused(true);
            clearPreviewTimer();
            return;
        }
        if (isPreviewPaused) {
            const audio = audioRef.current;
            if (audio) {
                const stepMs = previewStepMsRef.current;
                if (stepMs) {
                    previewIndexRef.current = Math.min(
                        Math.floor((audio.currentTime * 1000) / stepMs),
                        Math.max(beats.length - 1, 0),
                    );
                    setPreviewIndex(previewIndexRef.current);
                    previewIndexRef.current += 1;
                }
                setIsPreviewPlaying(true);
                setIsPreviewPaused(false);
                void audio.play();
            } else {
                setIsPreviewPlaying(true);
                setIsPreviewPaused(false);
                scheduleDefaultPreviewStep(previewIndex);
            }
            return;
        }
        const narrationAsset = beats
            .flatMap((beat) => beat.assets || [])
            .find((asset) => asset.assetType === 'AUDIO');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPreviewOpen(true);
        if (previewScrollTimeoutRef.current) {
            window.clearTimeout(previewScrollTimeoutRef.current);
        }
        previewScrollTimeoutRef.current = window.setTimeout(() => {
            if (!narrationAsset) {
                previewIndexRef.current = 0;
                setPreviewIndex(0);
                previewStepMsRef.current = 2500;
                setIsPreviewPlaying(true);
                setIsPreviewPaused(false);
                scheduleDefaultPreviewStep(0);
                return;
            }
            const audio = new Audio(narrationAsset.url);
            audioRef.current = audio;
            previewIndexRef.current = 0;
            setPreviewIndex(0);
            setIsPreviewPlaying(true);
            setIsPreviewPaused(false);
            audio.onended = () => {
                setIsPreviewPlaying(false);
                setIsPreviewPaused(false);
                clearPreviewTimer();
            };
            audio.onloadedmetadata = () => {
                const duration = audio.duration || 0;
                const beatCount = beats.length || 1;
                const stepMs = Math.max((duration / beatCount) * 1000, 800);
                previewStepMsRef.current = stepMs;
                previewIndexRef.current = 0;
                setPreviewIndex(0);
                previewIndexRef.current = 1;
                const beat = beats[0];
                const asset = beat?.assets?.find(
                    (item) => item.assetType === 'IMAGE' || item.assetType === 'VIDEO',
                );
                if (asset?.assetType !== 'VIDEO') {
                    schedulePreviewStep(stepMs);
                }
            };
            void audio.play();
        }, 100);
    };

    useEffect(() => {
        if (!isPreviewPlaying) {
            clearPreviewTimer();
            return;
        }
        const stepMs = previewStepMsRef.current;
        if (!stepMs) {
            return;
        }
        const beat = beats[previewIndex];
        const asset = beat?.assets?.find(
            (item) => item.assetType === 'IMAGE' || item.assetType === 'VIDEO',
        );
        if (asset?.assetType === 'VIDEO') {
            clearPreviewTimer();
            return;
        }
        schedulePreviewStep(stepMs);
    }, [beats, isPreviewPlaying, previewIndex]);

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

    const handlePresetChange = (presetId: string) => {
        const preset = NARRATION_PRESETS.find((item) => item.id === presetId) ?? NARRATION_PRESETS[0];
        applyNarrationPreset(preset);
    };

    const setBeatRef = (beatId: number, node: HTMLDivElement | null) => {
        if (node) {
            beatRefs.current.set(beatId, node);
        }
    };

    const createBlankBeats = async () => {
        const activeProjectId = projectId;
        if (!activeProjectId || isCreatingBlank) {
            return;
        }
        setIsCreatingBlank(true);
        setError(null);
        try {
            for (let index = 0; index < 4; index += 1) {
                await fetchJson<Beat>(`/api/projects/${activeProjectId}/beats`, {
                    method: 'POST',
                    body: JSON.stringify({
                        orderIndex: index,
                        scriptSentence: '',
                        scenePrompt: '',
                        sceneType: 'IMAGE',
                        selectedForGeneration: true,
                        videoModel: 'VEO3_FAST',
                    }),
                });
            }
            await loadProject(activeProjectId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create blank beats.');
        } finally {
            setIsCreatingBlank(false);
        }
    };

    const deleteBeatAt = async (beatId: number) => {
        const activeProjectId = projectId;
        if (!activeProjectId) {
            return;
        }
        try {
            const response = await fetch(`/api/beats/${beatId}`, { method: 'DELETE' });
            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Failed to delete beat.');
            }
            await loadProject(activeProjectId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete beat.');
        }
    };

    const shouldAnimate = animationKey > 0;
    const hasAssets = beats.some((beat) => beat.assets && beat.assets.length > 0);
    const showGenerateNarration = beats.some(
        (beat) => beat.scriptSentence && beat.scriptSentence.trim().length > 0,
    );
    const activeBeatId =
        isPreviewPlaying || isPreviewPaused ? beats[previewIndex]?.id ?? null : null;

    return (
        <div className="min-h-screen blueprint-grid relative overflow-hidden" data-oid="sn:jvm8">
            <div
                className="flex min-h-[calc(100vh-80px)] p-4 md:p-6 gap-6 flex-col lg:flex-row animate-fade-in"
                data-oid="_0-3vjy"
            >
                <ProjectSidebar
                    prompt={prompt}
                    tone={tone}
                    narrator={narrator}
                    narrationPresetId={narrationPresetId}
                    visualStylePrompt={visualStylePrompt}
                    format={format}
                    duration={duration}
                    ctaStyle={ctaStyle}
                    isVoiceOpen={isVoiceOpen}
                    isGeneratingScript={isGeneratingScript}
                    canGenerateScript={projectLoaded}
                    error={error}
                    narrationPresets={NARRATION_PRESETS}
                    selectedNarrationPreset={selectedNarrationPreset}
                    voiceOptions={VOICE_OPTIONS}
                    onPromptChange={setPrompt}
                    onPromptBlur={() => updateProject({ generalPrompt: prompt })}
                    onToneChange={(value) => {
                        setTone(value);
                        void updateProject({ tone: value });
                    }}
                    onToggleVoiceOpen={() => setIsVoiceOpen((prev) => !prev)}
                    onSelectVoice={(voiceId) => {
                        setNarrator(voiceId);
                        setIsVoiceOpen(false);
                        void updateProject({ narratorVoice: voiceId });
                    }}
                    onPlayVoiceSample={playVoiceSample}
                    onPresetChange={handlePresetChange}
                    onDurationChange={setDuration}
                    onCtaStyleChange={setCtaStyle}
                    onVisualStyleChange={setVisualStylePrompt}
                    onVisualStyleBlur={() => updateProject({ visualStylePrompt })}
                    onFormatChange={setFormat}
                    onGenerateScript={handleGenerateScript}
                />
                <TimelinePanel
                    projectName={projectName}
                    projectStatus={projectStatus ?? 'DRAFT'}
                    savedProjects={savedProjects}
                    selectedProjectId={selectedProjectId}
                    beats={beats}
                    isLoading={isLoading}
                    projectLoaded={projectLoaded}
                    isCreatingBlank={isCreatingBlank}
                    shouldAnimate={shouldAnimate}
                    animationKey={animationKey}
                    showGenerateNarration={showGenerateNarration}
                    generateNarration={generateNarration}
                    activeBeatId={activeBeatId}
                    onGenerateNarrationChange={setGenerateNarration}
                    onCreateBlank={createBlankBeats}
                    onInsertBeatAt={insertBeatAt}
                    onDeleteBeatAt={deleteBeatAt}
                    onUpdateBeatLocal={updateBeatLocal}
                    onUpdateBeat={updateBeat}
                    setBeatRef={setBeatRef}
                    onProjectNameChange={setProjectName}
                    onSelectProjectId={setSelectedProjectId}
                    onNewProject={() => void handleNewProject()}
                    onSaveProject={() => void handleSaveProject()}
                    onRenameProject={() => void handleRenameProject()}
                    onDeleteProject={() => void handleDeleteProject()}
                    onLoadProject={() => void handleLoadProject()}
                    footer={(
                        <AssetsFooter
                            projectLoaded={projectLoaded}
                            hasAssets={hasAssets}
                            projectId={projectId}
                            isGeneratingAssets={isGeneratingAssets}
                            onGenerateAssets={handleGenerateAssets}
                        />
                    )}
                />
            </div>

            <PreviewControls
                hasAssets={hasAssets}
                isPreviewPlaying={isPreviewPlaying}
                isPreviewPaused={isPreviewPaused}
                onPlayPreview={playPreview}
            />
            <PreviewModal
                isOpen={isPreviewOpen}
                beats={beats}
                previewIndex={previewIndex}
                format={format}
                isPreviewPlaying={isPreviewPlaying}
                isPreviewPaused={isPreviewPaused}
                onPlayPreview={playPreview}
                onClose={() => {
                    stopPreview();
                    setIsPreviewOpen(false);
                }}
                onAdvancePreview={advancePreview}
            />

        </div>
    );
}
