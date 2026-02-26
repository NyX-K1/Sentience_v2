import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Sparkles, Brain, X, Shield, Lightbulb,
    Heart, Activity, ChevronRight, AlertTriangle, Zap,
    MapPin, MessageCircle, HeartPulse, User
} from 'lucide-react';
import { useMoodStore } from '../hooks/useMoodStore';
import { COGNITIVE_DISTORTIONS } from '../data/distortions';
import { emotions as EMOTION_DB } from '../data/emotions';
import DistortionIcon from '../components/thought-reframer/DistortionIcon';
import NeuralBackground from '../components/ui/flow-field-background';

// ─── Types ───
interface DeepAnalysis {
    sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Anxious' | 'Hopeful';
    moodScore: number;
    tags: string[];
    detectedEmotions: string[];       // emotion labels
    cognitiveDistortions: string[];    // distortion IDs
    copingStrategies: string[];
    journalReflection: string;
    insight: string;
    thoughtReframerSuggested: boolean;
}

const GUIDED_PROMPTS = [
    { id: 'situation', Icon: MapPin, label: 'What happened?', placeholder: 'Describe the situation or event...' },
    { id: 'thought', Icon: MessageCircle, label: 'What went through your mind?', placeholder: 'What was your automatic thought...' },
    { id: 'feeling', Icon: HeartPulse, label: 'How did it make you feel?', placeholder: 'Name the emotions you felt...' },
    { id: 'body', Icon: User, label: 'Where did you feel it in your body?', placeholder: 'Tight chest, racing heart, heavy shoulders...' },
];

const GROQ_API_KEY = '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';

const DISTORTION_NAMES: Record<string, string> = {};
COGNITIVE_DISTORTIONS.forEach(d => { DISTORTION_NAMES[d.id] = d.name; });

// ─── Component ───
export default function SmartJournalling2() {
    const navigate = useNavigate();
    const { entries } = useMoodStore();
    const [journalText, setJournalText] = useState('');
    const [guidedResponses, setGuidedResponses] = useState<Record<string, string>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [activeGuide, setActiveGuide] = useState<string | null>(null);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Recent mood context from the mood tracker
    const recentMood = useMemo(() => {
        const recent = entries.slice(0, 5);
        if (recent.length === 0) return null;
        const avgValence = recent.reduce((s, e) => s + e.compositeValence, 0) / recent.length;
        const topEmotions = recent.flatMap(e => e.emotions.map(em => {
            const def = EMOTION_DB.find(d => d.id === em.emotionId);
            return def?.label || em.emotionId;
        })).slice(0, 6);
        const uniqueEmotions = [...new Set(topEmotions)];
        return { avgValence, uniqueEmotions, count: recent.length };
    }, [entries]);

    // Build the full text for AI analysis
    const buildFullText = () => {
        let full = journalText;
        GUIDED_PROMPTS.forEach(p => {
            const val = guidedResponses[p.id];
            if (val?.trim()) {
                full += `\n\n${p.label}\n${val.trim()}`;
            }
        });
        return full.trim();
    };

    const distortionIds = COGNITIVE_DISTORTIONS.map(d => d.id).join(', ');

    const handleAnalyze = async () => {
        const fullText = buildFullText();
        if (!fullText) return;
        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    response_format: { type: 'json_object' },
                    messages: [
                        {
                            role: 'system',
                            content: `You are Sentience, an empathetic AI mental health companion. Analyze the user's journal entry deeply.
Return ONLY raw JSON matching this schema exactly:
{
  "sentiment": "Positive" | "Neutral" | "Negative" | "Anxious" | "Hopeful",
  "moodScore": number (1-10),
  "tags": ["string"],
  "detectedEmotions": ["emotion label"] (pick 2-5 emotions that best describe what the user is feeling),
  "cognitiveDistortions": ["distortion-id"] (from this list: ${distortionIds}. Only include if clearly present. Can be empty array.),
  "copingStrategies": ["string"] (3-5 specific, actionable coping strategies),
  "journalReflection": "string" (a thoughtful reflection question for the user),
  "insight": "string" (a brief 1-2 sentence therapeutic insight),
  "thoughtReframerSuggested": boolean (true if cognitive distortions are significant enough to warrant a CBT exercise)
}`
                        },
                        { role: 'user', content: fullText }
                    ]
                })
            });

            const data = await resp.json();
            const content = data.choices?.[0]?.message?.content || '{}';
            const parsed: DeepAnalysis = JSON.parse(content);
            setAnalysis(parsed);
            setShowModal(true);
        } catch (err) {
            console.error('Smart Journal 2 analysis failed:', err);
            alert('Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const goToReframer = () => {
        navigate('/thought-reframer');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/50 to-violet-950 text-white relative overflow-hidden">
            {/* Calming Neural Shader */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                <NeuralBackground color="#7c3aed" particleCount={250} speed={0.4} trailOpacity={0.06} />
            </div>
            {/* Ambient orbs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-10 right-[5%] w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[80px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <Link to="/sentience" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Back</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Brain size={18} className="text-violet-400" />
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Smart Journal 2</span>
                </div>
            </div>

            {/* Main Grid */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ─── Left: Guided Prompts ─── */}
                <div className="lg:col-span-3 space-y-3">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Guided Prompts</h3>
                    {GUIDED_PROMPTS.map(p => (
                        <motion.button
                            key={p.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveGuide(activeGuide === p.id ? null : p.id)}
                            className={`w-full text-left p-3 rounded-2xl border transition-all ${activeGuide === p.id
                                ? 'bg-violet-500/15 border-violet-500/30 ring-1 ring-violet-500/20'
                                : guidedResponses[p.id]?.trim()
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/[.07]'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <p.Icon size={14} className="text-violet-400" />
                                <span className="text-sm font-medium text-white/70">{p.label}</span>
                            </div>
                            {guidedResponses[p.id]?.trim() && (
                                <p className="text-xs text-white/40 truncate ml-7">{guidedResponses[p.id]}</p>
                            )}
                        </motion.button>
                    ))}

                    {/* Active Guide Input */}
                    <AnimatePresence>
                        {activeGuide && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <textarea
                                    autoFocus
                                    value={guidedResponses[activeGuide] || ''}
                                    onChange={e => setGuidedResponses(prev => ({ ...prev, [activeGuide]: e.target.value }))}
                                    placeholder={GUIDED_PROMPTS.find(p => p.id === activeGuide)?.placeholder}
                                    className="w-full h-24 bg-white/5 border border-violet-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 resize-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Recent Mood Context */}
                    {recentMood && (
                        <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity size={14} className="text-cyan-400" />
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Mood Context</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${recentMood.avgValence > 0.3 ? 'bg-emerald-400' : recentMood.avgValence < -0.3 ? 'bg-rose-400' : 'bg-slate-400'}`} />
                                <span className="text-sm text-white/60">
                                    {recentMood.avgValence > 0.3 ? 'Trending positive' : recentMood.avgValence < -0.3 ? 'Trending low' : 'Emotionally neutral'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {recentMood.uniqueEmotions.map(e => (
                                    <span key={e} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40 border border-white/5">{e}</span>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/20 mt-2">Last {recentMood.count} entries</p>
                        </div>
                    )}
                </div>

                {/* ─── Center: Main Editor ─── */}
                <div className="lg:col-span-6 flex flex-col">
                    <div className="mb-4">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                            Deep Reflection
                        </h1>
                        <p className="text-white/30 text-sm mt-1">{dateStr}</p>
                    </div>

                    <div className="flex-1 relative min-h-[60vh]">
                        <textarea
                            value={journalText}
                            onChange={e => setJournalText(e.target.value)}
                            placeholder="Let everything flow here. No judgment, no filter. Write what feels real..."
                            className="w-full h-full bg-white/[.03] hover:bg-white/[.05] focus:bg-white/[.05] border border-white/10 rounded-3xl p-8 text-lg leading-relaxed text-white/90 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all resize-none backdrop-blur-sm"
                        />

                        {/* Analyze Button */}
                        <div className="absolute bottom-6 right-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || (!journalText.trim() && !Object.values(guidedResponses).some(v => v?.trim()))}
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg ${isAnalyzing
                                    ? 'bg-violet-500/20 text-violet-300 cursor-wait'
                                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-violet-500/25'
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <><Sparkles size={16} className="animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Save size={16} /> Save & Reflect</>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* ─── Right: Insights Preview ─── */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Intelligence</h3>

                    {/* CBT Distortion Quick Reference */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={14} className="text-amber-400" />
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Common Traps</span>
                        </div>
                        <div className="space-y-2">
                            {COGNITIVE_DISTORTIONS.slice(0, 5).map(d => (
                                <div key={d.id} className="flex items-center gap-2">
                                    <DistortionIcon distortionId={d.id} size={14} color={d.colorAccent} />
                                    <span className="text-xs text-white/40">{d.name}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/thought-reframer" className="flex items-center gap-1 mt-3 text-[10px] text-violet-400 hover:text-violet-300 uppercase tracking-widest font-medium">
                            View all 16 <ChevronRight size={10} />
                        </Link>
                    </div>

                    {/* CBT Sessions */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain size={14} className="text-violet-400" />
                            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Quick Actions</span>
                        </div>
                        <Link to="/thought-reframer" className="block w-full p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl hover:bg-violet-500/15 transition-colors">
                            <p className="text-sm text-violet-200 font-medium">Start CBT Session</p>
                            <p className="text-[10px] text-violet-300/40 mt-0.5">8-step guided thought reframing</p>
                        </Link>
                        <Link to="/mood-tracker" className="block w-full p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/15 transition-colors mt-2">
                            <p className="text-sm text-cyan-200 font-medium">Log Mood</p>
                            <p className="text-[10px] text-cyan-300/40 mt-0.5">951-emotion precision tracker</p>
                        </Link>
                    </div>
                </div>
            </main>

            {/* ─── Post-Save Reflection Modal ─── */}
            <AnimatePresence>
                {showModal && analysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 40, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl">
                                    <Sparkles className="text-violet-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Deep Insight</h2>
                                    <p className="text-white/40 text-sm">AI-powered reflection on your entry</p>
                                </div>
                            </div>

                            {/* Sentiment Badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest border ${analysis.sentiment === 'Positive' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                                    : analysis.sentiment === 'Negative' ? 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                                        : analysis.sentiment === 'Anxious' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                                            : analysis.sentiment === 'Hopeful' ? 'text-violet-400 bg-violet-400/10 border-violet-400/20'
                                                : 'text-sky-400 bg-sky-400/10 border-sky-400/20'
                                    }`}>{analysis.sentiment}</span>
                                <span className="text-white/30 text-sm">Mood Score: <strong className="text-white/60">{analysis.moodScore}/10</strong></span>
                            </div>

                            {/* Detected Emotions */}
                            {analysis.detectedEmotions?.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Heart size={14} className="text-pink-400" />
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Detected Emotions</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.detectedEmotions.map((em, i) => {
                                            const emotionDef = EMOTION_DB.find(e => e.label.toLowerCase() === em.toLowerCase());
                                            return (
                                                <span key={i} className="px-3 py-1.5 rounded-xl text-sm font-medium border" style={{
                                                    backgroundColor: (emotionDef?.colorHex || '#6366f1') + '15',
                                                    borderColor: (emotionDef?.colorHex || '#6366f1') + '30',
                                                    color: emotionDef?.colorHex || '#a5b4fc'
                                                }}>
                                                    {em}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Cognitive Distortions */}
                            {analysis.cognitiveDistortions?.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle size={14} className="text-amber-400" />
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Thought Patterns Detected</span>
                                    </div>
                                    <div className="space-y-2">
                                        {analysis.cognitiveDistortions.map(id => {
                                            const d = COGNITIVE_DISTORTIONS.find(cd => cd.id === id);
                                            if (!d) return null;
                                            return (
                                                <div key={id} className="p-3 rounded-xl border flex items-start gap-3" style={{
                                                    backgroundColor: d.colorAccent + '10',
                                                    borderColor: d.colorAccent + '25'
                                                }}>
                                                    <DistortionIcon distortionId={id} size={20} color={d.colorAccent} />
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: d.colorAccent }}>{d.name}</p>
                                                        <p className="text-xs text-white/40 mt-0.5">{d.hook}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {analysis.tags?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Themes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-sm text-indigo-200 border border-white/5">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Insight */}
                            <div className="bg-white/5 rounded-2xl p-5 border-l-2 border-indigo-400 mb-6">
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Insight</p>
                                <p className="text-sm text-white/80 italic leading-relaxed">"{analysis.insight}"</p>
                            </div>

                            {/* Reflection Question */}
                            <div className="text-center p-6 bg-gradient-to-b from-violet-500/10 to-transparent rounded-2xl border border-violet-500/20 mb-6">
                                <Lightbulb size={24} className="text-violet-400 mx-auto mb-3" />
                                <p className="text-lg font-medium text-violet-100 leading-snug">{analysis.journalReflection}</p>
                                <p className="text-[10px] text-white/30 mt-3 uppercase tracking-widest">Sentience Asks</p>
                            </div>

                            {/* Coping Strategies */}
                            {analysis.copingStrategies?.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Zap size={14} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Steps to Take</span>
                                    </div>
                                    <div className="space-y-2">
                                        {analysis.copingStrategies.map((s, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                                                <span className="text-emerald-400 font-bold text-sm mt-0.5">{i + 1}</span>
                                                <p className="text-sm text-white/70">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA: Thought Reframer */}
                            {analysis.thoughtReframerSuggested && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={goToReframer}
                                    className="w-full p-5 bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 border border-violet-500/30 rounded-2xl flex items-center gap-4 hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/10 mb-4"
                                >
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <Brain className="text-white" size={22} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-white font-bold">Start Thought Reframer</p>
                                        <p className="text-white/50 text-xs mt-0.5">
                                            We detected thought patterns worth exploring. Try the guided CBT exercise.
                                        </p>
                                    </div>
                                    <ChevronRight className="text-white/50" size={20} />
                                </motion.button>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 font-medium hover:bg-white/10 transition-colors"
                            >
                                Close Reflection
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
