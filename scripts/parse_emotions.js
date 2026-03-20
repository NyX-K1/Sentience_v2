import fs from 'fs';

const rawInput = fs.readFileSync('scripts/emotions_raw.txt', 'utf8');

const FAMILY_COLORS = {
    'Joy': '#FDE047',
    'Trust': '#14B8A6',
    'Fear': '#9333EA',
    'Surprise': '#0EA5E9',
    'Sadness': '#2563EB',
    'Disgust': '#65A30D',
    'Anger': '#E11D48',
    'Anticipation': '#EA580C',
    'Complex': '#A1A1AA'
};

const QUADRANTS = {
    'Joy': 'energized', 'Trust': 'calm',
    'Fear': 'tense', 'Surprise': 'energized',
    'Sadness': 'low', 'Disgust': 'tense',
    'Anger': 'tense', 'Anticipation': 'energized',
    'Complex': 'calm'
};

const FAMILY_DEF = {
    'Joy': ['radiant warmth', 'uplifting energy', 'positive expansion', 'bright lightness'],
    'Trust': ['deep safety', 'peaceful connection', 'grounding reliable presence', 'open vulnerability'],
    'Fear': ['sharp alert', 'nervous tension', 'primal survival instinct', 'chilling uncertainty'],
    'Surprise': ['sudden jolt', 'unexpected shift', 'startling interruption', 'curious bewilderment'],
    'Sadness': ['heavy sinking', 'aching hollow', 'quiet withdrawal', 'tearful release'],
    'Disgust': ['visceral rejection', 'sharp repulsion', 'bitter distaste', 'protective turning away'],
    'Anger': ['fiery heat', 'sharp edge of defense', 'simmering frustration', 'explosive boundary'],
    'Anticipation': ['forward-leaning energy', 'restless waiting', 'eager focus', 'tense expectation'],
    'Complex': ['layered depth', 'nuanced contradiction', 'intricate overlapping feeling', 'deep human complication']
};

const INTENSITY_ADJ = {
    4: ['an overwhelming', 'an all-consuming', 'a peak', 'an intense'],
    3: ['a strong', 'a powerful', 'a deeply felt', 'a significant'],
    2: ['a moderate', 'a steady', 'a clear', 'an undeniable'],
    1: ['a mild', 'a gentle', 'a subtle', 'a quiet']
};

async function fetchMeaning(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!response.ok) return null;
        const data = await response.json();
        // Return the very first definition string found
        return data[0]?.meanings[0]?.definitions[0]?.definition || null;
    } catch (e) {
        return null; // Silent catch, we will fallback
    }
}

async function run() {
    let currentFamily = '';
    let currentIntensity = 0;
    const results = [];

    let allEmotionsToFetch = [];

    const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
        if (Object.keys(FAMILY_COLORS).includes(line)) {
            currentFamily = line;
            continue;
        }

        const intentMatch = line.match(/^Intensity (\d)/);
        if (intentMatch) {
            currentIntensity = parseInt(intentMatch[1], 10);
            continue;
        }

        const words = line.split(',').map(w => w.trim()).filter(w => w.length > 0);

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            let id = currentFamily.toLowerCase().substring(0, 4) + '-' + word.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            let valence = 0;
            let arousal = 0;

            if (currentFamily === 'Joy') { valence = 0.8; arousal = currentIntensity * 0.2; }
            else if (currentFamily === 'Trust') { valence = 0.6; arousal = -0.2; }
            else if (currentFamily === 'Fear') { valence = -0.7; arousal = currentIntensity * 0.2; }
            else if (currentFamily === 'Surprise') { valence = 0.2; arousal = 0.6; }
            else if (currentFamily === 'Sadness') { valence = -0.8; arousal = -0.5; }
            else if (currentFamily === 'Disgust') { valence = -0.6; arousal = 0.3; }
            else if (currentFamily === 'Anger') { valence = -0.8; arousal = currentIntensity * 0.2; }
            else if (currentFamily === 'Anticipation') { valence = 0.3; arousal = 0.7; }
            else if (currentFamily === 'Complex') { valence = -0.1; arousal = 0.1; }

            const adj = parseInt(currentIntensity) ? (INTENSITY_ADJ[currentIntensity] ? INTENSITY_ADJ[currentIntensity][i % 4] : 'a distinct') : 'a distinct';
            const noun = FAMILY_DEF[currentFamily] ? FAMILY_DEF[currentFamily][i % 4] : 'emotional state';
            const vividFallback = `Experience ${adj} sense of ${word.toLowerCase()}, characterized by a feeling of ${noun} within the ${currentFamily} spectrum.`;

            // Procedural generation to ensure extreme uniqueness across 951 objects
            const BODY_SIGNALS = [
                "Changes in breathing rate", "Shift in muscle tension", "Fluttering in the stomach",
                "Tightness in the chest", "Warmth spreading through the body", "A sudden chill",
                "Clenching of the jaw", "Dilated pupils", "Increased heart rate",
                "Tingling in the extremities", "A feeling of lightness", "Heaviness in the limbs",
                "Tears forming", "Dry mouth", "Sweating palms", "Restlessness in the legs"
            ];
            const COG_PATTERNS = [
                "Altered focus and attention", "Racing, disjointed thoughts", "Hyper-fixation on a single detail",
                "A narrowing of perspective", "Broad, expansive thinking", "Intrusive memories",
                "Difficulty concentrating", "A sense of mental clarity", "Ruminating on past events",
                "Projecting into the future", "A feeling of unreality", "Heightened sensory awareness"
            ];
            const BEHAVIORAL = [
                "Shift in posture or stance", "Urge to pace or move", "Desire to withdraw or hide",
                "Impulse to speak rapidly", "Tendency to go quiet", "Seeking out physical comfort",
                "Avoiding eye contact", "Intense, unbroken staring", "Fidgeting with hands",
                "Sudden burst of energy", "Lethargic movements"
            ];
            const HEALTHY = [
                "Acknowledge the feeling", "Breathe deeply", "Observe without judgment",
                "Journal about the experience", "Take a brief walk", "Speak to a trusted friend",
                "Engage in grounding exercises", "Allow the emotion space to exist", "Practice self-compassion",
                "Sip cold water", "Stretch tense muscles"
            ];
            const EXAMPLES = [
                "This state profoundly colors your immediate perception and physical response.",
                "Often triggered by a shift in expectations or an interaction with someone important.",
                "Can wash over you suddenly during moments of quiet reflection.",
                "Typically arises when a deeply held value is either honored or violated.",
                "Might be experienced when recalling a vivid memory from the past.",
                "Often sneaks up when you are transitioning between major tasks.",
                "A common reaction to absorbing the emotional energy of a crowded room."
            ];
            const COMPLEX_SUBFAMILIES = [
                "Existential", "Social", "Self-Conscious", "Aesthetic", "Nostalgic", "Relational", "Internalized"
            ];

            // Use pseudo-random deterministic seeding based on the word length and index
            const seed1 = (word.length + i) % BODY_SIGNALS.length;
            const seed2 = (word.charCodeAt(0) + i) % COG_PATTERNS.length;
            const seed3 = (word.charCodeAt(word.length - 1) + i) % BEHAVIORAL.length;
            const seed4 = (i * 3) % HEALTHY.length;
            const seed5 = (word.length * i) % EXAMPLES.length;
            const seed6 = (i * 7) % COMPLEX_SUBFAMILIES.length;

            let finalFamily = currentFamily;
            if (currentFamily === 'Complex') {
                finalFamily = COMPLEX_SUBFAMILIES[seed6];
            }

            allEmotionsToFetch.push({
                id,
                label: word,
                family: finalFamily,
                intensity: currentIntensity,
                valence: parseFloat(valence.toFixed(2)),
                arousal: parseFloat(arousal.toFixed(2)),
                _vividFallback: vividFallback,
                example: EXAMPLES[seed5],
                bodySignals: [BODY_SIGNALS[seed1], BODY_SIGNALS[(seed1 + 5) % BODY_SIGNALS.length]],
                cognitivePatterns: [COG_PATTERNS[seed2], COG_PATTERNS[(seed2 + 3) % COG_PATTERNS.length]],
                behavioralTendencies: [BEHAVIORAL[seed3]],
                healthyResponses: [HEALTHY[seed4], HEALTHY[(seed4 + 2) % HEALTHY.length]],
                didYouKnow: `${word} represents a specific ${currentIntensity === 4 ? 'peak' : 'nuanced'} manifestation of ${finalFamily}.`,
                colorHex: FAMILY_COLORS[currentFamily] || '#fff',
                quadrant: QUADRANTS[currentFamily] || 'calm'
            });
        }
    }

    // Process in batches of 50 concurrent requests
    const BATCH_SIZE = 50;
    for (let i = 0; i < allEmotionsToFetch.length; i += BATCH_SIZE) {
        const batch = allEmotionsToFetch.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (em) => {
            let meaning = await fetchMeaning(em.label);
            em.definition = meaning ? meaning + " " + em._vividFallback : em._vividFallback;
            delete em._vividFallback;
            results.push(em);
        }));

        console.log(`Processed ${Math.min(i + BATCH_SIZE, allEmotionsToFetch.length)} / ${allEmotionsToFetch.length} words...`);

        // Small delay between batches to respect rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('Finished. Fetched dict meanings for:', results.length);

    const outputString = `import { EmotionDef } from '../types/mood';\n\n// Auto-generated from dictionary API expansion script\nexport const emotions: EmotionDef[] = ${JSON.stringify(results, null, 4)};\n`;

    fs.writeFileSync('src/data/emotions.ts', outputString);
    console.log('Saved src/data/emotions.ts');
}

run();
