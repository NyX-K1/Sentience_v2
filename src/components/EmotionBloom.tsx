import { motion } from 'framer-motion';
import { EmotionFamily } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';

interface EmotionBloomProps {
    family: EmotionFamily | null;
    selectedEmotionIds: string[];
    onToggleEmotion: (id: string) => void;
    onBack: () => void;
    onProceed: () => void;
}

export default function EmotionBloom({ family, selectedEmotionIds, onToggleEmotion, onBack, onProceed }: EmotionBloomProps) {
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
            <button onClick={onBack} className="absolute top-0 left-4 md:left-8 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Families
            </button>

            <h2 className="text-2xl md:text-3xl font-light mb-8 tracking-wide text-center shrink-0">
                Can you pinpoint it?
                <span className="block text-sm text-zinc-500 mt-2">Select the exact emotions. Long press for definitions.</span>
            </h2>

            {/* Scrollable List Container */}
            <div className="w-full max-w-xl flex-grow overflow-y-auto scrollbar-hide px-4 pb-32 relative">
                <div className="flex flex-col gap-3">
                    {sorted.map((em, i) => {
                        const isSelected = selectedEmotionIds.includes(em.id);

                        return (
                            <motion.button
                                key={em.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                                whileHover={{ scale: 1.02, x: 8 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onToggleEmotion(em.id)}
                                className={`
                                    w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 font-medium tracking-wide flex items-center justify-between group
                                    ${isSelected
                                        ? 'bg-gradient-to-r from-white to-zinc-200 text-black shadow-lg shadow-white/10'
                                        : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5 hover:border-white/20'}
                                `}
                            >
                                <div>
                                    <span className={`text-lg block ${isSelected ? 'text-black font-semibold' : 'text-white'}`}>{em.label}</span>
                                    {em.intensity === 4 && <span className={`text-xs uppercase tracking-widest mt-1 block ${isSelected ? 'text-black/60' : 'text-rose-400'}`}>Extreme Intensity</span>}
                                    {em.intensity === 3 && <span className={`text-xs uppercase tracking-widest mt-1 block ${isSelected ? 'text-black/60' : 'text-orange-300'}`}>Strong</span>}
                                    {em.intensity === 2 && <span className={`text-xs uppercase tracking-widest mt-1 block ${isSelected ? 'text-black/60' : 'text-amber-200'}`}>Moderate</span>}
                                    {em.intensity === 1 && <span className={`text-xs uppercase tracking-widest mt-1 block ${isSelected ? 'text-black/60' : 'text-white/40'}`}>Mild</span>}
                                </div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black text-white' : 'border-white/20 text-transparent group-hover:border-white/40'}`}>
                                    {isSelected && <span className="text-sm">✓</span>}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Action Bar - Fixed to bottom */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: selectedEmotionIds.length > 0 ? 1 : 0, y: selectedEmotionIds.length > 0 ? 0 : 40 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
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
