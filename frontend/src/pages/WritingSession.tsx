import Editor from "../components/Editor";
import { ProjectSidebar } from "../components/ProjectSidebar";

function WritingSession() {

    return (
        <div className="flex h-screen bg-background">
            {/* leftSidebar - 프로젝트바 */}
            <ProjectSidebar onNewProject={() => { }} onProjectSelect={() => { }} selectedProjectId={null} />
            {/* 메인 에디터 */}
            <Editor />
            {/* rightSidebar - 시놉시스, 설정집 */}
        </div>
    )
}

export default WritingSession;