import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { ArrowLeft, Loader2, Sparkles, TrendingUp, CalendarDays, Home } from 'lucide-react';
import NeuralBackground from '../components/ui/flow-field-background';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

type TimeRange = '7d' | '30d' | '90d';

export default function UserAnalytics() {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [moodData, setMoodData] = useState<any[]>([]);
    const [cbtData, setCbtData] = useState<any[]>([]);
    const [journalEmotions, setJournalEmotions] = useState<any[]>([]);

    // AI Insight State
    const [aiInsight, setAiInsight] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user, timeRange]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        setIsAiLoading(true);
        setAiInsight('');

        try {
            const today = new Date();
            const pastDate = new Date();
            if (timeRange === '7d') pastDate.setDate(today.getDate() - 7);
            if (timeRange === '30d') pastDate.setDate(today.getDate() - 30);
            if (timeRange === '90d') pastDate.setDate(today.getDate() - 90);

            const pastDateString = pastDate.toISOString();

            // 1. Fetch Mood Logs
            const { data: moods } = await supabase
                .from('mood_logs')
                .select('*')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: true });

            const formattedMoods = (moods || []).map(m => ({
                date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                valence: m.valence,
                arousal: m.arousal
            }));
            setMoodData(formattedMoods);

            // 2. Fetch CBT Reframing Sessions
            const { data: reframes } = await supabase
                .from('thought_reframing_sessions')
                .select('*')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString)
                .order('created_at', { ascending: true });

            const formattedCBT = (reframes || []).map((r, i) => ({
                name: `Session ${i + 1}`,
                date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                initialBelief: r.initial_belief,
                finalBelief: r.final_belief
            }));
            setCbtData(formattedCBT);

            // 3. Fetch Journal Entries for Emotion Radar
            const { data: journals } = await supabase
                .from('journal_entries')
                .select('detected_emotions')
                .eq('user_id', user!.id)
                .gte('created_at', pastDateString);

            const emotionCounts: Record<string, number> = {};
            journals?.forEach(j => {
                if (j.detected_emotions && Array.isArray(j.detected_emotions)) {
                    j.detected_emotions.forEach((em: string) => {
                        emotionCounts[em] = (emotionCounts[em] || 0) + 1;
                    });
                }
            });

            const radarData = Object.entries(emotionCounts)
                .map(([emotion, count]) => ({ emotion, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6); // Top 6 for a clean radar chart

            setJournalEmotions(radarData);

            // Generate AI Insight
            generateAiInsight(formattedMoods, formattedCBT, radarData);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAiInsight = async (moods: any[], cbt: any[], emotions: any[]) => {
        try {
            const avgValence = moods.length ? (moods.reduce((sum, m) => sum + m.valence, 0) / moods.length).toFixed(2) : 'N/A';
            const avgShift = cbt.length ? (cbt.reduce((sum, c) => sum + (c.initialBelief - c.finalBelief), 0) / cbt.length).toFixed(1) : 'N/A';
            const topEmotion = emotions.length ? emotions[0].emotion : 'N/A';

            const summaryStats = {
                timeframe: timeRange,
                averageMoodValence: avgValence,
                averageCBTBeliefReduction: avgShift,
                mostFrequentJournalEmotion: topEmotion,
                totalLogs: moods.length,
                totalReframingSessions: cbt.length
            };

            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: "You are an empathetic, encouraging AI assistant in a mental health app. Look at this user's recent data summary. Provide a 2-sentence, highly personalized, actionable tip or observation. Keep the tone warm and uplifting. Do not sound clinical."
                        },
                        { role: 'user', content: JSON.stringify(summaryStats) }
                    ],
                    max_tokens: 150
                })
            });

            const data = await resp.json();
            const reply = data.choices?.[0]?.message?.content || "You're making taking time for yourself a priority, and that matters. Keep observing your thoughts with gentleness.";
            setAiInsight(reply);
        } catch (error) {
            console.error('Error fetching AI insight:', error);
            setAiInsight("You're making taking time for yourself a priority, and that matters. Keep observing your thoughts with gentleness.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-violet-950 text-white relative flex flex-col items-center">
            {/* Shader bg */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <NeuralBackground color="#10b981" particleCount={150} speed={0.2} trailOpacity={0.05} />
            </div>

            {/* Header */}
            <div className="relative z-10 w-full max-w-6xl px-4 pt-6 flex justify-between items-center">
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
                <div className="flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
                    {(['7d', '30d', '90d'] as TimeRange[]).map((tr) => (
                        <button
                            key={tr}
                            onClick={() => setTimeRange(tr)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all duration-300 ${timeRange === tr ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            {tr}
                        </button>
                    ))}
                </div>
            </div>

            <main className="relative z-10 w-full max-w-6xl px-4 py-12 flex flex-col gap-8 flex-1">

                {/* Title */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-extralight tracking-wide items-center gap-3">
                        <TrendingUp className="inline-block mb-2 text-emerald-400" size={32} /> User <span className="font-semibold text-emerald-400">Analytics</span>
                    </h1>
                    <p className="text-white/40 mt-2 font-light tracking-wide uppercase text-sm flex items-center gap-2">
                        <CalendarDays size={14} />
                        {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                    </p>
                </div>

                {/* AI Insights Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={timeRange}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        className="p-6 md:p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] flex items-start gap-4 md:gap-6"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0 border border-emerald-400/20">
                            <Sparkles className="text-emerald-400" size={20} />
                        </div>
                        <div className="flex-1 mt-1">
                            <span className="text-[10px] text-emerald-400/60 uppercase tracking-[0.2em] font-medium mb-1 block">Sentience Insight</span>
                            {isAiLoading ? (
                                <div className="animate-pulse space-y-2 mt-2">
                                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                    <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <p className="text-lg md:text-xl font-light text-white/90 leading-relaxed italic border-l-2 border-emerald-400/30 pl-4 py-1">
                                    "{aiInsight}"
                                </p>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="animate-spin text-emerald-400" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Core Affect Area Chart */}
                        <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                            <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                                Core Affect Trends (Mood)
                            </h3>
                            <div className="h-[300px] w-full">
                                {moodData.length === 0 ? (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">Not enough mood data for this period.</div>
                                ) : (
                                    <ResponsiveContainer>
                                        <AreaChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValence" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorArousal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={[-1, 1]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                itemStyle={{ color: '#fff', fontSize: '13px' }}
                                            />
                                            <Area type="monotone" dataKey="valence" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValence)" />
                                            <Area type="monotone" dataKey="arousal" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorArousal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* CBT Reframing Bar Chart */}
                        <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl">
                            <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                Thought Reframing Efficacy
                            </h3>
                            <div className="h-[300px] w-full">
                                {cbtData.length === 0 ? (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic">No CBT sessions logged for this period.</div>
                                ) : (
                                    <ResponsiveContainer>
                                        <BarChart data={cbtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                            <Tooltip
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                            <Bar dataKey="initialBelief" name="Initial Belief Severity" fill="#ffffff20" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="finalBelief" name="Belief After Reframing" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Journal Emotion Radar */}
                        <div className="bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-2xl lg:col-span-2">
                            <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-white/50 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                Journal Emotion Constellation
                            </h3>
                            <p className="text-xs text-white/30 mb-4 ml-4">Frequency of emotions detected by AI in your Smart Journal entries.</p>
                            <div className="h-[400px] w-full mt-4">
                                {journalEmotions.length < 3 ? (
                                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-light italic text-center px-4">
                                        Keep logging in your Smart Journal. We need at least 3 distinct emotions detected to map your constellation.
                                    </div>
                                ) : (
                                    <ResponsiveContainer>
                                        <RadarChart data={journalEmotions} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                            <PolarGrid stroke="#ffffff20" />
                                            <PolarAngleAxis dataKey="emotion" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fbbf24' }}
                                            />
                                            <Radar
                                                name="Frequency"
                                                dataKey="count"
                                                stroke="#fbbf24"
                                                strokeWidth={2}
                                                fill="#fbbf24"
                                                fillOpacity={0.2}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
