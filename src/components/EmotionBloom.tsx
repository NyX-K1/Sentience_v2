import { motion } from 'framer-motion';
import { EmotionFamily, EmotionDef } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';
import { useState } from 'react';
import EmotionTooltip from './EmotionTooltip';
import { FAMILY_COLORS } from './EmotionWheel';

interface EmotionBloomProps {
    family: EmotionFamily | null;
    selectedEmotionIds: string[];
    onToggleEmotion: (id: string) => void;
    onBack: () => void;
    onProceed: () => void;
}

export default function EmotionBloom({ family, selectedEmotionIds, onToggleEmotion, onBack, onProceed }: EmotionBloomProps) {
    const [hoveredEmotion, setHoveredEmotion] = useState<EmotionDef | null>(null);

    if (!family) return null;

    // Filter taxonomy by family or just dump all if 'Complex'
    // Right now we only have a tiny subset in emotions.ts, so we filter safely
    const relevantEmotions = allEmotions.filter(e => e.family === family || (family === 'Complex' && e.family === 'Complex'));

    // Sort by intensity descending (center out)
    const sorted = [...relevantEmotions].sort((a, b) => b.intensity - a.intensity);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center justify-start pt-12 min-h-[70vh] relative"
        >
            {/* Ambient Family Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${FAMILY_COLORS[family]} rounded-full mix-blend-screen opacity-20 blur-[100px] pointer-events-none transition-all duration-1000`} />

            <button onClick={onBack} className="absolute top-0 left-4 md:left-8 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Families
            </button>

            <h2 className="text-2xl md:text-3xl font-light mb-8 tracking-wide text-center">
                Can you pinpoint it?
                <span className="block text-sm text-zinc-500 mt-2">Select one or more describing how you feel. Tap & hold for details.</span>
            </h2>

            <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl px-4 perspective-1000">
                {sorted.map((em, i) => {
                    const isSelected = selectedEmotionIds.includes(em.id);
                    // Base size roughly on intensity severity
                    const paddingSize = em.intensity === 4 ? 'px-6 py-3 text-lg' : em.intensity === 3 ? 'px-5 py-2.5 text-base' : 'px-4 py-2 text-sm';

                    return (
                        <div key={em.id} className="relative group">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onToggleEmotion(em.id)}
                                onMouseEnter={() => setHoveredEmotion(em)}
                                onMouseLeave={() => setHoveredEmotion(null)}
                                className={`
                                    rounded-full border backdrop-blur-xl transition-all duration-300 font-medium tracking-wide
                                    ${paddingSize}
                                    ${isSelected
                                        ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.6)] scale-110 z-10'
                                        : 'bg-black/50 text-white/90 border-white/10 hover:bg-white/10 hover:border-white/30'}
                                `}
                            >
                                {isSelected && <span className="mr-2 text-xs">✓</span>}
                                {em.label}
                            </motion.button>
                        </div>
                    );
                })}
            </div>

            {/* Floating Tooltip Component */}
            {hoveredEmotion && <EmotionTooltip emotion={hoveredEmotion} />}

            {/* Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: selectedEmotionIds.length > 0 ? 1 : 0, y: selectedEmotionIds.length > 0 ? 0 : 20 }}
                className="mt-16 flex items-center gap-4"
            >
                <button
                    onClick={onProceed}
                    disabled={selectedEmotionIds.length === 0}
                    className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                    Add Context →
                </button>
            </motion.div>
        </motion.div>
    );
}
