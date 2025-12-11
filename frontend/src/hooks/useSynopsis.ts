import { useEffect, useState } from 'react'
import { fetchProjectContexts, updateContext } from '../api/projects.api';

export const useSynopsis = (projectId: number) => {
    const [synopsis, setSynopsis] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 모달이 열릴 때 데이터 fetch
    useEffect(() => {
        setIsLoading(true);
        fetchProjectContexts(projectId)
            .then((contexts) => {
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
            await updateContext(projectId, { synopsis });
            alert("저장되었습니다.");
        } catch (error) {
            console.error("Failed to save context", error);
            alert("저장에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const updateSynopsis = (value: string) => {
        setSynopsis(value);
    }

    return {
        synopsis,
        isSubmitting,
        isLoading,
        saveContext,
        updateSynopsis,
    };
};