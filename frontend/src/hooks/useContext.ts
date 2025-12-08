import { useEffect, useState } from 'react'
import type { LoreNote } from '../types/database';
import { fetchProjectContexts, updateContext } from '../api/projects.api';

export const useContext = (projectId: number) => {
    const [synopsis, setSynopsis] = useState('');
    const [lorebook, setLorebook] = useState<LoreNote[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 모달이 열릴 때 데이터 fetch
    useEffect(() => {
        setIsLoading(true);
        fetchProjectContexts(projectId)
            .then((contexts) => {
                setLorebook(contexts.lorebook || []);
                setSynopsis(contexts.synopsis || '');
            })
            .catch((error) => {
                console.error("Failed to fetch context", error);
                alert("컨텍스트를 불러오는데 실패했습니다.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const saveContext = async () => {
        if (!confirm("저장하시겠습니까?")) return;

        try {
            setIsSubmitting(true);
            await updateContext(projectId, { synopsis, lorebook });
            alert("저장되었습니다.");
        } catch (error) {
            console.error("Failed to save context", error);
            alert("저장에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const createNote = () => {
        const next = [
            ...lorebook,
            { id: crypto.randomUUID(), category: 'character', title: '새 노트', content: '', tags: [] },
        ];
        setLorebook(next);
    }

    const deleteNote = (idx: number) => {
        if (!confirm("이 노트를 삭제하시겠습니까?")) return;
        const next = lorebook.filter((_, i) => i !== idx);
        setLorebook(next);
    }

    const updateNote = (idx: number, updates: Partial<LoreNote>) => {
        const next = [...lorebook];
        next[idx] = { ...next[idx], ...updates };
        setLorebook(next);
    }

    const updateSynopsis = (value: string) => {
        setSynopsis(value);
    }

    return {
        synopsis,
        lorebook,
        isSubmitting,
        isLoading,
        saveContext,
        createNote,
        deleteNote,
        updateNote,
        updateSynopsis,
    };
};
