import { useState } from 'react';
import { useMoodStore } from '../hooks/useMoodStore';
import MoodCompass, { Quadrant } from '../components/MoodCompass';
import EmotionWheel from '../components/EmotionWheel';
import EmotionBloom from '../components/EmotionBloom';
import ContextPanel from '../components/ContextPanel';
import BackgroundShader from '../components/BackgroundShader';
import MoodTimeline from '../components/MoodTimeline';
import FamilyDistribution from '../components/FamilyDistribution';
import EmotionHeatmap from '../components/EmotionHeatmap';
import TriggerCorrelation from '../components/TriggerCorrelation';
import InsightCard from '../components/InsightCard';
import CrisisCard from '../components/CrisisCard';
import VocabularyTracker from '../components/VocabularyTracker';
import { usePatternDetection } from '../hooks/usePatternDetection';
import { EmotionFamily } from '../types/mood';
import { HeartHandshake } from 'lucide-react';



const MoodTracker = () => {
    const [activeTab, setActiveTab] = useState<'log' | 'trends' | 'patterns'>('log');

    // Logging Flow State
    const [quadrant, setQuadrant] = useState<Quadrant>(null);
    const [family, setFamily] = useState<EmotionFamily | null>(null);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [showContext, setShowContext] = useState(false);
    const [forceShowCrisis, setForceShowCrisis] = useState(false);

    const { entries, addEntry } = useMoodStore();
    const insights = usePatternDetection(entries);

    const handleToggleEmotion = (id: string) => {
        setSelectedEmotions(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const handleSave = (contextData: { intensity: number; triggers: string[]; customTriggers: string[]; note: string }) => {
        // In a complete implementation, this would calculate true composite valence/arousal from the selected emotions.
        // For Phase 2, we just ensure it saves to the hook.
        addEntry({
            emotions: selectedEmotions.map(id => ({ emotionId: id, intensity: contextData.intensity })),
            compositeValence: 0,
            compositeArousal: 0,
            dominantFamily: family || 'Complex',
            triggers: contextData.triggers,
            customTriggers: contextData.customTriggers,
            freeNote: contextData.note,
            source: 'manual',
            userId: 'local-user', // mocked since no auth system is provided yet
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        // Reset flow
        setQuadrant(null);
        setFamily(null);
        setSelectedEmotions([]);
        setShowContext(false);
        setActiveTab('trends'); // Route to trends after save
    };

    return (
        <div className="min-h-screen bg-black text-white relative font-mono overflow-x-hidden">
            {/* Dynamic Background Shader */}
            <BackgroundShader selectedEmotionIds={selectedEmotions} />

            {/* Main Content Area */}
            <div className="relative z-10 container mx-auto px-4 pt-6 pb-24 md:pb-6 flex flex-col h-screen overflow-hidden">

                {/* Header & Sticky Tab Navigation */}
                <header className="flex-shrink-0 mb-8 z-20 sticky top-0 bg-black/60 backdrop-blur-2xl pt-6 pb-4 border-b border-white/5">
                    <div className="relative z-10 text-center">
                        <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-6">Sentience <span className="font-semibold text-cyan-400">Tracker</span></h1>

                        <div className="flex space-x-2 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-md p-1.5 rounded-full w-full max-w-md mx-auto relative border border-white/10 shadow-2xl">
                            {(['log', 'trends', 'patterns'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        flex-1 py-2 px-4 rounded-full text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all duration-300 relative
                                        ${activeTab === tab ? 'text-black font-semibold' : 'text-zinc-400 hover:text-white'}
                                    `}
                                >
                                    {activeTab === tab && (
                                        <span className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto pb-20 scrollbar-hide relative">
                    {activeTab === 'log' && (
                        <div className="w-full flex-col flex items-center justify-center min-h-[60vh]">
                            {!quadrant && (
                                <MoodCompass selectedQuadrant={quadrant} onSelectQuadrant={setQuadrant} />
                            )}

                            {quadrant && !family && (
                                <EmotionWheel
                                    quadrant={quadrant}
                                    selectedFamily={family}
                                    onSelectFamily={setFamily}
                                    onBack={() => setQuadrant(null)}
                                />
                            )}

                            {family && !showContext && (
                                <EmotionBloom
                                    family={family}
                                    selectedEmotionIds={selectedEmotions}
                                    onToggleEmotion={handleToggleEmotion}
                                    onBack={() => { setFamily(null); setSelectedEmotions([]); }}
                                    onProceed={() => setShowContext(true)}
                                />
                            )}

                            {showContext && (
                                <ContextPanel
                                    onSave={handleSave}
                                    onBack={() => setShowContext(false)}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div className="w-full max-w-5xl mx-auto px-4 lg:px-0 flex flex-col gap-6 pt-4">
                            {/* Top Row: Temporal */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <MoodTimeline entries={entries} />
                                </div>
                                <div className="lg:col-span-1">
                                    <FamilyDistribution entries={entries} />
                                </div>
                            </div>

                            {/* Bottom Row: Categorical / Drill-down */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EmotionHeatmap entries={entries} />
                                <TriggerCorrelation entries={entries} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'patterns' && (
                        <div className="w-full max-w-5xl mx-auto px-4 lg:px-0 flex flex-col gap-6 pt-4">

                            {/* Priority Crisis Intervention (if triggered or forced) */}
                            {(forceShowCrisis || insights.some(i => i.tier === 'crisis')) && (
                                <div className="mb-4">
                                    <CrisisCard />
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* 2/3 Width - Insights Stream */}
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-light tracking-wide">Sentience Insights</h3>
                                        <span className="text-xs text-white/40 uppercase tracking-widest">{insights.length} active patterns</span>
                                    </div>

                                    {insights.length === 0 ? (
                                        <div className="w-full h-40 flex items-center justify-center border border-white/10 rounded-3xl bg-white/5">
                                            <p className="text-white/40 text-sm tracking-widest uppercase text-center px-4">
                                                Log consistently to unlock psychological patterns.
                                            </p>
                                        </div>
                                    ) : (
                                        insights.filter(i => i.tier !== 'crisis').map((insight, index) => (
                                            <InsightCard key={insight.id} index={index} insight={insight} />
                                        ))
                                    )}
                                </div>

                                {/* 1/3 Width - Growth & Tooling */}
                                <div className="lg:col-span-1">
                                    <VocabularyTracker entries={entries} />
                                </div>

                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Global Permanent Distress Button */}
            {!forceShowCrisis && (
                <button
                    onClick={() => setForceShowCrisis(true)}
                    className="fixed bottom-6 right-6 z-50 bg-black/60 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-full p-4 transition-all shadow-lg backdrop-blur-xl group"
                >
                    <HeartHandshake size={24} />
                    <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-black border border-white/10 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Get Support Right Now
                    </span>
                </button>
            )}
        </div>
    );
};

export default MoodTracker;
