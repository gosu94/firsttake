import type { NarrationPreset, VoiceOption } from '../types';

interface ProjectSidebarProps {
    prompt: string;
    tone: string;
    narrator: string;
    narrationPresetId: string;
    visualStylePrompt: string;
    format: string;
    duration: string;
    ctaStyle: string;
    isVoiceOpen: boolean;
    isGeneratingScript: boolean;
    canGenerateScript: boolean;
    error: string | null;
    narrationPresets: NarrationPreset[];
    selectedNarrationPreset: NarrationPreset;
    voiceOptions: VoiceOption[];
    onPromptChange: (value: string) => void;
    onPromptBlur: () => void;
    showGenerateNarration: boolean;
    generateNarration: boolean;
    onGenerateNarrationChange: (value: boolean) => void;
    onToneChange: (value: string) => void;
    onToggleVoiceOpen: () => void;
    onSelectVoice: (voiceId: string) => void;
    onPlayVoiceSample: (voiceId: string) => void;
    onPresetChange: (presetId: string) => void;
    onDurationChange: (value: string) => void;
    onCtaStyleChange: (value: string) => void;
    onVisualStyleChange: (value: string) => void;
    onVisualStyleBlur: () => void;
    onFormatChange: (value: string) => void;
    onGenerateScript: () => void;
}

export function ProjectSidebar({
    prompt,
    tone,
    narrator,
    narrationPresetId,
    visualStylePrompt,
    format,
    duration,
    ctaStyle,
    isVoiceOpen,
    isGeneratingScript,
    canGenerateScript,
    error,
    narrationPresets,
    selectedNarrationPreset,
    voiceOptions,
    onPromptChange,
    onPromptBlur,
    showGenerateNarration,
    generateNarration,
    onGenerateNarrationChange,
    onToneChange,
    onToggleVoiceOpen,
    onSelectVoice,
    onPlayVoiceSample,
    onPresetChange,
    onDurationChange,
    onCtaStyleChange,
    onVisualStyleChange,
    onVisualStyleBlur,
    onFormatChange,
    onGenerateScript,
}: ProjectSidebarProps) {
    return (
        <div
            className="w-full lg:w-1/3 glass-sidebar p-6 min-w-0 animate-slide-in-up"
            style={{ animationDelay: '0.1s' }}
            data-oid="5_ab5.k"
        >
            <h2 className="text-white text-2xl font-bold mb-6 tracking-tight" data-oid="inwpe9-">
                Script Generator
            </h2>

            <div className="space-y-6" data-oid="v:51w37">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-semibold">Narration</h3>
                    </div>
                    <div data-oid="v4inihj">
                        {showGenerateNarration && (
                            <label className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                                <input
                                    type="checkbox"
                                    checked={generateNarration}
                                    onChange={(e) => onGenerateNarrationChange(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer transition-all duration-200 checked:bg-gradient-to-br checked:from-purple-600 checked:to-indigo-600"
                                />
                                <span>Generate narration</span>
                            </label>
                        )}
                        <label
                            className="block text-gray-200 text-sm font-medium mb-2"
                            data-oid="6u43poq"
                        >
                            General Prompt
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            onBlur={onPromptBlur}
                            className="textarea-glossy"
                            rows={4}
                            placeholder="Describe your ad concept (use any language you want)..."
                            data-oid="t4hqnd2"
                        />
                    </div>

                    <div className="flex space-x-4" data-oid="httpjw3">
                        <div className="flex-1" data-oid="zakf9wn">
                            <label
                                className="block text-gray-200 text-sm font-medium mb-2"
                                data-oid="0dtg.sx"
                            >
                                Tone
                            </label>
                            <select
                                value={tone}
                                onChange={(e) => onToneChange(e.target.value)}
                                className="select-glossy"
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
                                className="block text-gray-200 text-sm font-medium mb-2"
                                data-oid="p2xfd.5"
                            >
                                Narrator Voice
                            </label>
                            <div className="relative" data-oid="7-perv3">
                                <button
                                    type="button"
                                    onClick={onToggleVoiceOpen}
                                    className="select-glossy flex items-center justify-between w-full"
                                >
                                    <span>
                                        {voiceOptions.find((voice) => voice.id === narrator)?.label ??
                                            'Select voice'}
                                    </span>
                                    <span className="text-gray-400">{isVoiceOpen ? '▲' : '▼'}</span>
                                </button>
                                {isVoiceOpen && (
                                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                                        {voiceOptions.map((voice) => (
                                            <div
                                                key={voice.id}
                                                className={`flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-200 ${
                                                    narrator === voice.id
                                                        ? 'bg-gradient-to-r from-purple-600/60 to-indigo-600/60 text-white'
                                                        : 'text-gray-200 hover:bg-white/10'
                                                }`}
                                            >
                                                <button
                                                    className="flex-1 text-left"
                                                    onClick={() => onSelectVoice(voice.id)}
                                                >
                                                    {voice.label}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onPlayVoiceSample(voice.id)}
                                                    className="ml-3 h-8 w-8 rounded-full border border-white/20 text-gray-200 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/20 transition-all duration-200 flex items-center justify-center backdrop-blur-sm"
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
                        <label className="block text-gray-200 text-sm font-medium mb-2">
                            Narration Style
                        </label>
                        <div className="flex items-center gap-3">
                            <select
                                value={narrationPresetId}
                                onChange={(e) => onPresetChange(e.target.value)}
                                className="select-glossy flex-1"
                            >
                                {narrationPresets.map((preset) => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            <div className="relative group">
                                <button
                                    type="button"
                                    aria-label={`About ${selectedNarrationPreset.label}`}
                                    className="h-9 w-9 rounded-full border border-white/20 text-sm text-gray-200 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/20 transition-all duration-200 backdrop-blur-sm flex items-center justify-center"
                                >
                                    i
                                </button>
                                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl p-3 text-xs text-gray-200 opacity-0 shadow-2xl transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                                    {selectedNarrationPreset.description}
                                </div>
                            </div>
                        </div>
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
                                onChange={(e) => onDurationChange(e.target.value)}
                                className="select-glossy"
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
                                <option value="45s" data-oid="y2lmp12">
                                    45s
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
                                onChange={(e) => onCtaStyleChange(e.target.value)}
                                className="select-glossy"
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
                </div>

                <div className="space-y-4 border-t border-gray-700/60 pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-semibold">Visuals</h3>
                    </div>
                    <div data-oid="visual-style-prompt">
                        <label className="block text-gray-200 text-sm font-medium mb-2">
                            Visual Style Prompt
                        </label>
                        <textarea
                            value={visualStylePrompt}
                            onChange={(e) => onVisualStyleChange(e.target.value)}
                            onBlur={onVisualStyleBlur}
                            className="textarea-glossy"
                            rows={2}
                            placeholder="e.g., cinematic lighting, high contrast, 35mm film"
                        />
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
                                onClick={() => onFormatChange('16:9')}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                                    format === '16:9'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/50 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
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
                                onClick={() => onFormatChange('9:16')}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                                    format === '9:16'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500/50 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
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
                </div>

                <button
                    onClick={onGenerateScript}
                    disabled={!canGenerateScript || isGeneratingScript}
                    className="btn-glow w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    );
}
