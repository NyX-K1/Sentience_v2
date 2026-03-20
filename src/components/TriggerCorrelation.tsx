import { useMemo } from 'react';
import { MoodEntry } from '../types/mood';
import { extractTriggerCorrelations } from '../utils/trendCalculations';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TriggerCorrelationProps {
    entries: MoodEntry[];
}

export default function TriggerCorrelation({ entries }: TriggerCorrelationProps) {
    const data = useMemo(() => extractTriggerCorrelations(entries), [entries]);

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl bg-white/5 p-6 text-center">
                <div className="flex items-end gap-2 mb-6 opacity-30">
                    <div className="w-3 h-12 bg-white rounded-t-sm" />
                    <div className="w-3 h-20 bg-emerald-400 rounded-t-sm" />
                    <div className="w-3 h-8 bg-rose-400 rounded-t-sm" />
                    <div className="w-3 h-16 bg-white rounded-t-sm" />
                </div>
                <h3 className="text-lg text-white/70 mb-2 font-medium">Trigger Correlations Hidden</h3>
                <p className="text-white/40 text-sm tracking-widest uppercase max-w-xs">
                    Log emotional contexts (like Work, Health, or Deep Sleep) to see how they impact your valence.
                </p>
            </div>
        );
    }

    // Sort to find biggest uplifts and drains
    const sorted = [...data].sort((a, b) => b.avgValence - a.avgValence);
    const uplifts = sorted.filter(t => t.avgValence > 0.1).slice(0, 5);
    const drains = sorted.filter(t => t.avgValence < -0.1).slice(-5).reverse(); // largest negative first

    return (
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 relative">
            <div className="mb-8">
                <h3 className="text-xl font-light tracking-wide">Context Impact Map</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">What commonly moves your emotional baseline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Uplifts */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight className="text-emerald-400 w-5 h-5" />
                        <h4 className="text-white/80 font-medium tracking-wide">Uplifting Contexts</h4>
                    </div>
                    <div className="space-y-3">
                        {uplifts.length > 0 ? uplifts.map(t => (
                            <div key={t.trigger} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                                <span className="text-emerald-100 font-medium">{t.trigger}</span>
                                <div className="text-right">
                                    <span className="text-emerald-400 font-bold block">+{t.avgValence.toFixed(2)}</span>
                                    <span className="text-[10px] text-emerald-400/50 uppercase tracking-widest">{t.count} logs</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-sm text-white/30 italic p-4 bg-white/5 rounded-2xl text-center">Not enough positive correlations yet.</div>
                        )}
                    </div>
                </div>

                {/* Drains */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowDownRight className="text-rose-400 w-5 h-5" />
                        <h4 className="text-white/80 font-medium tracking-wide">Draining Contexts</h4>
                    </div>
                    <div className="space-y-3">
                        {drains.length > 0 ? drains.map(t => (
                            <div key={t.trigger} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                                <span className="text-rose-100 font-medium">{t.trigger}</span>
                                <div className="text-right">
                                    <span className="text-rose-400 font-bold block">{t.avgValence.toFixed(2)}</span>
                                    <span className="text-[10px] text-rose-400/50 uppercase tracking-widest">{t.count} logs</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-sm text-white/30 italic p-4 bg-white/5 rounded-2xl text-center">No major negative correlations detected.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
