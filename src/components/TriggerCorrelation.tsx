import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MoodEntry } from '../types/mood';
import { extractTriggerCorrelations } from '../utils/trendCalculations';

interface TriggerCorrelationProps {
    entries: MoodEntry[];
}

export default function TriggerCorrelation({ entries }: TriggerCorrelationProps) {
    const data = useMemo(() => extractTriggerCorrelations(entries), [entries]);

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center border border-white/10 border-dashed rounded-3xl bg-white/5 p-6 text-center">
                <div className="flex items-end gap-2 mb-6 opacity-30">
                    <div className="w-3 h-12 bg-white rounded-t-sm" />
                    <div className="w-3 h-20 bg-emerald-400 rounded-t-sm" />
                    <div className="w-3 h-8 bg-rose-400 rounded-t-sm" />
                    <div className="w-3 h-16 bg-white rounded-t-sm" />
                </div>
                <h3 className="text-lg text-white/70 mb-2 font-medium">Trigger Correlations Hidden</h3>
                <p className="text-white/40 text-sm tracking-widest uppercase max-w-xs">
                    Log emotional contexts (like Work, Health, or Deep Sleep) to see how they impact your valence.
                </p>
            </div>
        );
    }

    // Top 5 and Bottom 5 impact bounds
    const slicedData = data.slice(0, 5).concat(data.slice(-5)).filter((v, i, a) => a.findIndex(t => (t.trigger === v.trigger)) === i).sort((a, b) => a.avgValence - b.avgValence);

    return (
        <div className="w-full h-96 bg-white/5 border border-white/10 rounded-3xl p-6 relative">
            <div className="mb-8">
                <h3 className="text-xl font-light tracking-wide">Trigger Impact</h3>
                <span className="text-xs text-white/50 uppercase tracking-widest mt-1 block">Average Valence by Context</span>
            </div>

            <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slicedData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                        <XAxis
                            type="number"
                            domain={[-1, 1]}
                            tick={false}
                            axisLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="trigger"
                            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value: any, _name: any, props: any) => [
                                `Valence: ${Number(value).toFixed(2)} (${props.payload.count} logs)`,
                                'Impact'
                            ]}
                        />
                        <Bar dataKey="avgValence" radius={[0, 4, 4, 0]}>
                            {slicedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.avgValence > 0 ? '#10b981' : '#f43f5e'} // emerald vs rose
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
