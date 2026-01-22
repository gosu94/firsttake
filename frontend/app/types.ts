export type Asset = {
    id: number;
    assetType: 'AUDIO' | 'IMAGE' | 'VIDEO';
    url: string;
    provider?: string;
    mimeType?: string;
    durationSeconds?: number;
    createdAt?: string;
};

export type Beat = {
    id: number;
    orderIndex: number;
    scriptSentence: string;
    scenePrompt: string;
    sceneType: 'IMAGE' | 'VIDEO';
    selectedForGeneration: boolean;
    videoGenerateAudio: boolean;
    assets: Asset[];
};

export type ProjectSummary = {
    id: number;
    name: string;
    generalPrompt?: string;
    tone?: string;
    narratorVoice?: string;
    narratorVoicePrompt?: string;
    visualStylePrompt?: string;
};

export type ProjectDetail = {
    id: number;
    name: string;
    generalPrompt?: string;
    tone?: string;
    narratorVoice?: string;
    narratorVoicePrompt?: string;
    visualStylePrompt?: string;
    beats: Beat[];
};

export type NarrationPreset = {
    id: string;
    label: string;
    description: string;
    ttsPrompt: string;
};

export type VoiceOption = {
    id: string;
    label: string;
};
