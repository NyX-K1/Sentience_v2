import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MoodEntry } from '../types/mood';
import { calculateDailyAverages } from '../utils/trendCalculations';

interface MoodTimelineProps {
    entries: MoodEntry[];
}

export default function MoodTimeline({ entries }: MoodTimelineProps) {
    const data = useMemo(() => calculateDailyAverages(entries), [entries]);

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-80 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl bg-white/5 p-6 text-center relative overflow-hidden">
                {/* Subtle curve in background resembling the chart they will get */}
                <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 100 20" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                        <path d="M0,10 Q25,20 50,10 T100,10" fill="none" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <span className="text-2xl opacity-50">📈</span>
                    </div>
                    <h3 className="text-lg text-white/70 mb-2 font-medium">Trajectory Unavailable</h3>
                    <p className="text-white/40 text-sm tracking-widest uppercase max-w-xs">Return later once you have logged multiple entries across different days.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-80 bg-white/5 border border-white/10 rounded-3xl p-6 relative">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-xl font-light tracking-wide">Mood Trajectory</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">Valence 30-Day View</span>
            </div>

            <div className="w-full h-full pt-12">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="50%" stopColor="#f43f5e" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val: string) => val.slice(5)} // Show MM-DD
                        />
                        <YAxis
                            domain={[-1, 1]}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            ticks={[-1, -0.5, 0, 0.5, 1]}
                            tickFormatter={(val: number) => {
                                if (val === 1) return 'Positive';
                                if (val === 0) return 'Neutral';
                                if (val === -1) return 'Negative';
                                return '';
                            }}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: 'white' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}
                            formatter={(value: any) => [Math.round(Number(value) * 100) + '%', 'Valence']}
                        />
                        <Area
                            type="monotone"
                            dataKey="valence"
                            stroke="#ffffff"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#splitColor)"
                            dot={{ fill: '#000', stroke: '#fff', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#fff' }}
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
