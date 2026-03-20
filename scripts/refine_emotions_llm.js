import fs from 'fs';

const API_KEY = 'AIzaSyB9bIAICKNfV5yuAKRXq3joUk1PyEEvLVc';
const MODEL = 'gemini-2.5-flash';
const BATCH_SIZE = 10;
const DELAY_MS = 2000; // 2s between batches
const PROGRESS_FILE = 'scripts/progress.json';

// Load existing emotions from the TS file (parse the JSON array out of it)
const emotionsTsContent = fs.readFileSync('src/data/emotions.ts', 'utf8');
const jsonMatch = emotionsTsContent.match(/export const emotions: EmotionDef\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) {
    console.error('Could not parse emotions.ts');
    process.exit(1);
}
const allEmotions = JSON.parse(jsonMatch[1]);
console.log(`Loaded ${allEmotions.length} emotions from emotions.ts`);

// Load progress if resuming
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
    try {
        progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        console.log(`Resuming — ${Object.keys(progress).length} emotions already enriched`);
    } catch { /* start fresh */ }
}

async function enrichBatch(batch) {
    const prompt = `You are a world-class psychologist. For each emotion below, provide:
1. definition: A nuanced, unique 1-sentence definition
2. example: A realistic "I feel this when..." scenario (1 sentence)
3. bodySignals: 2 physical sensations (array of 2 strings)
4. cognitivePatterns: 2 thought patterns (array of 2 strings)
5. behavioralTendencies: 1 behavioral tendency (array of 1 string)
6. healthyResponses: 2 healthy ways to respond (array of 2 strings)
7. didYouKnow: 1 interesting psychological fact (1 sentence)

Emotions: ${JSON.stringify(batch.map(e => ({ label: e.label, family: e.family })))}

Return ONLY a valid JSON array. Each object must have: label, definition, example, bodySignals, cognitivePatterns, behavioralTendencies, healthyResponses, didYouKnow. Match the exact labels provided.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json'
            }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API error ${response.status}: ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('No content in response');
    }

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(text);
}

function applyDefaults(emotion) {
    return {
        definition: `The experience of feeling ${emotion.label.toLowerCase()}.`,
        example: `Feeling ${emotion.label.toLowerCase()} in a specific moment.`,
        bodySignals: ['Subtle internal shift', 'Changed awareness'],
        cognitivePatterns: ['Reflective thinking', 'Heightened awareness'],
        behavioralTendencies: ['Pausing to observe'],
        healthyResponses: ['Naming the feeling', 'Practicing self-compassion'],
        didYouKnow: 'Naming emotions activates the prefrontal cortex, helping regulate them.'
    };
}

async function run() {
    // Find unenriched emotions
    const toProcess = allEmotions.filter(e => !progress[e.id] && !e.definition);
    console.log(`${toProcess.length} emotions need enrichment`);

    let processed = 0;
    let failed = 0;

    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
        const batch = toProcess.slice(i, i + BATCH_SIZE);

        try {
            const enriched = await enrichBatch(batch);

            if (Array.isArray(enriched)) {
                for (const em of batch) {
                    const match = enriched.find(r => r.label?.toLowerCase() === em.label.toLowerCase());
                    if (match) {
                        progress[em.id] = {
                            definition: match.definition || applyDefaults(em).definition,
                            example: match.example || applyDefaults(em).example,
                            bodySignals: Array.isArray(match.bodySignals) ? match.bodySignals : applyDefaults(em).bodySignals,
                            cognitivePatterns: Array.isArray(match.cognitivePatterns) ? match.cognitivePatterns : applyDefaults(em).cognitivePatterns,
                            behavioralTendencies: Array.isArray(match.behavioralTendencies) ? match.behavioralTendencies : applyDefaults(em).behavioralTendencies,
                            healthyResponses: Array.isArray(match.healthyResponses) ? match.healthyResponses : applyDefaults(em).healthyResponses,
                            didYouKnow: match.didYouKnow || applyDefaults(em).didYouKnow
                        };
                    } else {
                        progress[em.id] = applyDefaults(em);
                    }
                }
            }
        } catch (err) {
            console.error(`  ✗ Batch ${i}-${i + batch.length}: ${err.message}`);
            // Apply defaults for failed batch
            for (const em of batch) {
                if (!progress[em.id]) {
                    progress[em.id] = applyDefaults(em);
                    failed++;
                }
            }
        }

        processed += batch.length;

        // Save progress every batch
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

        const pct = Math.round((processed / toProcess.length) * 100);
        console.log(`  ✓ ${processed}/${toProcess.length} (${pct}%) — ${Object.keys(progress).length} total enriched`);

        if (i + BATCH_SIZE < toProcess.length) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    // Build final output
    const enrichedEmotions = allEmotions.map(em => {
        const enrichment = progress[em.id];
        if (enrichment) {
            return { ...em, ...enrichment };
        }
        return { ...em, ...applyDefaults(em) };
    });

    const output = `import { EmotionDef } from '../types/mood';\n\n// Auto-generated: ${enrichedEmotions.length} emotions with definitions, examples, and body signals\nexport const emotions: EmotionDef[] = ${JSON.stringify(enrichedEmotions, null, 4)};\n`;
    fs.writeFileSync('src/data/emotions.ts', output);

    console.log(`\n✅ Done! ${enrichedEmotions.length} emotions saved to src/data/emotions.ts`);
    console.log(`   ${Object.keys(progress).length - failed} AI-enriched, ${failed} with defaults`);
}

run();
