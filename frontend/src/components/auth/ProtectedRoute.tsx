import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useAuthQuery } from "@/hooks/useAuthQuery";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isLoggedIn } = useAuthStore();
    const { isLoading } = useAuthQuery();

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center">Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ message: "로그인이 필요한 서비스입니다." }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
