import type { Beat } from '../types';

interface BeatRowProps {
    beat: Beat;
    index: number;
    shouldAnimate: boolean;
    onInsertBeatAt: (orderIndex: number) => void;
    onDeleteBeatAt: (beatId: number) => void;
    onUpdateBeatLocal: (beatId: number, updates: Partial<Beat>) => void;
    onUpdateBeat: (beatId: number, updates: Partial<Beat>) => void;
    setBeatRef: (beatId: number, node: HTMLDivElement | null) => void;
}

export function BeatRow({
    beat,
    index,
    shouldAnimate,
    onInsertBeatAt,
    onDeleteBeatAt,
    onUpdateBeatLocal,
    onUpdateBeat,
    setBeatRef,
}: BeatRowProps) {
    return (
        <div
            ref={(node) => setBeatRef(beat.id, node)}
            className={`relative flex w-full flex-col lg:flex-row items-start ${shouldAnimate ? 'beat-reveal' : 'animate-fade-in'}`}
            style={
                shouldAnimate ? { animationDelay: `${index * 120}ms` } : { animationDelay: `${index * 50}ms` }
            }
            data-oid="9ofvvzi"
        >
            <button
                type="button"
                onClick={() => onInsertBeatAt(beat.orderIndex)}
                className="absolute left-1/2 -top-8 transform -translate-x-1/2 w-5 h-5 rounded-full bg-transparent text-white/70 text-xs font-semibold border border-white/30 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200 z-20 flex items-center justify-center backdrop-blur-sm"
                aria-label="Add beat above"
            >
                +
            </button>
            <div
                className="absolute left-1/2 top-[60px] -translate-x-1/2 z-10 group"
                data-oid="2ru5:cv"
            >
                <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full border-4 border-black/50 shadow-lg shadow-purple-500/50 animate-pulse-glow"></div>
                <button
                    type="button"
                    onClick={() => onDeleteBeatAt(beat.id)}
                    className="absolute left-full top-1/2 ml-3 -translate-y-1/2 w-5 h-5 rounded-full bg-black/50 text-white/80 text-xs font-semibold border border-white/30 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-white hover:border-white/50 hover:bg-white/10 z-20 flex items-center justify-center backdrop-blur-sm"
                    aria-label="Delete beat"
                >
                    −
                </button>
            </div>

            <div className="w-full lg:w-[42%] lg:pr-12" data-oid="_4c6a4t">
                <textarea
                    value={beat.scriptSentence ?? ''}
                    onChange={(e) =>
                        onUpdateBeatLocal(beat.id, {
                            scriptSentence: e.target.value,
                        })
                    }
                    onBlur={(e) =>
                        void onUpdateBeat(beat.id, {
                            scriptSentence: e.target.value,
                        })
                    }
                    className="comic-bubble w-full bg-white px-4 py-3 text-gray-900 text-base resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[120px] transition-all duration-300"
                    rows={4}
                    data-oid="b7:ppa4"
                />
                {beat.assets && beat.assets.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {beat.assets
                            .filter((asset) => asset.assetType === 'AUDIO')
                            .map((asset) => (
                                <audio key={asset.id} controls src={asset.url} className="w-full" />
                            ))}
                    </div>
                )}
            </div>

            <div className="w-full lg:w-[44%] lg:pl-16 lg:ml-auto mt-4 lg:mt-0" data-oid="eb_nnht">
                <div className="flex items-center gap-3">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={beat.selectedForGeneration}
                            onChange={(e) => {
                                onUpdateBeatLocal(beat.id, {
                                    selectedForGeneration: e.target.checked,
                                });
                                void onUpdateBeat(beat.id, {
                                    selectedForGeneration: e.target.checked,
                                });
                            }}
                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all duration-200 checked:bg-gradient-to-br checked:from-purple-600 checked:to-indigo-600"
                            data-oid="9f.ebmx"
                        />
                    </label>
                    <div className="beat-card w-full max-w-full lg:max-w-[520px]" data-oid="ch93ky.">
                        <textarea
                            value={beat.scenePrompt ?? ''}
                            onChange={(e) =>
                                onUpdateBeatLocal(beat.id, {
                                    scenePrompt: e.target.value,
                                })
                            }
                            onBlur={(e) =>
                                void onUpdateBeat(beat.id, {
                                    scenePrompt: e.target.value,
                                })
                            }
                            className="w-full bg-transparent text-white text-xs resize-none focus:outline-none mb-2 min-h-[90px] placeholder-gray-500"
                            rows={3}
                            placeholder="Scene description..."
                            data-oid="qygv_f3"
                        />

                        <div className="flex items-center justify-between" data-oid="whb5y5n">
                            <div className="flex items-center space-x-2" data-oid="pm:s-l.">
                                <button
                                    onClick={() => {
                                        onUpdateBeatLocal(beat.id, {
                                            sceneType: 'IMAGE',
                                        });
                                        void onUpdateBeat(beat.id, {
                                            sceneType: 'IMAGE',
                                        });
                                    }}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        beat.sceneType === 'IMAGE'
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
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
                                        onUpdateBeatLocal(beat.id, {
                                            sceneType: 'VIDEO',
                                        });
                                        void onUpdateBeat(beat.id, {
                                            sceneType: 'VIDEO',
                                        });
                                    }}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        beat.sceneType === 'VIDEO'
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                    }`}
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

                            <div className="flex items-center gap-4">
                                {beat.sceneType === 'VIDEO' && (
                                    <label className="flex items-center text-xs text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={beat.videoGenerateAudio}
                                            onChange={(e) => {
                                                onUpdateBeatLocal(beat.id, {
                                                    videoGenerateAudio: e.target.checked,
                                                });
                                                void onUpdateBeat(beat.id, {
                                                    videoGenerateAudio: e.target.checked,
                                                });
                                            }}
                                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all duration-200 checked:bg-gradient-to-br checked:from-purple-600 checked:to-indigo-600"
                                        />
                                        <span className="ml-2">Sound</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {beat.assets && beat.assets.length > 0 && (
                    <div className="mt-3 space-y-2 max-w-full lg:max-w-[320px]">
                        {beat.assets
                            .filter((asset) => asset.assetType === 'IMAGE' || asset.assetType === 'VIDEO')
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
    );
}
