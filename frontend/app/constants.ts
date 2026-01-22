import type { NarrationPreset, VoiceOption } from './types';

export const NARRATION_PRESETS: NarrationPreset[] = [
    {
        id: 'blockbuster_trailer',
        label: 'Blockbuster Trailer',
        description: 'Epic, cinematic narration with dramatic weight and authority.',
        ttsPrompt:
            'Deep male cinematic trailer voice. Slow, commanding delivery with long dramatic pauses. Low pitch, rich resonance, and controlled power. Slight breath before key lines. Calm intensity that escalates into epic authority. Every word feels heavy and consequential, like a summer blockbuster trailer.',
    },
    {
        id: 'energetic_social_ad',
        label: 'Energetic Social Ad',
        description: 'Fast, upbeat delivery designed to grab attention instantly.',
        ttsPrompt:
            'Bright, energetic commercial voice. Fast-paced, upbeat delivery with lively rhythm and sharp emphasis. Short pauses, quick transitions, and playful energy. Sound excited, confident, and immediately engaging, like a high-performing TikTok or Instagram ad.',
    },
    {
        id: 'professional_commercial',
        label: 'Professional Commercial',
        description: 'Polished, confident, and brand-safe narration.',
        ttsPrompt:
            'Confident professional commercial voice. Medium pacing with clean articulation and controlled emphasis. Calm authority, smooth delivery, and steady rhythm. Sound trustworthy, modern, and polished, like a national brand commercial.',
    },
    {
        id: 'calm_explainer',
        label: 'Calm Explainer',
        description: 'Clear, neutral narration for tutorials and explanations.',
        ttsPrompt:
            'Clear, calm explainer voice. Neutral tone with steady, even pacing. Gentle pauses between ideas, minimal emotional variation. Sound informative, reassuring, and easy to follow, like a high-quality product walkthrough.',
    },
    {
        id: 'friendly_conversational',
        label: 'Friendly Conversational',
        description: 'Warm, natural, and approachable delivery.',
        ttsPrompt:
            'Warm, friendly conversational voice. Natural pacing with slight pauses and relaxed phrasing. Light emphasis and subtle emotional variation. Sound human, approachable, and engaging, like speaking directly to a friend.',
    },
    {
        id: 'inspirational_motivational',
        label: 'Inspirational / Motivational',
        description: 'Uplifting, confident voice that inspires action.',
        ttsPrompt:
            'Confident inspirational voice. Steady pacing that gradually builds in energy. Clear emphasis on action words, emotional lift in key moments, and a strong, encouraging finish. Sound empowering, optimistic, and motivating.',
    },
    {
        id: 'urgent_limited_time',
        label: 'Urgent / Limited Time',
        description: 'Persuasive delivery with a strong sense of urgency.',
        ttsPrompt:
            'Urgent promotional voice. Faster pacing with tight pauses and strong emphasis. Controlled intensity that creates pressure without panic. Sound persuasive, decisive, and time-sensitive, like a limited-time offer announcement.',
    },
];

export const VOICE_OPTIONS: VoiceOption[] = [
    { id: 'alloy', label: 'Alloy' },
    { id: 'ash', label: 'Ash' },
    { id: 'ballad', label: 'Ballad' },
    { id: 'cedar', label: 'Cedar' },
    { id: 'coral', label: 'Coral' },
    { id: 'echo', label: 'Echo' },
    { id: 'fable', label: 'Fable' },
    { id: 'marin', label: 'Marin' },
    { id: 'nova', label: 'Nova' },
    { id: 'onyx', label: 'Onyx' },
    { id: 'sage', label: 'Sage' },
    { id: 'shimmer', label: 'Shimmer' },
    { id: 'verse', label: 'Verse' },
];
