import type { ReactNode } from 'react';
import type { Beat } from '../types';
import { BeatRow } from './BeatRow';

interface TimelinePanelProps {
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
}

export function TimelinePanel({
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
}: TimelinePanelProps) {
    return (
        <div
            className="flex-1 glass-timeline p-6 md:p-8 w-full flex flex-col min-h-0 min-w-0 animate-slide-in-up"
            style={{ animationDelay: '0.2s' }}
            data-oid="adq0q6s"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold tracking-tight" data-oid="ik41s-8">
                    Script Timeline
                </h2>
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
