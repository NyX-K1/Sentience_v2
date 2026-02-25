import { motion } from 'framer-motion';
import { AlertCircle, Lightbulb, TrendingUp, Anchor } from 'lucide-react';
import { MoodInsight } from '../hooks/usePatternDetection';

interface InsightCardProps {
    insight: MoodInsight;
    index: number;
}

export default function InsightCard({ insight, index }: InsightCardProps) {

    const getStyles = () => {
        switch (insight.tier) {
            case 'concern':
                return {
                    bg: 'bg-orange-950/20',
                    border: 'border-orange-500/30',
                    iconBg: 'bg-orange-500/20',
                    iconColor: 'text-orange-400',
                    title: 'text-orange-200',
                    Icon: AlertCircle
                };
            case 'nudge':
                return {
                    bg: 'bg-indigo-950/20',
                    border: 'border-indigo-500/30',
                    iconBg: 'bg-indigo-500/20',
                    iconColor: 'text-indigo-400',
                    title: 'text-indigo-200',
                    Icon: Anchor
                };
            case 'positive':
                return {
                    bg: 'bg-emerald-950/20',
                    border: 'border-emerald-500/30',
                    iconBg: 'bg-emerald-500/20',
                    iconColor: 'text-emerald-400',
                    title: 'text-emerald-200',
                    Icon: TrendingUp
                };
            default: // Fallback
                return {
                    bg: 'bg-white/5',
                    border: 'border-white/10',
                    iconBg: 'bg-white/10',
                    iconColor: 'text-white/60',
                    title: 'text-white',
                    Icon: Lightbulb
                };
        }
    };

    const s = getStyles();
    const { Icon } = s;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`w-full ${s.bg} border ${s.border} rounded-3xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden`}
        >
            <div className={`p-4 ${s.iconBg} ${s.iconColor} rounded-2xl h-fit w-fit shrink-0`}>
                <Icon size={24} />
            </div>

            <div className="flex-grow">
                <div className="mb-1 text-[10px] uppercase font-mono tracking-widest text-white/40">
                    Sentience Pattern Recognition
                </div>
                <h4 className={`text-lg font-medium tracking-wide mb-2 ${s.title}`}>
                    {insight.title}
                </h4>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                    {insight.description}
                </p>

                {insight.actionableAdvice && (
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <span className="text-xs uppercase tracking-widest text-white/40 mb-2 block font-mono">Suggested Action</span>
                        <p className="text-sm text-white/80">{insight.actionableAdvice}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
