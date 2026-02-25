import { useState } from 'react';

const MoodTracker = () => {
    const [activeTab, setActiveTab] = useState<'log' | 'trends' | 'patterns'>('log');

    return (
        <div className="min-h-screen bg-black text-white relative font-mono overflow-x-hidden">
            {/* Dynamic Background Shader Placeholder */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 to-black pointer-events-none" />

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

                {/* Scrollable Tab Content View */}
                <main className="flex-grow overflow-y-auto pb-20 scrollbar-hide">
                    {activeTab === 'log' && (
                        <div className="w-full flex-col flex items-center justify-center min-h-[60vh] opacity-50">
                            <p className="text-xl font-light tracking-widest">[ Compass & Selection Flow UI pending ]</p>
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
