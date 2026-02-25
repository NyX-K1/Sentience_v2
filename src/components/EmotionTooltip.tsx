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
                fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm 
                bg-zinc-900/90 backdrop-blur-xl border border-white/10 
                rounded-3xl shadow-2xl
                p-5 z-50 pointer-events-none text-left
            `}
        >
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h4 className="text-xl font-semibold tracking-wide text-white" style={{ color: emotion.colorHex }}>{emotion.label}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">{emotion.family} Family</span>
                </div>
            </div>

            <p className="text-sm text-white/80 leading-relaxed mb-4">
                {emotion.definition}
            </p>

            <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Example context</span>
                    <span className="text-sm text-white/90">"{emotion.example}"</span>
                </div>

                {emotion.bodySignals.length > 0 && (
                    <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">Physical Signals</span>
                        <div className="flex flex-wrap gap-1.5">
                            {emotion.bodySignals.map((signal, idx) => (
                                <span key={idx} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-md border border-white/5">
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
