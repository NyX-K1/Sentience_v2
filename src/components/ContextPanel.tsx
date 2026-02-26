import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { emotions as allEmotions } from '../data/emotions';
import { EmotionDef } from '../types/mood';
import EmotionTooltip from './EmotionTooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';

/* ─── Curated trigger categories ─── */
const TRIGGER_CATEGORIES: { label: string; triggers: string[] }[] = [
    { label: 'Life Areas', triggers: ['Work', 'Relationships', 'Health', 'Finances', 'Family', 'Social Life', 'Self-Image'] },
    { label: 'Activities', triggers: ['Exercise', 'Creativity', 'Learning', 'Commuting', 'Screen Time', 'Cooking', 'Socializing'] },
    { label: 'Body & Mind', triggers: ['Sleep Quality', 'Energy Level', 'Physical Pain', 'Meditation', 'Appetite', 'Caffeine'] },
    { label: 'Events', triggers: ['Good News', 'Bad News', 'Conflict', 'Achievement', 'Loss', 'Surprise', 'Decision'] },
];

/* ─── Quick reflection prompts ─── */
const REFLECTION_PROMPTS = [
    'What happened right before this feeling?',
    'Where are you right now?',
    'Who are you with?',
    'What thought keeps replaying?',
    'What does your body feel like?',
    'What do you need most right now?',
];

interface ContextPanelProps {
    selectedEmotionIds: string[];
    onSave: (data: { intensity: number; triggers: string[]; customTriggers: string[]; note: string }) => void;
    onBack: () => void;
}

export default function ContextPanel({ selectedEmotionIds, onSave, onBack }: ContextPanelProps) {
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
    const [hoveredEmotion, setHoveredEmotion] = useState<EmotionDef | null>(null);
    const [customTriggers, setCustomTriggers] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [note, setNote] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [activePrompt, setActivePrompt] = useState<string | null>(null);

    // Selected emotions data
    const selectedEmotions = allEmotions.filter(e => selectedEmotionIds.includes(e.id));
    const avgIntensity = selectedEmotions.length > 0
        ? Math.round(selectedEmotions.reduce((sum, e) => sum + e.intensity, 0) / selectedEmotions.length)
        : 2;

    const toggleTrigger = (trigger: string) => {
        if (customTriggers.includes(trigger)) {
            setCustomTriggers(prev => prev.filter(t => t !== trigger));
        } else if (selectedTriggers.includes(trigger)) {
            setSelectedTriggers(prev => prev.filter(t => t !== trigger));
        } else {
            setSelectedTriggers(prev => [...prev, trigger]);
        }
    };

    const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customInput.trim()) {
            if (!customTriggers.includes(customInput.trim()) && !selectedTriggers.includes(customInput.trim())) {
                setCustomTriggers(prev => [...prev, customInput.trim()]);
            }
            setCustomInput('');
        }
    };

    const handlePromptClick = (prompt: string) => {
        if (activePrompt === prompt) {
            setActivePrompt(null);
        } else {
            setActivePrompt(prompt);
            // Pre-fill the note area with the prompt as a starting point
            if (!note.includes(prompt)) {
                setNote(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`);
            }
        }
    };

    const handleSave = () => {
        onSave({
            intensity: avgIntensity,
            triggers: selectedTriggers,
            customTriggers,
            note,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center px-4 pt-14 pb-24 relative"
        >
            {/* Back button */}
            <button onClick={onBack} className="absolute top-0 left-4 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Emotions
            </button>

            <h3 className="text-2xl md:text-3xl font-light mb-2 tracking-wide text-center">
                Add your context
                <span className="block text-sm text-white/30 mt-2">Help Sentience understand <em>what's behind</em> the feeling</span>
            </h3>

            {/* ─── Selected Emotions Summary ─── */}
            <div className="w-full max-w-xl mt-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-3 text-center">Feeling right now</span>
                <div className="flex flex-wrap gap-2 justify-center">
                    {selectedEmotions.map(em => (
                        <div
                            key={em.id}
                            onMouseEnter={() => setHoveredEmotion(em)}
                            onMouseLeave={() => setHoveredEmotion(null)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 rounded-full text-sm text-white/90 transition-all cursor-help"
                        >
                            {em.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Tooltip */}
            {hoveredEmotion && (
                <div className="fixed inset-x-0 bottom-10 z-50 pointer-events-none flex justify-center">
                    <div className="transform origin-bottom pointer-events-auto shadow-2xl">
                        <EmotionTooltip emotion={hoveredEmotion} />
                    </div>
                </div>
            )}

            {/* ─── What's influencing this? (Categorized Triggers) ─── */}
            <div className="w-full max-w-xl mt-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-4 text-center">What's influencing this?</span>

                {/* Selected triggers chips */}
                {(selectedTriggers.length > 0 || customTriggers.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                        {[...selectedTriggers, ...customTriggers].map(t => (
                            <motion.button
                                key={t}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleTrigger(t)}
                                className="px-3 py-1 bg-white text-black text-xs rounded-full font-medium flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-colors"
                            >
                                {t} <span className="text-black/40">✕</span>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Expandable categories */}
                <div className="space-y-2">
                    {TRIGGER_CATEGORIES.map(cat => {
                        const isExpanded = expandedCategory === cat.label;
                        const selectedInCat = cat.triggers.filter(t => selectedTriggers.includes(t)).length;

                        return (
                            <div key={cat.label} className="border border-white/8 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : cat.label)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                >
                                    <span className="text-sm text-white/70">{cat.label}</span>
                                    <div className="flex items-center gap-2">
                                        {selectedInCat > 0 && (
                                            <span className="text-[10px] bg-white/15 text-white/60 px-2 py-0.5 rounded-full">{selectedInCat}</span>
                                        )}
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-wrap gap-2 px-4 pb-4">
                                                {cat.triggers.map(t => (
                                                    <motion.button
                                                        key={t}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => toggleTrigger(t)}
                                                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedTriggers.includes(t)
                                                                ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/15 hover:text-white hover:border-white/25'
                                                            }`}
                                                    >
                                                        {t}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Custom trigger input */}
                <div className="mt-3">
                    <input
                        type="text"
                        placeholder="+ Add your own (press Enter)"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleAddCustom}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all"
                    />
                </div>
            </div>

            {/* ─── Quick Reflection Prompts ─── */}
            <div className="w-full max-w-xl mt-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-4 text-center">Quick reflection starters</span>
                <div className="grid grid-cols-2 gap-2">
                    {REFLECTION_PROMPTS.map(prompt => (
                        <motion.button
                            key={prompt}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePromptClick(prompt)}
                            className={`text-left px-3 py-2.5 rounded-xl text-xs leading-relaxed border transition-all ${activePrompt === prompt
                                    ? 'bg-white/15 border-white/25 text-white/90'
                                    : 'bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70'
                                }`}
                        >
                            {prompt}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* ─── Free Note ─── */}
            <div className="w-full max-w-xl mt-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] block mb-3 text-center">Anything else on your mind?</span>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="Write freely — no one sees this but you..."
                    className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/8 transition-all resize-none leading-relaxed"
                />
                <div className="text-right text-[10px] text-white/20 mt-1.5 font-mono pr-1">{note.length}/500</div>
            </div>

            {/* ─── Action Buttons ─── */}
            <div className="w-full max-w-xl mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={handleSave}
                    className="flex-1 px-8 py-3.5 bg-white text-black font-medium rounded-full text-sm hover:bg-zinc-200 transition-colors uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                    Save Entry
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 px-8 py-3.5 bg-transparent text-white/70 border border-white/15 font-medium rounded-full text-sm hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest"
                >
                    Save & Journal →
                </button>
            </div>
        </motion.div>
    );
}
