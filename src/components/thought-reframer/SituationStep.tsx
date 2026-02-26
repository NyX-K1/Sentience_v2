import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { CONTEXT_TAGS } from '../../data/reframePrompts';

interface SituationStepProps {
    situation: string;
    contextTags: string[];
    onUpdate: (data: { situation?: string; contextTags?: string[] }) => void;
    onContinue: () => void;
}

export default function SituationStep({ situation, contextTags, onUpdate, onContinue }: SituationStepProps) {
    const [charCount, setCharCount] = useState(situation.length);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                            <MapPin className="text-indigo-400" size={22} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What happened?</h2>
                    </div>
                    <p className="text-white/50 text-sm mb-8 ml-[52px]">
                        Describe the situation that triggered your distress. Stick to facts — what would a security camera have recorded?
                    </p>

                    {/* Textarea */}
                    <div className="relative mb-6">
                        <textarea
                            value={situation}
                            onChange={(e) => {
                                if (e.target.value.length <= 1000) {
                                    onUpdate({ situation: e.target.value });
                                    setCharCount(e.target.value.length);
                                }
                            }}
                            placeholder="e.g., My manager didn't respond to my email for two days..."
                            className="w-full h-36 px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none text-white placeholder:text-white/25 text-base transition-all"
                            aria-label="Situation description"
                        />
                        <span className="absolute bottom-3 right-4 text-xs text-white/30 font-mono">
                            {charCount}/1000
                        </span>
                    </div>

                    {/* Context Tags */}
                    <div className="mb-8">
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Context (optional)</p>
                        <div className="flex flex-wrap gap-2">
                            {CONTEXT_TAGS.map(tag => {
                                const isSelected = contextTags.includes(tag);
                                return (
                                    <motion.button
                                        key={tag}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            const updated = isSelected
                                                ? contextTags.filter(t => t !== tag)
                                                : [...contextTags, tag];
                                            onUpdate({ contextTags: updated });
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
                                            }`}
                                    >
                                        {tag}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Continue */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={situation.trim().length < 20}
                        onClick={onContinue}
                        className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-indigo-500/30"
                    >
                        Continue
                        <ArrowRight size={18} />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
