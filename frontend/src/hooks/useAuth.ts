import { checkEmail, login, signup } from "@/api/auth.api";
import type { LoginProps } from "@/pages/auth/Login";
import type { SignupProps } from "@/pages/auth/Signup";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isEmailChecked, setIsEmailChecked] = useState(false);

    // 상태
    const { storeLogin, storeLogout } = useAuthStore();

    // 회원가입
    const userSignup = async (data: SignupProps) => {
        await signup(data);
    }

    // 이메일 중복 확인
    const userEmailCheck = async (email: string) => {
        setIsLoading(true);
        setEmailError(null);

        try {
            const res = await checkEmail({ email });
            setEmailError(res.message);
            setIsEmailChecked(true);
        } catch (error: any) {
            setIsEmailChecked(false);
            console.error('이메일 중복 확인 중 오류 발생:', error);
            if (error.response && error.response.status === 409) {
                setEmailError(error.response.data.message);
                throw new Error(error.response.data.message);
            } else {
                const errorMessage = "중복 확인 중 오류가 발생했습니다.";
                setEmailError(errorMessage);
                throw new Error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }

    // 로그인
    const userLogin = async (data: LoginProps) => {
        const res = await login(data);
        storeLogin(res.user.username);
    }

    // 비밀번호 찾기

    // 비밀번호 초기화

    return {
        userSignup,
        userEmailCheck,
        userLogin,
        emailError,
        isEmailChecked,
        isLoading
    }

};
