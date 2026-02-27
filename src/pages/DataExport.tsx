import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ClinicalReportPDF, ClinicalReportProps } from '../components/ClinicalReportPDF';
import { ArrowLeft, Loader2, FileDown, CalendarDays, Home, ShieldCheck } from 'lucide-react';
import NeuralBackground from '../components/ui/flow-field-background';

type TimeRange = '30d' | '90d';

export default function DataExport() {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<ClinicalReportProps | null>(null);

    useEffect(() => {
        if (!user) return;
        generateReportData();
    }, [user, timeRange]);

    const generateReportData = async () => {
        setIsLoading(true);
        try {
            const today = new Date();
            const pastDate = new Date();
            if (timeRange === '30d') pastDate.setDate(today.getDate() - 30);
            if (timeRange === '90d') pastDate.setDate(today.getDate() - 90);

            const pastDateString = pastDate.toISOString();

            // 1. Fetch Mood Logs
            const { data: moods } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString);

            let avgValence = 0;
            let avgArousal = 0;
            const triggerCounts: Record<string, number> = {};

            if (moods && moods.length > 0) {
                avgValence = moods.reduce((acc, m) => acc + (m.valence || 0), 0) / moods.length;
                avgArousal = moods.reduce((acc, m) => acc + (m.arousal || 0), 0) / moods.length;

                moods.forEach(m => {
                    if (Array.isArray(m.triggers)) {
                        m.triggers.forEach((t: string) => {
                            triggerCounts[t] = (triggerCounts[t] || 0) + 1;
                        });
                    }
                });
            }

            const topTriggers = Object.entries(triggerCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

            // 2. Fetch CBT Reframing Sessions
            const { data: reframes } = await supabase
                .from('thought_reframing_sessions')
                .select('*')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: false });

            let avgBeliefShift = 0;
            const distortionCounts: Record<string, number> = {};
            const recentReframes: { thought: string; reframe: string }[] = [];

            if (reframes && reframes.length > 0) {
                const totalShift = reframes.reduce((acc, r) => acc + (Math.max(0, (r.initial_belief || 0) - (r.final_belief || 0))), 0);
                avgBeliefShift = totalShift / reframes.length;

                reframes.forEach(r => {
                    if (Array.isArray(r.cognitive_distortions)) {
                        r.cognitive_distortions.forEach((d: string) => {
                            distortionCounts[d] = (distortionCounts[d] || 0) + 1;
                        });
                    }
                });

                // Get top 3 most recent non-empty reframes
                for (const r of reframes) {
                    if (r.automatic_thought && r.selected_reframe) {
                        recentReframes.push({ thought: r.automatic_thought, reframe: r.selected_reframe });
                        if (recentReframes.length >= 3) break;
                    }
                }
            }

            const topDistortions = Object.entries(distortionCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

            // 3. Fetch Journal Entries
            const { data: journals } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: false });

            const sentimentCounts: Record<string, number> = {};
            const recentInsights: string[] = [];

            if (journals && journals.length > 0) {
                journals.forEach(j => {
                    if (j.sentiment) {
                        sentimentCounts[j.sentiment] = (sentimentCounts[j.sentiment] || 0) + 1;
                    }
                    if (j.core_insight && recentInsights.length < 5) {
                        recentInsights.push(j.core_insight);
                    }
                });
            }

            // Find predominant sentiment
            let predominantSentiment = 'N/A';
            let maxCount = 0;
            Object.entries(sentimentCounts).forEach(([sent, count]) => {
                if (count > maxCount) { maxCount = count; predominantSentiment = sent; }
            });

            const dateRangeStr = `${pastDate.toLocaleDateString()} - ${today.toLocaleDateString()}`;

            setReportData({
                dateRange: dateRangeStr,
                generationDate: today.toLocaleDateString(),
                metrics: {
                    mood: {
                        avgValence: avgValence.toFixed(2),
                        avgArousal: avgArousal.toFixed(2),
                        topTriggers
                    },
                    cbt: {
                        totalSessions: reframes?.length || 0,
                        avgBeliefShift: avgBeliefShift.toFixed(1),
                        topDistortions,
                        recentReframes
                    },
                    journal: {
                        predominantSentiment,
                        recentInsights
                    }
                }
            });

        } catch (error) {
            console.error('Error compiling clinical report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-violet-950 text-white relative flex flex-col items-center">
            {/* Shader bg */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <NeuralBackground color="#10b981" particleCount={150} speed={0.2} trailOpacity={0.05} />
            </div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-4xl px-4 pt-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link to="/sentience" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10" title="Return to Home">
                        <Home size={16} />
                        <span className="text-sm">Home</span>
                    </Link>
                </div>
            </div>

            <main className="relative z-10 w-full max-w-4xl px-4 py-16 flex flex-col flex-1">

                {/* Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-emerald-400/10 border border-emerald-400/20 mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
                        <ShieldCheck className="text-emerald-400 relative z-10" size={36} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extralight tracking-wide mb-4">
                        Clinical <span className="font-semibold text-emerald-400">Data Export</span>
                    </h1>
                    <p className="text-white/50 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
                        Generate a secure, clinical-grade PDF summary of your mental wellbeing data. This is designed to be securely shared with therapists or practitioners.
                    </p>
                </div>

                {/* Configuration Card */}
                <div className="w-full max-w-xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

                    {/* Glowing highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-50"></div>

                    <div className="flex flex-col gap-8 items-center">
                        <div className="w-full">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-[0.15em] mb-4 block text-center">Select Time Range</label>
                            <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-full w-full">
                                {(['30d', '90d'] as TimeRange[]).map((tr) => (
                                    <button
                                        key={tr}
                                        onClick={() => setTimeRange(tr)}
                                        className={`flex-1 py-3 rounded-full text-sm font-medium uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${timeRange === tr ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20' : 'text-white/40 hover:text-white/80'
                                            }`}
                                    >
                                        <CalendarDays size={16} className={timeRange === tr ? 'text-black/60' : ''} />
                                        {tr === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

                        <div className="w-full text-center">
                            <AnimatePresence mode="wait">
                                {isLoading || !reportData ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="py-4 px-8 rounded-full border border-white/10 bg-white/5 inline-flex items-center justify-center min-w-[280px]"
                                    >
                                        <Loader2 className="animate-spin text-emerald-400 mr-3" size={20} />
                                        <span className="text-emerald-400/80 font-medium tracking-wide">Compiling Secure Report...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="ready"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <PDFDownloadLink
                                            document={<ClinicalReportPDF {...reportData} />}
                                            fileName={`Clinical_Summary_${timeRange}_${new Date().toISOString().split('T')[0]}.pdf`}
                                            className="group relative px-8 py-4 rounded-full overflow-hidden border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all duration-500 flex items-center justify-center gap-3 w-full sm:w-auto mx-auto shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] font-medium tracking-wide"
                                        >
                                            <FileDown size={20} className="transition-transform group-hover:-translate-y-0.5" />
                                            Download Clinical PDF
                                        </PDFDownloadLink>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mt-6 max-w-sm mx-auto">
                                The generated PDF contains personal health information. Handle with care.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
