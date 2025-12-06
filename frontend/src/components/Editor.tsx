import { useEffect, useState } from "react";
import type { Paragraph, ParagraphWrite } from "../types/database";
import { useParams } from "react-router-dom";
import { fetchProjectParagraphs } from "../api/parapraphs.api";
import { writeParagraph } from "../api/writing.api";
import { StoryContextPanel } from "./StoryContextPanel";

function Editor() {
    const { projectId } = useParams(); // URL에서 projectId 가져오기
    const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 초기 데이터 로드
    useEffect(() => {
        if (!projectId) return;
        fetchProjectParagraphs(Number(projectId)).then((paragraphs) => {
            setParagraphs(paragraphs);
        });
    }, [projectId]);

    // 단락 제출 핸들러
    const handleSubmit = async () => {
        if (!input.trim() || !projectId) return;
        setIsLoading(true);
        try {
            // 유저 입력 전송 및 AI 응답 수신
            const res = await writeParagraph(Number(projectId), input);
            setParagraphs((prev) => [...prev, res.userParagraph, res.aiParagraph]);
            setInput(''); // 입력창 초기화
        } finally {
            setIsLoading(false);
        }
    };

    if (!projectId) {
        return (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
                <p>왼쪽 사이드바에서 프로젝트를 선택해주세요.</p>
            </div>
        );
    }


    return (
        // flex-1 to take up remaining space, h-full to fill parent
        <div className="flex h-full w-full flex-col">
            {/* 메인 글쓰기 영역 */}
            <section className="flex flex-col overflow-hidden bg-white">
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {paragraphs.map((p) => (
                        <article
                            key={p.id}
                            className={`rounded-xl border border-border px-4 py-3 ${p.writtenBy === 'user' ? 'bg-userBg' : 'bg-aiBg'
                                }`}
                        >
                            <strong className="text-sm text-slate-500">
                                {p.writtenBy === 'user' ? '나' : 'AI'}
                            </strong>
                            <p className="mt-1 whitespace-pre-line text-slate-900">{p.content}</p>
                        </article>
                    ))}
                </div>
                {/* 입력 영역 */}
                <div className="border-t border-border p-6">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="이야기를 이어 써보세요"
                        className="h-32 w-full rounded-xl border border-border bg-slate-50 p-4 text-base focus:border-primary focus:outline-none"
                    />
                    <button className="btn-primary mt-4 w-full" disabled={isLoading} onClick={handleSubmit}>
                        {isLoading ? 'AI 작성 중...' : '단락 제출'}
                    </button>
                </div>
            </section>
        </div>
    )
}

export default Editor;