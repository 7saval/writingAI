import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { verifyUser } from "@/api/auth.api";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isLoggedIn } = useAuthStore();
    const [isLoading, setIsLoading] = useState(!isLoggedIn);

    useEffect(() => {
        const checkStatus = async () => {
            if (!isLoggedIn) {
                try {
                    const response = await verifyUser();
                    if (response.authenticated) {
                        useAuthStore.setState({
                            isLoggedIn: true,
                            username: response.user.username,
                        });
                    }
                } catch (error) {
                    // 인증 실패 시 처리 없음 (isLoggedIn은 false로 유지됨)
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [isLoggedIn]);

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center">Loading...</div>; // 로딩 처리 (필요시 컴포넌트로 교체)
    }

    if (!isLoggedIn) {
        // 로그인이 안 되어 있다면 로그인 페이지로 리다이렉트하며 메시지 전달
        return <Navigate to="/login" state={{ message: "로그인이 필요한 서비스입니다." }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
