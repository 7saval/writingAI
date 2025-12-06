import { useEffect, useState, useCallback } from "react";
import type { Project } from "../types/database";
import { fetchProjects } from "../api/projects.api";
import { Link } from "react-router-dom";
import { NewProjectModal } from "./NewProjectModal";

interface Props {
    // onNewProject는 이제 내부에서 처리하므로 선택적 prop으로 변경하거나 제거할 수 있지만, 
    // 외부에서 주입받는 동작을 유지하려면 남겨둡니다. 
    // 여기서는 내부 모달을 사용하도록 변경합니다.
    onNewProject?: () => void;
    projectId?: string;
}

export function ProjectSidebar({ projectId }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadProjects = useCallback(() => {
        fetchProjects().then(setProjects).catch(console.error);
    }, []);

    // 컴포넌트 마운트 시 프로젝트 목록 불러오기
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleProjectCreated = (newProjectId: string) => {
        loadProjects();
        // 필요한 경우 라우팅 처리 등 추가 가능
    };

    return (
        <>
            <aside className="flex h-full flex-col border-r border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-bold text-slate-900">내 프로젝트</h1>
                    <button
                        className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-primary/90"
                        onClick={() => setIsModalOpen(true)}
                    >
                        + 생성
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                    <ul className="space-y-1">
                        {projects.map((p) => {
                            const isActive = String(p.id) === projectId;
                            return (
                                <li key={p.id}>
                                    <Link
                                        to={`/projects/${p.id}/paragraphs`}
                                        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="truncate">{p.title}</div>
                                        <div className="mt-0.5 truncate text-xs text-slate-400">{p.genre}</div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
            {
                isModalOpen && (
                    <NewProjectModal
                        open={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        onProjectCreated={handleProjectCreated}
                    />
                )
            }
        </>
    )
}
