import { login, signup } from "@/api/auth.api";
import type { LoginProps } from "@/pages/auth/Login";
import type { SignupProps } from "@/pages/auth/Signup";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    // 상태
    const { storeLogin, storeLogout } = useAuthStore();

    // 회원가입
    const userSignup = (data: SignupProps) => {
        signup(data)
            .then((response) => {
                alert("회원가입이 완료되었습니다.");
                navigate("/login");
            })
            .catch((error) => {
                console.error('회원가입 중 오류 발생:', error);
                // 409 Conflict: 이미 가입된 이메일 (백엔드 메시지 사용)
                if (error.response && error.response.status === 409) {
                    setError(error.response.data.message);
                } else {
                    alert("회원가입에 실패했습니다.");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    // 로그인
    const userLogin = (data: LoginProps) => {
        login(data)
            .then((res) => {
                // storeLogin(res.token, res.user.username);
                storeLogin(res.user.username);
                navigate("/");
            })
            .catch((error) => {
                setError(error.response?.data?.message || "로그인에 실패했습니다");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    // 비밀번호 찾기

    // 비밀번호 초기화

    return {
        userSignup,
        userLogin
    }

};
