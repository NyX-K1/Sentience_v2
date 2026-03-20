import { useMemo } from 'react';
import { MoodEntry } from '../types/mood';
import { emotions } from '../data/emotions';

interface VocabularyTrackerProps {
    entries: MoodEntry[];
}

export default function VocabularyTracker({ entries }: VocabularyTrackerProps) {

    // Calculate unique emotions mapped against total taxonomy capacity
    const { totalKnown, uniqueUsed, mostUsedName } = useMemo(() => {
        let total = 0;
        const allIds: string[] = [];

        // Count all possible emotions in our taxonomy
        total = emotions.length;

        // Collect all used emotion IDs across all logs
        entries.forEach(entry => {
            entry.emotions.forEach(e => allIds.push(e.emotionId));
        });

        // Extract uniques
        const uniqueIds = Array.from(new Set(allIds));

        // Find most used
        let maxId = '';
        let maxCount = 0;
        const counts: Record<string, number> = {};
        allIds.forEach(id => {
            counts[id] = (counts[id] || 0) + 1;
            if (counts[id] > maxCount) {
                maxCount = counts[id];
                maxId = id;
            }
        });

        // Lookup human readable name for maxId
        let mostUsed = 'None yet';
        if (maxId) {
            const found = emotions.find(e => e.id === maxId);
            if (found) mostUsed = found.label;
        }

        return {
            totalKnown: total,
            uniqueUsed: uniqueIds.length,
            mostUsedName: mostUsed
        };
    }, [entries]);

    const percentage = Math.round((uniqueUsed / totalKnown) * 100) || 0;

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-light tracking-wide mb-6">Emotional Vocabulary</h3>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/30 rounded-2xl p-4 flex flex-col justify-center border border-white/5">
                    <span className="text-3xl font-light">{uniqueUsed} <span className="text-sm text-white/30">/ {totalKnown}</span></span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 mt-1">Unique states articulated</span>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 flex flex-col justify-center border border-white/5">
                    <span className="text-xl font-light capitalize">{mostUsedName}</span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/50 mt-1">Most frequent state</span>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-white/70">Granularity</span>
                    <span className="text-xs font-mono text-white/50">{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-xs text-white/40 mt-3 leading-relaxed">
                    The ability to specifically articulate granular emotional states (Emotional Granularity) is strongly correlated with improved emotional regulation and resilience.
                </p>
            </div>
        </div>
    );
}
