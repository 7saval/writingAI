import { useParams } from "react-router-dom";
import Editor from "../components/Editor";
import { ProjectSidebar } from "../components/ProjectSidebar";
import { StoryContextPanel } from "../components/StoryContextPanel";


function WritingSession() {
    const { projectId } = useParams(); // URL에서 projectId 가져오기
    return (
        <div className="flex w-full h-full bg-background">
            {/* leftSidebar - 프로젝트바 */}
            <div className="flex-[2] overflow-hidden">
                <ProjectSidebar
                    onNewProject={() => {
                        // TODO: 새 프로젝트 생성 모달 구현 필요
                        console.log("New Project Clicked");
                    }}
                    projectId={projectId}
                />
            </div>
            {/* 메인 에디터 영역 - 스크롤 가능하도록 설정 */}
            <div className="flex flex-col overflow-hidden flex-[6]">
                <Editor />
            </div>
            {/* 우측 사이드바 (설정집) */}
            <div className="flex-[2] overflow-hidden">
                <StoryContextPanel projectId={Number(projectId)} />
            </div>
        </div>
    )
}

export default WritingSession;