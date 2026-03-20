import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Phone, ExternalLink, X } from 'lucide-react';
import { CRISIS_HELPLINES } from '../data/helplines';

export default function CrisisCard() {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full bg-red-950/40 border border-red-500/50 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            >
                {/* Visual Alert Pulse */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse" />

                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-4 right-4 p-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-full transition-colors z-10"
                    title="Dismiss"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4 mb-6 relative z-10">
                    <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
                        <HeartHandshake size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-red-100 tracking-wide">You are not alone in this.</h3>
                        <p className="text-sm text-red-300/80 mt-1 max-w-xl leading-relaxed">
                            We noticed language in your logs indicating extreme distress or danger. Your pain is valid, but please don't carry it alone. Professional, compassionate humans are waiting to hold this with you right now.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {CRISIS_HELPLINES.map(helpline => (
                        <div key={helpline.id} className="bg-black/40 border border-red-500/20 rounded-2xl p-4 flex flex-col justify-between hover:bg-red-900/30 transition-colors">
                            <div>
                                <h4 className="font-medium text-red-50">{helpline.organization}</h4>
                                <p className="text-xs text-red-300/60 mt-1">{helpline.description}</p>
                                <p className="text-xs text-red-400 mt-2 font-mono">{helpline.available}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <a
                                    href={`tel:${helpline.phone.replace(/\D/g, '')}`}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                                >
                                    <Phone size={14} />
                                    {helpline.phone}
                                </a>
                                {helpline.website && (
                                    <a
                                        href={`https://${helpline.website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-white/40 hover:text-white flex items-center gap-1 text-xs transition-colors"
                                    >
                                        Visit <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-center font-mono text-red-400/50 mt-6 pt-4 border-t border-red-500/20">
                    If you are in immediate physical danger, please call your local emergency services (112 in India) or go to the nearest emergency room.
                </p>
            </motion.div>
        </AnimatePresence>
    );
}
