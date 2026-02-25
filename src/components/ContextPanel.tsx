import { useState } from 'react';
import { motion } from 'framer-motion';
import { emotions as allEmotions } from '../data/emotions';
import { EmotionDef } from '../types/mood';
import EmotionTooltip from './EmotionTooltip';

const DEFAULT_TRIGGERS = ['Work', 'Relationship', 'Health', 'Finance', 'Social', 'Self-Image', 'Family', 'Creativity', 'Sleep', 'Weather', 'News'];

interface ContextPanelProps {
    selectedEmotionIds: string[];
    onSave: (data: { intensity: number; triggers: string[]; customTriggers: string[]; note: string }) => void;
    onBack: () => void;
}

export default function ContextPanel({ selectedEmotionIds, onSave, onBack }: ContextPanelProps) {
    const [intensity, setIntensity] = useState(5);
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
    const [hoveredEmotion, setHoveredEmotion] = useState<EmotionDef | null>(null);

    // Filter and group selected emotions by family
    const selectedEmotions = allEmotions.filter(e => selectedEmotionIds.includes(e.id));
    const groupedEmotions = selectedEmotions.reduce((acc, emotion) => {
        if (!acc[emotion.family]) acc[emotion.family] = [];
        acc[emotion.family].push(emotion);
        return acc;
    }, {} as Record<string, EmotionDef[]>);
    const [customTriggers, setCustomTriggers] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [note, setNote] = useState('');

    const toggleTrigger = (trigger: string, isCustom = false) => {
        if (isCustom) {
            setCustomTriggers(prev => prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]);
        } else {
            setSelectedTriggers(prev => prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]);
        }
    };

    const handleAddCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && customInput.trim()) {
            if (!customTriggers.includes(customInput.trim())) {
                setCustomTriggers([...customTriggers, customInput.trim()]);
            }
            setCustomInput('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto flex flex-col p-6 mt-8 relative"
        >
            <button onClick={onBack} className="absolute -top-12 left-6 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 z-50">
                ← Back to Emotions
            </button>

            <h3 className="text-xl font-light mb-8 text-center tracking-wider">Add context <span className="text-white/30 text-sm">(optional)</span></h3>

            {/* Selected Emotions Overview */}
            {selectedEmotions.length > 0 && (
                <div className="mb-10 w-full max-w-xl mx-auto relative">
                    <span className="text-xs text-white/50 uppercase tracking-widest block mb-4 text-center">Selected Emotions</span>
                    <div className="flex flex-col gap-4">
                        {Object.entries(groupedEmotions).map(([family, ems]) => (
                            <div key={family} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-white/40 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>{family}</span>
                                    <span>{ems.length}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ems.map(em => (
                                        <div
                                            key={em.id}
                                            onMouseEnter={() => setHoveredEmotion(em)}
                                            onMouseLeave={() => setHoveredEmotion(null)}
                                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-lg text-sm text-white/90 transition-colors cursor-help group"
                                        >
                                            {em.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Tooltip Component */}
            {hoveredEmotion && (
                <div className="fixed inset-x-0 bottom-10 z-50 pointer-events-none flex justify-center">
                    <div className="transform origin-bottom pointer-events-auto shadow-2xl">
                        <EmotionTooltip emotion={hoveredEmotion} />
                    </div>
                </div>
            )}

            {/* Intensity Slider */}
            <div className="mb-10 w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs text-white/50 uppercase tracking-widest mb-4">
                    <span>Barely There (1)</span>
                    <span className="text-white font-medium text-lg">{intensity}</span>
                    <span>Overwhelming (10)</span>
                </div>
                <input
                    type="range"
                    min="1" max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
            </div>

            {/* Triggers */}
            <div className="mb-10 w-full max-w-xl mx-auto">
                <span className="text-xs text-white/50 uppercase tracking-widest block mb-4 text-center">What's influencing this?</span>
                <div className="flex flex-wrap gap-2 justify-center">
                    {DEFAULT_TRIGGERS.map(t => (
                        <motion.button
                            key={t}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleTrigger(t)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 border ${selectedTriggers.includes(t) ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/40'}`}
                        >
                            {t}
                        </motion.button>
                    ))}
                    {customTriggers.map(t => (
                        <motion.button
                            key={`c-${t}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleTrigger(t, true)}
                            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-300 border bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]`}
                        >
                            {t} ✕
                        </motion.button>
                    ))}
                    <input
                        type="text"
                        placeholder="+ Custom (press Enter)"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleAddCustom}
                        className="px-4 py-2 rounded-lg text-sm bg-transparent border border-white/20 text-white placeholder-white/30 w-full max-w-[200px] focus:outline-none focus:border-white/50 focus:bg-white/5 transition-colors"
                    />
                </div>
            </div>

            {/* Note */}
            <div className="mb-10 w-full max-w-xl mx-auto">
                <span className="text-xs text-white/50 uppercase tracking-widest block mb-4 text-center">Quick Note</span>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="Optional notes..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors resize-none"
                />
                <div className="text-right text-xs text-white/30 mt-2 font-mono pr-2">{note.length}/500</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => onSave({ intensity, triggers: selectedTriggers, customTriggers, note })}
                    className="px-6 py-3 bg-white text-black font-medium rounded-xl text-sm hover:bg-zinc-200 transition-colors"
                >
                    Save Entry
                </button>
                <button
                    onClick={() => onSave({ intensity, triggers: selectedTriggers, customTriggers, note })} // in a real app, this would route to journaling and pass state
                    className="px-6 py-3 bg-transparent text-white border border-white/20 font-medium rounded-xl text-sm hover:bg-white/5 transition-colors"
                >
                    Save & Journal →
                </button>
            </div>
        </motion.div>
    );
}
