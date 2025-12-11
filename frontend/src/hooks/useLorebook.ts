import { useEffect, useState } from 'react'
import type { LoreNote } from '../types/database';
import { CATEGORY_OPTIONS } from '../constants/categoryOptions';
import { fetchProjectContexts, updateContext } from '../api/projects.api';

export const useLorebook = (projectId: number) => {
    const [lorebook, setLorebook] = useState<LoreNote[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tagInputs, setTagInputs] = useState<{ [key: string]: string }>({});  // 각 노트별 태그 입력 상태 관리

    // 모달이 열릴 때 데이터 fetch
    useEffect(() => {
        setIsLoading(true);
        fetchProjectContexts(projectId)
            .then((contexts) => {
                setLorebook(contexts.lorebook || []);
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
            await updateContext(projectId, { lorebook });
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
            { id: crypto.randomUUID(), category: CATEGORY_OPTIONS[0].value, title: '새 노트', content: '', tags: [] },
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

    const updateTagInput = (id: string, value: string) => {
        setTagInputs(prev => ({ ...prev, [id]: value }));
    }

    // 태그 추가 핸들러
    const handleAddTag = (noteIdx: number, noteId: string) => {
        const tagValue = tagInputs[noteId]?.trim();
        if (!tagValue) return;

        const currentTags = lorebook[noteIdx].tags || [];
        if (!currentTags.includes(tagValue)) {
            updateNote(noteIdx, { tags: [...currentTags, tagValue] });
        }

        // 입력 필드 초기화
        setTagInputs(prev => ({ ...prev, [noteId]: '' }));
    };

    // 태그 삭제 핸들러
    const handleRemoveTag = (noteIdx: number, tagToRemove: string) => {
        const currentTags = lorebook[noteIdx].tags || [];
        updateNote(noteIdx, { tags: currentTags.filter(tag => tag !== tagToRemove) });
    };

    // Enter 키로 태그 추가
    const handleTagKeyDown = (e: React.KeyboardEvent, noteIdx: number, noteId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(noteIdx, noteId);
        }
    };

    // 태그 색상 배열 (다양한 색상)
    const tagColors = [
        'bg-blue-100 text-blue-700 border-blue-300',
        'bg-green-100 text-green-700 border-green-300',
        'bg-purple-100 text-purple-700 border-purple-300',
        'bg-pink-100 text-pink-700 border-pink-300',
        'bg-yellow-100 text-yellow-700 border-yellow-300',
        'bg-indigo-100 text-indigo-700 border-indigo-300',
        'bg-red-100 text-red-700 border-red-300',
        'bg-orange-100 text-orange-700 border-orange-300',
    ];

    // 태그 이름을 기반으로 색상 선택 (일관성 유지)
    const getTagColor = (tag: string) => {
        const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return tagColors[hash % tagColors.length];
    };

    return {
        lorebook,
        isSubmitting,
        isLoading,
        tagInputs,
        saveContext,
        createNote,
        deleteNote,
        updateNote,
        updateTagInput,
        handleAddTag,
        handleRemoveTag,
        handleTagKeyDown,
        getTagColor,
    };
};
