import { useState } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_TRIGGERS = ['Work', 'Relationship', 'Health', 'Finance', 'Social', 'Self-Image', 'Family', 'Creativity', 'Sleep', 'Weather', 'News'];

interface ContextPanelProps {
    onSave: (data: { intensity: number; triggers: string[]; customTriggers: string[]; note: string }) => void;
    onBack: () => void;
    dominantColorHex?: string;
}

export default function ContextPanel({ onSave, onBack, dominantColorHex = '#ffffff' }: ContextPanelProps) {
    const [intensity, setIntensity] = useState(5);
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
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
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, ${dominantColorHex} ${(intensity - 1) * 11.1}%, rgba(255,255,255,0.1) ${(intensity - 1) * 11.1}%)`
                    }}
                />
            </div>

            {/* Triggers */}
            <div className="mb-10">
                <span className="text-xs text-white/50 uppercase tracking-widest block mb-4">What's influencing this?</span>
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_TRIGGERS.map(t => (
                        <button
                            key={t} onClick={() => toggleTrigger(t)}
                            className={`px-4 py-1.5 rounded-full text-sm font-sans transition-colors border ${selectedTriggers.includes(t) ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-white/70 hover:border-white/50'}`}
                        >
                            {t}
                        </button>
                    ))}
                    {customTriggers.map(t => (
                        <button
                            key={`c-${t}`} onClick={() => toggleTrigger(t, true)}
                            className={`px-4 py-1.5 rounded-full text-sm font-sans transition-colors border bg-white/20 text-white border-white/40`}
                        >
                            {t} ✕
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder="+ Custom (press Enter)"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleAddCustom}
                        className="px-4 py-1.5 rounded-full text-sm font-sans bg-transparent border border-white/20 text-white placeholder-white/30 w-48 focus:outline-none focus:border-white/50"
                    />
                </div>
            </div>

            {/* Note */}
            <div className="mb-10">
                <span className="text-xs text-white/50 uppercase tracking-widest block mb-4">Quick Note</span>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    placeholder="What's on your mind?"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white font-sans focus:outline-none focus:border-white/30 resize-none"
                />
                <div className="text-right text-xs text-white/30 mt-2 font-mono">{note.length}/500</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => onSave({ intensity, triggers: selectedTriggers, customTriggers, note })}
                    className="px-8 py-4 bg-white text-black font-medium rounded-full uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-transform"
                >
                    Save Entry
                </button>
                <button
                    onClick={() => onSave({ intensity, triggers: selectedTriggers, customTriggers, note })} // in a real app, this would route to journaling and pass state
                    className="px-8 py-4 bg-transparent text-white border border-white/20 font-medium rounded-full uppercase tracking-widest text-sm hover:bg-white/5 transition-colors"
                >
                    Save & Journal →
                </button>
            </div>
        </motion.div>
    );
}
