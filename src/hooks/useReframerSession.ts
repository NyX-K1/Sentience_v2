import { useState, useEffect, useCallback, useRef } from 'react';
import { ThoughtReframerSession } from '../types/reframer';

const DRAFT_KEY = 'sentience_reframer_draft';

const createEmptySession = (): ThoughtReframerSession => ({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    isComplete: false,
    situation: '',
    contextTags: [],
    automaticThought: '',
    initialBelief: 50,
    initialEmotions: [],
    identifiedDistortions: [],
    evidenceFor: [],
    evidenceAgainst: [],
    reframedThoughts: [],
    selectedReframe: '',
    finalBelief: 50,
    finalEmotions: [],
    beliefShift: 0,
    copingSuggestions: [],
    source: 'manual'
});

export const useReframerSession = () => {
    const [session, setSession] = useState<ThoughtReframerSession>(createEmptySession);
    const [hasDraft, setHasDraft] = useState(false);
    const startTime = useRef(Date.now());

    // Check for existing draft on mount
    useEffect(() => {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                const parsed = JSON.parse(draft) as ThoughtReframerSession;
                if (!parsed.isComplete) {
                    setHasDraft(true);
                }
            }
        } catch { /* ignore */ }
    }, []);

    const resumeDraft = useCallback(() => {
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                setSession(JSON.parse(draft));
                setHasDraft(false);
            }
        } catch { /* ignore */ }
    }, []);

    const startFresh = useCallback(() => {
        const fresh = createEmptySession();
        setSession(fresh);
        setHasDraft(false);
        startTime.current = Date.now();
        localStorage.removeItem(DRAFT_KEY);
    }, []);

    // Auto-save draft on session changes
    useEffect(() => {
        if (session.situation || session.automaticThought) {
            const updated = { ...session, updatedAt: new Date().toISOString() };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
        }
    }, [session]);

    const updateSession = useCallback((updates: Partial<ThoughtReframerSession>) => {
        setSession(prev => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    }, []);

    const goToStep = useCallback((step: ThoughtReframerSession['currentStep']) => {
        setSession(prev => ({ ...prev, currentStep: step, updatedAt: new Date().toISOString() }));
    }, []);

    const completeSession = useCallback(() => {
        const durationMinutes = Math.round((Date.now() - startTime.current) / 60000);
        const completed: ThoughtReframerSession = {
            ...session,
            isComplete: true,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            beliefShift: session.initialBelief - session.finalBelief,
            durationMinutes
        };

        // Save to history
        try {
            const historyKey = 'sentience_reframer_history';
            const existing = JSON.parse(localStorage.getItem(historyKey) || '[]') as ThoughtReframerSession[];
            existing.unshift(completed);
            localStorage.setItem(historyKey, JSON.stringify(existing));
            localStorage.removeItem(DRAFT_KEY);
        } catch { /* ignore */ }

        setSession(completed);
        return completed;
    }, [session]);

    return {
        session,
        hasDraft,
        resumeDraft,
        startFresh,
        updateSession,
        goToStep,
        completeSession
    };
};
