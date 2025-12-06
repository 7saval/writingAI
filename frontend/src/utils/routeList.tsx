import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import WritingSession from "../pages/WritingSession";

export const routeList = [
    {
        path: "/",
        element: <Home />
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