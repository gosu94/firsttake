import type { ReactNode } from 'react';
import type { Beat, ProjectSummary } from '../types';
import { BeatRow } from './BeatRow';

interface TimelinePanelProps {
    projectName: string;
    projectStatus?: 'DRAFT' | 'SAVED' | 'ARCHIVED';
    savedProjects: ProjectSummary[];
    selectedProjectId: number | null;
    beats: Beat[];
    isLoading: boolean;
    projectLoaded: boolean;
    isCreatingBlank: boolean;
    shouldAnimate: boolean;
    animationKey: number;
    showGenerateNarration: boolean;
    generateNarration: boolean;
    onGenerateNarrationChange: (value: boolean) => void;
    activeBeatId: number | null;
    footer?: ReactNode;
    onCreateBlank: () => void;
    onInsertBeatAt: (orderIndex: number) => void;
    onDeleteBeatAt: (beatId: number) => void;
    onUpdateBeatLocal: (beatId: number, updates: Partial<Beat>) => void;
    onUpdateBeat: (beatId: number, updates: Partial<Beat>) => void;
    setBeatRef: (beatId: number, node: HTMLDivElement | null) => void;
    onProjectNameChange: (value: string) => void;
    onSelectProjectId: (value: number | null) => void;
    onNewProject: () => void;
    onSaveProject: () => void;
    onRenameProject: () => void;
    onDeleteProject: () => void;
    onLoadProject: () => void;
}

export function TimelinePanel({
    projectName,
    projectStatus,
    savedProjects,
    selectedProjectId,
    beats,
    isLoading,
    projectLoaded,
    isCreatingBlank,
    shouldAnimate,
    animationKey,
    showGenerateNarration,
    generateNarration,
    onGenerateNarrationChange,
    activeBeatId,
    footer,
    onCreateBlank,
    onInsertBeatAt,
    onDeleteBeatAt,
    onUpdateBeatLocal,
    onUpdateBeat,
    setBeatRef,
    onProjectNameChange,
    onSelectProjectId,
    onNewProject,
    onSaveProject,
    onRenameProject,
    onDeleteProject,
    onLoadProject,
}: TimelinePanelProps) {
    return (
        <div
            className="flex-1 glass-timeline p-6 md:p-8 w-full flex flex-col min-h-0 min-w-0 animate-slide-in-up"
            style={{ animationDelay: '0.2s' }}
            data-oid="adq0q6s"
        >
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-white text-2xl font-bold tracking-tight" data-oid="ik41s-8">
                        Script Timeline
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onNewProject}
                            title="New draft"
                            className="h-9 w-9 rounded-full border border-white/10 text-gray-200 hover:bg-white/10 flex items-center justify-center"
                        >
                            +
                        </button>
                        <button
                            type="button"
                            onClick={onSaveProject}
                            title="Save project"
                            className="h-9 w-9 rounded-full border border-white/10 text-gray-200 hover:bg-white/10 flex items-center justify-center"
                        >
                            ⭳
                        </button>
                        <button
                            type="button"
                            onClick={onRenameProject}
                            title="Rename project"
                            className="h-9 w-9 rounded-full border border-white/10 text-gray-200 hover:bg-white/10 flex items-center justify-center"
                        >
                            ✎
                        </button>
                        <button
                            type="button"
                            onClick={onDeleteProject}
                            title="Delete project"
                            className="h-9 w-9 rounded-full border border-rose-400/50 text-rose-200 hover:bg-rose-500/20 flex items-center justify-center"
                        >
                            🗑
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <input
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                            className="input-glossy min-w-[220px]"
                            placeholder="Untitled project"
                        />
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                            {projectStatus ?? 'DRAFT'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="select-glossy min-w-[220px]"
                            value={selectedProjectId ?? ''}
                            onChange={(e) =>
                                onSelectProjectId(e.target.value ? Number(e.target.value) : null)
                            }
                        >
                            <option value="">Select saved project</option>
                            {savedProjects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={onLoadProject}
                            title="Load selected project"
                            className="h-9 w-9 rounded-full border border-white/10 text-gray-200 hover:bg-white/10 flex items-center justify-center"
                        >
                            ↻
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-200">Loading project...</div>
            ) : beats.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-4 text-gray-200">
                    <div>No script yet.</div>
                    <button
                        type="button"
                        onClick={onCreateBlank}
                        disabled={!projectLoaded || isCreatingBlank}
                        className="px-5 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors disabled:opacity-60"
                    >
                        {isCreatingBlank ? 'Creating...' : 'Create Blank'}
                    </button>
                </div>
            ) : (
                <div className="flex-1 pr-2" data-oid="timeline-scroll">
                    <div key={animationKey} className="relative" data-oid="uuqdw6e">
                        <div
                            className={`absolute left-1/2 transform -translate-x-0.5 w-0.5 bg-gradient-to-b from-purple-500/50 via-indigo-500/50 to-purple-500/50 top-0 bottom-0 ${
                                shouldAnimate ? 'timeline-reveal' : ''
                            }`}
                            data-oid="o2sp6h3"
                        ></div>

                        <div className="space-y-6 pb-10" data-oid="z:ev92q">
                            {showGenerateNarration && (
                                <div className="flex justify-start">
                                    <label className="flex items-center gap-2 text-xs text-gray-300 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm">
                                        <input
                                            type="checkbox"
                                            checked={generateNarration}
                                            onChange={(e) => onGenerateNarrationChange(e.target.checked)}
                                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all duration-200 checked:bg-gradient-to-br checked:from-purple-600 checked:to-indigo-600"
                                        />
                                        <span>Generate narration</span>
                                    </label>
                                </div>
                            )}
                            {beats.map((beat, index) => (
                                <BeatRow
                                    key={beat.id}
                                    beat={beat}
                                    index={index}
                                    isActive={activeBeatId === beat.id}
                                    shouldAnimate={shouldAnimate}
                                    onInsertBeatAt={onInsertBeatAt}
                                    onDeleteBeatAt={onDeleteBeatAt}
                                    onUpdateBeatLocal={onUpdateBeatLocal}
                                    onUpdateBeat={onUpdateBeat}
                                    setBeatRef={setBeatRef}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {footer}
        </div>
    );
}
