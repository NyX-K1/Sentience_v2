import { motion } from 'framer-motion';
import { EmotionDef } from '../types/mood';

export default function EmotionTooltip({ emotion }: { emotion: EmotionDef }) {
    if (!emotion) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`
                fixed bottom-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm 
                bg-white/10 backdrop-blur-3xl border border-white/20 
                rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] 
                p-6 z-50 pointer-events-none
                border-t-4
            `}
            style={{ borderTopColor: emotion.colorHex }}
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-xl font-medium tracking-wide text-white">{emotion.label}</h4>
                <span className="text-xs uppercase tracking-widest opacity-50 px-2 py-1 rounded bg-white/5">{emotion.family}</span>
            </div>

            <p className="text-sm text-white/80 leading-relaxed mb-4 font-sans">
                {emotion.definition}
            </p>

            <div className="space-y-3 font-sans">
                <div className="bg-black/20 rounded p-3">
                    <span className="text-xs text-white/50 uppercase tracking-wider block mb-1">You might feel this when...</span>
                    <span className="text-sm text-white/90 italic">"{emotion.example}"</span>
                </div>

                {emotion.bodySignals.length > 0 && (
                    <div>
                        <span className="text-xs text-white/50 uppercase tracking-wider block mb-2">Body Signals</span>
                        <div className="flex flex-wrap gap-2">
                            {emotion.bodySignals.map((signal, idx) => (
                                <span key={idx} className="text-xs bg-white/5 text-white/70 px-2 py-1 rounded-sm">
                                    {signal}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
