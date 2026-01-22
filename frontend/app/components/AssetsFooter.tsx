interface AssetsFooterProps {
    projectLoaded: boolean;
    hasAssets: boolean;
    projectId: number | null;
    isGeneratingAssets: boolean;
    onGenerateAssets: () => void;
}

export function AssetsFooter({
    projectLoaded,
    hasAssets,
    projectId,
    isGeneratingAssets,
    onGenerateAssets,
}: AssetsFooterProps) {
    return (
        <div className="mt-auto pt-10 flex flex-col items-center gap-4" data-oid="9alignl">
            <div className="flex items-center gap-4">
                <button
                    onClick={onGenerateAssets}
                    disabled={!projectLoaded || isGeneratingAssets}
                    className="btn-glow py-4 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed relative"
                    data-oid="l:e4:9b"
                >
                    {isGeneratingAssets && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                            <div className="progress-track" data-oid="progress-line">
                                <div className="progress-line"></div>
                            </div>
                        </span>
                    )}
                    {isGeneratingAssets ? 'Generating...' : 'Generate Assets'}
                </button>
                {projectLoaded && hasAssets && projectId && (
                    <a
                        className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full text-sm hover:bg-white/20 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                        href={`/api/projects/${projectId}/export.zip`}
                        data-oid="download-zip"
                    >
                        Download ZIP
                    </a>
                )}
            </div>
        </div>
    );
}
