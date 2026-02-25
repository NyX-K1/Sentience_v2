import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MoodEntry } from '../types/mood';
import { calculateDailyAverages } from '../utils/trendCalculations';

interface MoodTimelineProps {
    entries: MoodEntry[];
}

export default function MoodTimeline({ entries }: MoodTimelineProps) {
    const data = useMemo(() => calculateDailyAverages(entries), [entries]);

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
                <p className="text-white/40 text-sm tracking-widest uppercase">Insufficient temporal data</p>
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
                    <LineChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: 'white' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}
                            formatter={(value: any) => [Math.round(Number(value) * 100) + '%', 'Valence']}
                        />
                        <Line
                            type="monotone"
                            dataKey="valence"
                            stroke="#ffffff"
                            strokeWidth={3}
                            dot={{ fill: '#000', stroke: '#fff', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#fff' }}
                            animationDuration={2000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
