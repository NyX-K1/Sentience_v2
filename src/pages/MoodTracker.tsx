import { useState } from 'react';
import { useMoodStore } from '../hooks/useMoodStore';
import MoodCompass, { Quadrant } from '../components/MoodCompass';
import EmotionWheel from '../components/EmotionWheel';
import EmotionBloom from '../components/EmotionBloom';
import ContextPanel from '../components/ContextPanel';
import BackgroundShader from '../components/BackgroundShader';
import { EmotionFamily } from '../types/mood';



const MoodTracker = () => {
    const [activeTab, setActiveTab] = useState<'log' | 'trends' | 'patterns'>('log');

    // Logging Flow State
    const [quadrant, setQuadrant] = useState<Quadrant>(null);
    const [family, setFamily] = useState<EmotionFamily | null>(null);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [showContext, setShowContext] = useState(false);

    const { addEntry } = useMoodStore();

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
                <header className="flex-shrink-0 mb-8 z-20 sticky top-0 bg-black/80 backdrop-blur-md pt-4 pb-4 border-b border-white/10">
                    <h1 className="text-3xl font-light tracking-wide mb-6">Mood Tracker</h1>

                    <div className="flex space-x-2 bg-white/5 p-1 rounded-full w-full max-w-md mx-auto relative">
                        {(['log', 'trends', 'patterns'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                    flex-1 py-2 px-4 rounded-full text-sm uppercase tracking-wider transition-all duration-300 relative
                    ${activeTab === tab ? 'text-black font-medium' : 'text-zinc-400 hover:text-white'}
                  `}
                            >
                                {activeTab === tab && (
                                    <span className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                )}
                                {tab}
                            </button>
                        ))}
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
                        <div className="w-full flex-col flex items-center justify-center min-h-[60vh] opacity-50">
                            <p className="text-xl font-light tracking-widest">[ Trends Data Visualization UI pending ]</p>
                        </div>
                    )}

                    {activeTab === 'patterns' && (
                        <div className="w-full flex-col flex items-center justify-center min-h-[60vh] opacity-50">
                            <p className="text-xl font-light tracking-widest">[ Insight & Nudge UI pending ]</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MoodTracker;
