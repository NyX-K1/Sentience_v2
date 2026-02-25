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

            allEmotionsToFetch.push({
                id,
                label: word,
                family: currentFamily,
                intensity: currentIntensity,
                valence: parseFloat(valence.toFixed(2)),
                arousal: parseFloat(arousal.toFixed(2)),
                _vividFallback: vividFallback, // temp holding
                example: `This state profoundly colors your immediate perception and physical response.`,
                bodySignals: ['Changes in breathing', 'Shift in muscle tension'],
                cognitivePatterns: ['Altered focus'],
                behavioralTendencies: ['Shift in posture'],
                healthyResponses: ['Acknowledge the feeling', 'Breathe deeply', 'Observe without judgment'],
                didYouKnow: `${word} represents a specific ${currentIntensity === 4 ? 'peak' : 'nuanced'} manifestation of ${currentFamily}.`,
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
