import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Home from "@/pages/Home";
import WritingSession from "@/pages/WritingSession";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ResetPassword from "@/pages/auth/ResetPassword";
import ExtraInfo from "@/pages/auth/ExtraInfo";
import ExportPdfPage from "@/pages/ExportPdfPage";

export const routeList = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        path: "/extra-info",
        element: <ExtraInfo />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/reset-password",
        element: <ResetPassword />
    },
    {
        path: "/projects",
        element: (
            <ProtectedRoute>
                <WritingSession />
            </ProtectedRoute>
        )
    },
    {
        path: "/projects/:projectId/paragraphs",
        element: (
            <ProtectedRoute>
                <WritingSession />
            </ProtectedRoute>
        )
    },
    {
        path: "/export/pdf",
        // hidden Electron window가 이 route를 열어 PDF 전용 문서를 렌더링합니다.
        element: <ExportPdfPage />,
        useLayout: false,
    }
]
