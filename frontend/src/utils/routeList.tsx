import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Home from "@/pages/Home";
import WritingSession from "@/pages/WritingSession";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ResetPassword from "@/pages/auth/ResetPassword";

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
    }
]