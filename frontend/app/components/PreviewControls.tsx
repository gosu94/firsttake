interface PreviewControlsProps {
    hasAssets: boolean;
    isPreviewPlaying: boolean;
    isPreviewPaused: boolean;
    onPlayPreview: () => void;
}

export function PreviewControls({
    hasAssets,
    isPreviewPlaying,
    isPreviewPaused,
    onPlayPreview,
}: PreviewControlsProps) {
    if (!hasAssets) {
        return null;
    }
    return (
        <div
            className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 animate-slide-in-up"
            data-oid="preview-controls"
        >
            <button
                type="button"
                onClick={onPlayPreview}
                className="text-white text-sm uppercase tracking-wide border border-white/30 px-8 py-3 rounded-full bg-black/60 backdrop-blur-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 shadow-2xl hover:scale-105"
            >
                {isPreviewPlaying ? 'Pause' : isPreviewPaused ? 'Resume' : 'Play Preview'}
            </button>
        </div>
    );
}
