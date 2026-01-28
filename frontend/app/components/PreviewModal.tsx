import type { Beat } from '../types';

interface PreviewModalProps {
    isOpen: boolean;
    beats: Beat[];
    previewIndex: number;
    format: string;
    isPreviewPlaying: boolean;
    isPreviewPaused: boolean;
    onPlayPreview: () => void;
    onClose: () => void;
    onAdvancePreview: () => void;
}

export function PreviewModal({
    isOpen,
    beats,
    previewIndex,
    format,
    isPreviewPlaying,
    isPreviewPaused,
    onPlayPreview,
    onClose,
    onAdvancePreview,
}: PreviewModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-[90vw] max-w-4xl rounded-2xl border border-white/10 bg-black/80 p-6 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 h-9 w-9 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40"
                    aria-label="Close preview"
                >
                    ×
                </button>
                <div className="mb-4 flex items-center justify-between text-sm text-white/60">
                    <div>
                        Beat {previewIndex + 1} of {beats.length}
                    </div>
                </div>
                <div
                    className="mx-auto flex items-center justify-center rounded-xl bg-black overflow-hidden"
                    style={
                        format === '9:16'
                            ? { aspectRatio: '9 / 16', maxHeight: '65vh', maxWidth: '45vw' }
                            : { aspectRatio: '16 / 9', maxHeight: '60vh', maxWidth: '100%' }
                    }
                >
                    {(() => {
                        const beat = beats[previewIndex];
                        const asset = beat?.assets?.find(
                            (item) => item.assetType === 'IMAGE' || item.assetType === 'VIDEO',
                        );
                        if (!asset) {
                            return <div className="text-white/70">No asset</div>;
                        }
                        if (asset.assetType === 'VIDEO') {
                            return (
                                <video
                                    key={asset.id}
                                    src={asset.url}
                                    className="max-h-full max-w-full rounded-lg"
                                    autoPlay
                                    muted
                                    playsInline
                                    preload="metadata"
                                    onEnded={() => {
                                        if (isPreviewPlaying) {
                                            onAdvancePreview();
                                        }
                                    }}
                                />
                            );
                        }
                        return (
                            <img
                                key={`preview-image-${asset.id}-${previewIndex}`}
                                src={asset.url}
                                alt="Generated scene"
                                decoding="async"
                                className={`max-h-full max-w-full rounded-lg ${
                                    isPreviewPlaying ? 'preview-zoom' : ''
                                }`}
                            />
                        );
                    })()}
                </div>
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={onPlayPreview}
                        className="rounded-full border border-white/30 px-6 py-2 text-xs uppercase tracking-wide text-white/80 hover:text-white hover:border-white/60"
                    >
                        {isPreviewPlaying ? 'Pause' : isPreviewPaused ? 'Resume' : 'Play'}
                    </button>
                </div>
            </div>
        </div>
    );
}
