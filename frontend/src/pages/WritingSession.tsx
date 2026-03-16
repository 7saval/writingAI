import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@/components/Editor";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { StoryContextPanel } from "@/components/StoryContextPanel";
import { ChevronLeft, ChevronRight, Menu, X, PanelRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { BREAKPOINTS } from "@/constants/breakpoints";

function WritingSession() {
  const { projectId } = useParams();
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  
  // 브레이크포인트를 기반으로 모바일 여부 판단 (Tailwind lg 기준 1024px)
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.LG - 1}px)`);

  // 화면 크기가 변할 때 사이드바 상태 자동 조절
  useEffect(() => {
    if (isMobile) {
      setIsLeftOpen(false);
      setIsRightOpen(false);
    } else {
      setIsLeftOpen(true);
      setIsRightOpen(true);
    }
  }, [isMobile]);

  const toggleLeft = () => setIsLeftOpen(!isLeftOpen);
  const toggleRight = () => setIsRightOpen(!isRightOpen);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background">
      {/* 모바일용 오버레이 백드롭 */}
      {isMobile && (isLeftOpen || isRightOpen) && (
        <div
          className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => {
            setIsLeftOpen(false);
            setIsRightOpen(false);
          }}
        />
      )}

      {/* 좌측 사이드바 - 프로젝트바 */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out lg:relative overflow-hidden ${
          isLeftOpen 
            ? "w-64 translate-x-0 opacity-100" 
            : "w-0 -translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100"
        }`}
      >
        <div className="h-full w-64 border-r border-slate-200 bg-white">
          <ProjectSidebar projectId={projectId} />
        </div>
        
        {/* 모바일 닫기 버튼 */}
        {isMobile && isLeftOpen && (
          <button
            onClick={() => setIsLeftOpen(false)}
            className="absolute -right-12 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
          >
            <X size={20} className="text-slate-600" />
          </button>
        )}
      </aside>

      {/* 메인 에디터 영역 */}
      <main className="relative flex flex-1 flex-col overflow-hidden bg-background">
        {/* 상단 툴바 / 토글 버튼 영역 (모바일전용) */}
        <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 lg:hidden">
          <button
            onClick={toggleLeft}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="text-sm font-bold text-slate-800 font-outfit">
            Writing AI
          </span>
          <button
            onClick={toggleRight}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"
          >
            <PanelRight size={20} className="text-slate-600" />
          </button>
        </div>

        {/* 데스크탑용 토글 버튼 (플로팅) */}
        {!isMobile && (
          <>
            <button
              onClick={toggleLeft}
              className="absolute top-1/2 z-50 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-slate-200 bg-white text-slate-500 shadow-md transition-all hover:bg-primary hover:text-white left-0"
              title={isLeftOpen ? "접기" : "펼치기"}
            >
              {isLeftOpen ? (
                <ChevronLeft size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            <button
              onClick={toggleRight}
              className="absolute top-1/2 z-50 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-slate-200 bg-white text-slate-500 shadow-md transition-all hover:bg-primary hover:text-white right-0"
              title={isRightOpen ? "접기" : "펼치기"}
            >
              {isRightOpen ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </button>
          </>
        )}

        <div className="flex-1 overflow-hidden">
          <Editor />
        </div>
      </main>

      {/* 우측 사이드바 - 스토리 설정 */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 overflow-hidden ${
          isRightOpen 
            ? "w-80 opacity-100 translate-x-0" 
            : "w-0 translate-x-full opacity-0 lg:opacity-100 lg:translate-x-0"
        }`}
      >
        <div className="h-full w-80 border-l border-slate-200 bg-white">
          <StoryContextPanel projectId={Number(projectId)} />
        </div>

        {/* 모바일 닫기 버튼 */}
        {isMobile && isRightOpen && (
          <button
            onClick={() => setIsRightOpen(false)}
            className="absolute -left-12 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md lg:hidden"
          >
            <X size={20} className="text-slate-600" />
          </button>
        )}
      </aside>
    </div>
  );
}

export default WritingSession;
