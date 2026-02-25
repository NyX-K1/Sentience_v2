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

let currentFamily = '';
let currentIntensity = 0;
const results = [];

rawInput.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    if (Object.keys(FAMILY_COLORS).includes(line)) {
        currentFamily = line;
        return;
    }

    const intentMatch = line.match(/^Intensity (\d)/);
    if (intentMatch) {
        currentIntensity = parseInt(intentMatch[1], 10);
        return;
    }

    // Process comma separated emotions
    const words = line.split(',').map(w => w.trim()).filter(w => w.length > 0);
    words.forEach(word => {
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

        results.push({
            id,
            label: word,
            family: currentFamily,
            intensity: currentIntensity,
            valence: parseFloat(valence.toFixed(2)),
            arousal: parseFloat(arousal.toFixed(2)),
            definition: `Feeling ${word.toLowerCase()}.`,
            example: `An instance of feeling ${word.toLowerCase()}.`,
            bodySignals: [],
            cognitivePatterns: [],
            behavioralTendencies: [],
            healthyResponses: ['Acknowledge the feeling'],
            didYouKnow: `${word} belongs to the ${currentFamily} family.`,
            colorHex: FAMILY_COLORS[currentFamily] || '#fff',
            quadrant: QUADRANTS[currentFamily] || 'calm'
        });
    });
});

console.log('Parsed emotions:', results.length);

const outputString = `import { EmotionDef } from '../types/mood';

// Auto-generated from taxonomy expansion script
export const emotions: EmotionDef[] = ${JSON.stringify(results, null, 4)};
`;

fs.writeFileSync('src/data/emotions.ts', outputString);
