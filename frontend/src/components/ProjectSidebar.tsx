import { useEffect, useState } from "react";
import type { Project } from "../types/database";
import { fetchProjects } from "../api/projects.api";
import { Link } from "react-router-dom";

interface Props {
    onNewProject: () => void;
    onProjectSelect?: (projectId: string) => void;
    selectedProjectId?: string | null;
}

export function ProjectSidebar({ onNewProject, onProjectSelect, selectedProjectId }: Props) {
    const [projects, setProjects] = useState<Project[]>([]);

    // 컴포넌트 마운트 시 프로젝트 목록 불러오기
    useEffect(() => {
        fetchProjects().then((projects) => {
            setProjects(projects);
        });
    }, []);

    return (
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-900">내 프로젝트</h1>
                <button className="btn-primary" onClick={onNewProject}>
                    새 프로젝트
                </button>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                    <li key={p.id} className="card p-4">
                        <Link to={`/projects/${p.id}/paragraphs`} className="text-lg font-medium text-slate-900">
                            {p.title}
                        </Link>
                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {p.genre}
                        </span>
                    </li>
                ))}
            </ul>
        </main>
    )
}