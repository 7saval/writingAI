
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Home from "@/pages/Home";
import WritingSession from "@/pages/WritingSession";

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
        path: "/projects",
        element: <WritingSession />
    },
    {
        path: "/projects/:projectId/paragraphs",
        element: <WritingSession />
    }
]