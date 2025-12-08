import { useState } from "react"
import { createProject } from "../../api/projects.api"
import { Modal } from "../../components/common/Modal";

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (projectId: string) => void
}

export function NewProjectModal({ open, onOpenChange, onProjectCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title || !genre) return

    try {
      setIsSubmitting(true);
      // @ts-ignore - API expects Project but we send partial
      const newProject = await createProject({
        title,
        genre,
        synopsis: "",
        description: description,
        lorebook: [],
      });

      setTitle("")
      setDescription("")
      setGenre("")
      onOpenChange(false)
      onProjectCreated?.(String(newProject.id))
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="새 프로젝트 만들기"
      description="새로운 글쓰기 프로젝트를 시작하세요"
      footer={
        <>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={!title || !genre || isSubmitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "생성 중..." : "만들기"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="프로젝트 제목을 입력하세요"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-slate-700">설명</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트 정보를 간단히 입력하세요"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="genre" className="text-sm font-medium text-slate-700">장르</label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="" disabled>장르를 선택하세요</option>
            <option value="판타지">판타지</option>
            <option value="SF">SF</option>
            <option value="로맨스">로맨스</option>
            <option value="미스터리">미스터리</option>
            <option value="스릴러">스릴러</option>
            <option value="호러">호러</option>
            <option value="드라마">드라마</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}
