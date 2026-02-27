import { useState, useEffect, useCallback } from 'react';
import { ThoughtReframerSession } from '../types/reframer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useReframerHistory = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ThoughtReframerSession[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) {
            setSessions([]);
            setIsLoaded(true);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('thought_reframing_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reframing sessions:', error);
                return;
            }

            if (data) {
                // Map the database rows back to the shape expected by the frontend
                const mappedSessions: ThoughtReframerSession[] = data.map(row => ({
                    id: row.id,
                    createdAt: row.created_at,
                    updatedAt: row.created_at, // Missing in DB, using created_at
                    currentStep: 8,
                    isComplete: true,
                    situation: row.situation_description || '',
                    situationDate: row.situation_date || undefined,
                    contextTags: row.context_tags || [],
                    automaticThought: row.automatic_thought || '',
                    initialBelief: row.initial_belief || 50,
                    initialEmotions: row.initial_emotions || [],
                    // Approximate mapping back from string array to { region, sensation } if needed
                    bodyMapRegions: row.physical_sensations?.map((s: string) => {
                        const parts = s.split(': ');
                        return { region: parts[0] || '', sensation: parts[1] || '' };
                    }) || [],
                    identifiedDistortions: row.cognitive_distortions || [],
                    evidenceFor: row.evidence_supporting ? row.evidence_supporting.split('\n') : [],
                    evidenceAgainst: row.evidence_against ? row.evidence_against.split('\n') : [],
                    reframedThoughts: row.brainstormed_alternatives || [],
                    selectedReframe: row.selected_reframe || '',
                    finalBelief: row.final_belief || 50,
                    finalEmotions: row.final_emotions || [],
                    beliefShift: row.belief_shift || 0,
                    personalTakeaway: row.takeaway || undefined,
                    copingSuggestions: row.coping_strategies || [],
                    durationMinutes: row.duration_minutes || undefined,
                    source: 'manual'
                }));
                setSessions(mappedSessions);
            }
        } catch (err) {
            console.error('Unexpected error fetching sessions:', err);
        } finally {
            setIsLoaded(true);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const deleteSession = useCallback(async (id: string) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('thought_reframing_sessions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error deleting reframing session:', error);
                return;
            }

            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Unexpected error deleting session:', err);
        }
    }, [user]);

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
