import { useState } from "react";
import type { Project } from "@/types/database";
import {
  useProjectsQuery,
  useDeleteProjectMutation,
} from "@/hooks/useProjects";
import { Link, useNavigate } from "react-router-dom";
import { NewProjectModal } from "@/pages/modal/NewProjectModal";
import { EditProjectModal } from "@/pages/modal/EditProjectModal";
import { showAlert, showConfirm } from "@/store/useDialogStore";

interface Props {
  projectId?: string;
}

export function ProjectSidebar({ projectId }: Props) {
  const { data: projects = [] } = useProjectsQuery();
  const { mutateAsync: deleteProjectAsync } = useDeleteProjectMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const navigate = useNavigate();

  // 프로젝트 생성
  const handleCreateProject = (newProjectId: string) => {
    // 새로 생성된 프로젝트로 이동하여 isActive 상태로 만들기
    navigate(`/projects/${newProjectId}/paragraphs`);
  };

  // 프로젝트 수정
  const handleUpdateProject = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();

    setEditingProject(project);
  };

  // 프로젝트 삭제
  const handleDeleteProject = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = await showConfirm(
      "정말로 이 프로젝트를 삭제하시겠습니까? \n삭제된 데이터는 복구할 수 없습니다.",
      "프로젝트 삭제",
    );
    if (!isConfirmed) return;

    deleteProjectAsync(id)
      .then(() => {
        // 만약 삭제한 프로젝트가 현재 활성화된 프로젝트라면 메인으로 이동
        if (String(id) === projectId) {
          // 프로젝트 화면 이동
          navigate("/projects");
        }
      })
      .catch(async (err) => {
        console.error("Failed to delete project:", err);
        await showAlert("프로젝트 삭제에 실패했습니다.");
      });
  };

  return (
    <>
      <div className="flex h-full flex-col bg-slate-50">
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
                <li key={p.id} className="group relative">
                  <Link
                    to={`/projects/${p.id}/paragraphs`}
                    className={`block rounded-md py-2 pl-3 pr-16 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="truncate">{p.title}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-400">
                      {p.genre}
                    </div>
                  </Link>
                  {/* 수정 버튼 */}
                  <button
                    onClick={(e) => handleUpdateProject(e, p)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 opacity-0 hover:bg-slate-200 hover:text-blue-500 group-hover:opacity-100"
                    title="프로젝트 수정"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                  {/* 삭제 버튼 */}
                  <button
                    onClick={(e) => handleDeleteProject(e, Number(p.id))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 opacity-0 hover:bg-slate-200 hover:text-red-500 group-hover:opacity-100"
                    title="프로젝트 삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
</aside>
      {isModalOpen && (
        <NewProjectModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onProjectCreated={handleCreateProject}
        />
      )}
      {editingProject && (
        <EditProjectModal
          open={!!editingProject}
          project={editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onProjectUpdated={() => {
            setEditingProject(null);
          }}
        />
      )}
    </>
  );
}
