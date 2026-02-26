import { useState } from 'react';
import { useMoodStore } from '../hooks/useMoodStore';
import MoodCompass, { Quadrant } from '../components/MoodCompass';
import EmotionWheel from '../components/EmotionWheel';
import EmotionBloom from '../components/EmotionBloom';
import ContextPanel from '../components/ContextPanel';
import BackgroundShader from '../components/BackgroundShader';
import WellbeingScore from '../components/WellbeingScore';
import EmotionRhythm from '../components/EmotionRhythm';
import FamilyDistribution from '../components/FamilyDistribution';
import EmotionHeatmap from '../components/EmotionHeatmap';
import PostSaveReflection from '../components/PostSaveReflection';
import Ballpit from '../components/Ballpit';
import { EmotionFamily } from '../types/mood';
import { motion } from 'framer-motion';

const MoodTracker = () => {
    const [activeTab, setActiveTab] = useState<'log' | 'trends'>('log');

    // Logging Flow State
    const [quadrant, setQuadrant] = useState<Quadrant>(null);
    const [family, setFamily] = useState<EmotionFamily | null>(null);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [showContext, setShowContext] = useState(false);

    // Post-Save Flow State
    const [showReflection, setShowReflection] = useState(false);
    const [justSavedEmotionIds, setJustSavedEmotionIds] = useState<string[]>([]);

    const { entries, addEntry } = useMoodStore();

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

        // Store saved IDs for reflection modal
        setJustSavedEmotionIds([...selectedEmotions]);
        setShowReflection(true);

        // Reset flow
        setQuadrant(null);
        setFamily(null);
        setSelectedEmotions([]);
        setShowContext(false);
    };

    const handleContinueFromReflection = () => {
        setShowReflection(false);
        setActiveTab('trends');
    };

    return (
        <div className="min-h-screen bg-black text-white relative font-mono overflow-x-hidden">
            {/* Dynamic Background Shader */}
            <BackgroundShader selectedEmotionIds={selectedEmotions} />

            {/* Ballpit Interactive Background */}
            <div className="fixed inset-0 z-0 pointer-events-auto opacity-50" style={{ position: 'fixed', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
                <Ballpit
                    count={240}
                    gravity={0.1}
                    friction={0.9975}
                    wallBounce={0.95}
                    followCursor={false}
                    colors={[0x0c4a6e, 0x0284c7, 0x38bdf8, 0x818cf8, 0x4f46e5, 0x2e1065]}
                />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 container mx-auto px-4 pt-6 pb-24 md:pb-6 flex flex-col h-screen overflow-hidden pointer-events-none">

                {/* Floating Navigation Pill */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4 pointer-events-auto">
                    <div className="flex space-x-1 bg-black/40 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                        {(['log', 'trends'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    flex-1 py-2.5 px-4 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all duration-300 relative font-medium
                                    ${activeTab === tab ? 'text-black' : 'text-white/40 hover:text-white/80'}
                                `}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabBadge"
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-white rounded-full -z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    />
                                )}
                                <span className="relative z-10">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto pt-24 pb-20 scrollbar-hide relative z-10 pointer-events-auto">
                    {/* Header Title moved into scroll area */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-light tracking-widest text-white/90">TRACK<span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">ER</span></h1>
                    </div>
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
                                    selectedEmotionIds={selectedEmotions}
                                    onSave={handleSave}
                                    onBack={() => setShowContext(false)}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'trends' && (
                        <div className="w-full max-w-5xl mx-auto px-4 lg:px-0 flex flex-col gap-6 pt-4">
                            {/* Top Row: Wellbeing + Distribution */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <WellbeingScore entries={entries} />
                                </div>
                                <div className="lg:col-span-1">
                                    <FamilyDistribution entries={entries} />
                                </div>
                            </div>

                            {/* Bottom Row: Heatmap + Rhythm */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EmotionHeatmap entries={entries} />
                                <EmotionRhythm entries={entries} />
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* Post-Save Reflection Modal */}
            {showReflection && (
                <PostSaveReflection
                    emotionIds={justSavedEmotionIds}
                    onClose={() => setShowReflection(false)}
                    onContinue={handleContinueFromReflection}
                />
            )}

        </div>
    );
};

export default MoodTracker;
