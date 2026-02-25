import { motion } from 'framer-motion';
import { EmotionFamily, EmotionDef } from '../types/mood';
import { emotions as allEmotions } from '../data/emotions';
import { useState } from 'react';
import EmotionTooltip from './EmotionTooltip';

interface EmotionBloomProps {
    family: EmotionFamily | null;
    selectedEmotionIds: string[];
    onToggleEmotion: (id: string) => void;
    onBack: () => void;
    onProceed: () => void;
}

export default function EmotionBloom({ family, selectedEmotionIds, onToggleEmotion, onBack, onProceed }: EmotionBloomProps) {
    const [hoveredEmotion, setHoveredEmotion] = useState<EmotionDef | null>(null);

    // Filter taxonomy by family or just dump all if 'Complex'
    const relevantEmotions = allEmotions.filter(e => e.family === family || (family === 'Complex' && e.family === 'Complex'));

    const [expandedIntensity, setExpandedIntensity] = useState<number | null>(4);

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
                <div className="flex flex-col gap-4">
                    {[4, 3, 2, 1].map((intensity) => {
                        const items = relevantEmotions.filter(e => e.intensity === intensity);
                        if (items.length === 0) return null;

                        const isExpanded = expandedIntensity === intensity;
                        const headerLabels = {
                            4: "Peak Intensity",
                            3: "Strong Intensity",
                            2: "Moderate Intensity",
                            1: "Mild Intensity"
                        };

                        return (
                            <div key={intensity} className="flex flex-col gap-2">
                                <button
                                    onClick={() => setExpandedIntensity(isExpanded ? null : intensity)}
                                    className={`w-full text-left px-5 py-4 rounded-xl transition-colors flex justify-between items-center border ${isExpanded ? 'bg-white/10 border-white/20' : 'bg-white/5 hover:bg-white/10 border-white/5'}`}
                                >
                                    <span className="font-semibold text-white/90 tracking-widest uppercase text-sm">
                                        {headerLabels[intensity as keyof typeof headerLabels]} <span className="text-white/40 ml-2">({items.length})</span>
                                    </span>
                                    <span className="text-white/50 text-xl font-light leading-none">
                                        {isExpanded ? '−' : '+'}
                                    </span>
                                </button>

                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex flex-col gap-2 pl-3 ml-2 border-l-2 border-white/10 mt-1 mb-2"
                                    >
                                        {items.map((em, i) => {
                                            const isSelected = selectedEmotionIds.includes(em.id);

                                            return (
                                                <motion.button
                                                    key={em.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.02 } }}
                                                    whileHover={{ scale: 1.02, x: 4 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => onToggleEmotion(em.id)}
                                                    onMouseEnter={() => setHoveredEmotion(em)}
                                                    onMouseLeave={() => setHoveredEmotion(null)}
                                                    className={`
                                                        w-full text-left px-5 py-3 rounded-xl transition-all duration-300 font-medium tracking-wide flex items-center justify-between group
                                                        ${isSelected
                                                            ? 'bg-gradient-to-r from-white to-zinc-200 text-black shadow-lg shadow-white/10'
                                                            : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5 hover:border-white/20'}
                                                    `}
                                                >
                                                    <span className={`text-base block ${isSelected ? 'text-black font-semibold' : 'text-white'}`}>{em.label}</span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-black border-black text-white' : 'border-white/20 text-transparent group-hover:border-white/40'}`}>
                                                        {isSelected && <span className="text-xs">✓</span>}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Tooltip Component */}
            {hoveredEmotion && <EmotionTooltip emotion={hoveredEmotion} />}

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
