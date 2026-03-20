import fs from 'fs';

const content = fs.readFileSync('./src/data/emotions.ts', 'utf8');
const labels = [...content.matchAll(/"label":\s*"([^"]+)"/g)].map(m => m[1]);

const markdown = `# List of Emotions in the Mood Tracker\n\nThere are ${labels.length} emotions tracked. Here is the complete list:\n\n${labels.map(l => '- ' + l).join('\n')}\n`;

fs.writeFileSync('951_emotions_list.md', markdown);
console.log('Successfully wrote ' + labels.length + ' emotions to 951_emotions_list.md');
