import { useState, useEffect, useCallback } from 'react';
import { ThoughtReframerSession } from '../types/reframer';

const HISTORY_KEY = 'sentience_reframer_history';

export const useReframerHistory = () => {
    const [sessions, setSessions] = useState<ThoughtReframerSession[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            if (stored) {
                setSessions(JSON.parse(stored));
            }
        } catch { /* ignore */ }
        setIsLoaded(true);
    }, []);

    const deleteSession = useCallback((id: string) => {
        setSessions(prev => {
            const updated = prev.filter(s => s.id !== id);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const refresh = useCallback(() => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            if (stored) setSessions(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    // Analytics
    const analytics = {
        totalSessions: sessions.length,
        averageBeliefShift: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.beliefShift, 0) / sessions.length)
            : 0,
        mostCommonDistortions: (() => {
            const counts: Record<string, number> = {};
            sessions.forEach(s => s.identifiedDistortions.forEach(d => {
                counts[d] = (counts[d] || 0) + 1;
            }));
            return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([id, count]) => ({ id, count, percentage: Math.round(count / sessions.length * 100) }));
        })(),
        averageDuration: sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / sessions.length)
            : 0,
        contextTagFrequency: (() => {
            const counts: Record<string, number> = {};
            sessions.forEach(s => s.contextTags.forEach(t => {
                counts[t] = (counts[t] || 0) + 1;
            }));
            return Object.entries(counts).sort((a, b) => b[1] - a[1]);
        })()
    };

    return { sessions, isLoaded, deleteSession, refresh, analytics };
};
