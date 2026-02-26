// scripts/generate_gemini_emotions.js
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// You will need to provide your API key in the environment
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("ERROR: GEMINI_API_KEY environment variable is required.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

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
    'Complex': '#A1A1AA' // Will be sub-categorized by Gemini
};

const QUADRANTS = {
    'Joy': 'energized', 'Trust': 'calm',
    'Fear': 'tense', 'Surprise': 'energized',
    'Sadness': 'low', 'Disgust': 'tense',
    'Anger': 'tense', 'Anticipation': 'energized',
    'Complex': 'calm'
};

async function generateEmotionDetailsBatched(batch) {
    // We send a batch of emotions to Gemini to reduce API calls
    const prompt = `
    You are an expert psychological lexicographer. I am giving you a JSON array of emotions.
    For EACH emotion, you must return a strictly formatted JSON array of objects with enhanced, unique, and deeply specific psychological data.
    
    If the family is "Complex", you MUST assign it a MORE SPECIFIC sub-family string (e.g., "Existential", "Social", "Self-Conscious", "Nostalgic", "Aesthetic"). Do not use "Complex". If the family is NOT Complex, leave the family as is.

    Input Batch:
    ${JSON.stringify(batch)}

    Expected JSON Output Array Format (Return matching objects for every single input):
    [
      {
        "id": "original-id",
        "family": "The original family, UNLESS it was Complex, in which case put a specific sub-category string here",
        "definition": "A highly specific, vivid, 1-2 sentence psychological definition.",
        "example": "A highly relatable, specific real-world example of when someone feels this.",
        "bodySignals": ["1-3 words specific physical sensation (e.g., 'Flushed cheeks')", "Another signal"],
        "cognitivePatterns": ["1-3 words specific thought pattern (e.g., 'Racing future-focus')"],
        "behavioralTendencies": ["1-3 words specific action urge (e.g., 'Urge to hide')"],
        "healthyResponses": ["1-3 words healthy coping exactly 3 items"],
        "didYouKnow": "One fascinating psychological or etymological fact about this specific emotion."
      }
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (e) {
        console.error("Gemini API Error for batch:", e);
        return null; // Return null so we can cleanly handle failures
    }
}

async function run() {
    let currentFamily = '';
    let currentIntensity = 0;
    const allEmotions = [];

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

            allEmotions.push({
                id,
                label: word,
                family: currentFamily,
                intensity: currentIntensity,
                valence: parseFloat(valence.toFixed(2)),
                arousal: parseFloat(arousal.toFixed(2)),
                colorHex: FAMILY_COLORS[currentFamily] || '#A1A1AA', // Default Complex to gray, will override later if needed
                quadrant: QUADRANTS[currentFamily] || 'calm'
            });
        }
    }

    console.log(`Starting generation for ${allEmotions.length} emotions using Gemini API...`);

    const finalResults = [];
    const BATCH_SIZE = 15; // Gemini can handle JSON arrays, keep batch size small enough to not hit output token limits (8k)

    for (let i = 0; i < allEmotions.length; i += BATCH_SIZE) {
        const batch = allEmotions.slice(i, i + BATCH_SIZE);

        // Prepare simplified batch for prompt payload to save input tokens
        const promptBatch = batch.map(e => ({ id: e.id, label: e.label, family: e.family, intensity: e.intensity }));

        console.log(`Processing batch ${i} to ${i + BATCH_SIZE}...`);

        let success = false;
        let attempts = 0;

        while (!success && attempts < 3) {
            const enrichedData = await generateEmotionDetailsBatched(promptBatch);

            if (enrichedData && Array.isArray(enrichedData) && enrichedData.length === batch.length) {
                // Merge data
                for (let j = 0; j < batch.length; j++) {
                    const original = batch[j];
                    const enriched = enrichedData.find(e => e.id === original.id) || enrichedData[j]; // Fallback to index if AI messed up ID mapping

                    finalResults.push({
                        ...original,
                        family: enriched.family || original.family, // captures the sub-family for complex
                        definition: enriched.definition || `Feeling ${original.label}.`,
                        example: enriched.example || `An instance of ${original.label}.`,
                        bodySignals: Array.isArray(enriched.bodySignals) ? enriched.bodySignals : [],
                        cognitivePatterns: Array.isArray(enriched.cognitivePatterns) ? enriched.cognitivePatterns : [],
                        behavioralTendencies: Array.isArray(enriched.behavioralTendencies) ? enriched.behavioralTendencies : [],
                        healthyResponses: Array.isArray(enriched.healthyResponses) ? enriched.healthyResponses : ['Acknowledge the feeling'],
                        didYouKnow: enriched.didYouKnow || `${original.label} belongs to the ${enriched.family || original.family} spectrum.`
                    });
                }
                success = true;
            } else {
                attempts++;
                console.log(`Batch ${i} failed JSON scheme match. Retrying attempt ${attempts}...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (!success) {
            console.error(`CRITICAL: Batch ${i} completely failed. Pushing raw defaults.`);
            batch.forEach(original => finalResults.push({
                ...original,
                definition: `Feeling ${original.label}.`,
                example: `An instance of ${original.label}.`,
                bodySignals: [], cognitivePatterns: [], behavioralTendencies: [], healthyResponses: [],
                didYouKnow: `${original.label} belongs to the ${original.family} spectrum.`
            }));
        }

        // Small delay to respect RPM limits on free tier API (15 RPM usually, so 4 seconds per batch is safe)
        await new Promise(r => setTimeout(r, 4500));
    }

    console.log('Finished. Successfully generated unique payloads for:', finalResults.length);

    const outputString = `import { EmotionDef } from '../types/mood';\n\n// Auto-generated strictly by Gemini 1.5 Flash API Expansion\nexport const emotions: EmotionDef[] = ${JSON.stringify(finalResults, null, 4)};\n`;

    fs.writeFileSync('src/data/emotions.ts', outputString);
    console.log('Saved src/data/emotions.ts');
}

run();
