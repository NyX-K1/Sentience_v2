import { EmotionDef } from '../types/mood';

// Example populated list (subset of the full 150 for this immediate task, will expand)
export const emotions: EmotionDef[] = [
    {
        id: "joy-ecstatic",
        label: "Ecstatic",
        family: "Joy",
        intensity: 4,
        valence: 0.9,
        arousal: 0.9,
        definition: "An overwhelming feeling of great happiness or joyful excitement.",
        example: "Achieving a lifelong dream or receiving incredible news.",
        bodySignals: ["Racing heart", "Lightness in chest", "Smiling widely"],
        cognitivePatterns: ["Optimistic thoughts", "Fast-paced thinking"],
        behavioralTendencies: ["Jumping", "Laughing", "Hugging"],
        healthyResponses: ["Share the joy", "Channel energy creatively"],
        didYouKnow: "Ecstasy often dilates pupils and increases heart rate, mimicking a mild adrenaline rush.",
        colorHex: "#FACC15",
        quadrant: "energized"
    },
    {
        id: "fear-anxious",
        label: "Anxious",
        family: "Fear",
        intensity: 2,
        valence: -0.6,
        arousal: 0.7,
        definition: "Experiencing worry, unease, or nervousness, typically about an imminent event or something with an uncertain outcome.",
        example: "Waiting for important test results or preparing for a big presentation.",
        bodySignals: ["Shallow breathing", "Muscle tension", "Butterflies in stomach"],
        cognitivePatterns: ["Catastrophizing", "Racing thoughts", "Fixating on worst-case scenarios"],
        behavioralTendencies: ["Pacing", "Fidgeting", "Avoidance"],
        healthyResponses: ["Box breathing", "Grounding exercises (5-4-3-2-1)"],
        didYouKnow: "Anxiety is an evolutionary mechanism designed to keep us alert to potential threats.",
        colorHex: "#A855F7",
        quadrant: "tense"
    },
    {
        id: "sadness-melancholic",
        label: "Melancholic",
        family: "Sadness",
        intensity: 2,
        valence: -0.5,
        arousal: -0.4,
        definition: "A gentle, pensive, and sometimes lingering sadness without any obvious cause.",
        example: "Looking out the window on a rainy day, reflecting on the past.",
        bodySignals: ["Slowed heart rate", "Heavy feeling in limbs", "Slight drooping of posture"],
        cognitivePatterns: ["Introspective", "Nostalgic", "Reflective"],
        behavioralTendencies: ["Seeking solitude", "Listening to slow music", "Quiet contemplation"],
        healthyResponses: ["Journaling", "Creative expression", "Allowing the feeling without judgment"],
        didYouKnow: "In ancient times, 'melancholia' was blamed on an excess of 'black bile', one of the four bodily humors.",
        colorHex: "#3B82F6",
        quadrant: "low"
    },
    {
        id: "trust-serene",
        label: "Serene",
        family: "Trust", // Classifying serenity under trust/calm here for quadrant mapping
        intensity: 1,
        valence: 0.7,
        arousal: -0.6,
        definition: "Calm, peaceful, and untroubled; tranquil.",
        example: "Sitting quietly in nature after a long, productive week.",
        bodySignals: ["Slow, deep breathing", "Relaxed muscles", "Lowered heart rate"],
        cognitivePatterns: ["Clear mind", "Present moment awareness", "Lack of worry"],
        behavioralTendencies: ["Stillness", "Gentle smiling", "Closing eyes"],
        healthyResponses: ["Meditation", "Enjoying the present moment", "Gentle stretching"],
        didYouKnow: "Serenity is associated with increased parasympathetic nervous system activity.",
        colorHex: "#2DD4BF",
        quadrant: "calm"
    }
    // ... we will populate the rest of the 150+ emotions as the data layer matures
];
