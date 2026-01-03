import { apiClient } from "@/api/client";
import type { LoginProps } from "@/pages/auth/Login";
import type { SignupProps } from "@/pages/auth/Signup";

// 회원가입
export const signup = async (data: SignupProps) => {
    const response = await apiClient.post(`/auth/signup`, data);
    return response.data;
}

// 이메일 중복 확인
export const checkEmail = async (email: Pick<SignupProps, 'email'>) => {
    const response = await apiClient.post(`/auth/check-email`, email);
    return response.data;
}

// 로그인 반환 타입
interface LoginResponse {
    token: string;
    user: {
        username: string;
    };
}

// 로그인
export const login = async (data: LoginProps) => {
    const response = await apiClient.post<LoginResponse>(`/auth/login`, data);
    return response.data;
}

// 로그아웃
export const logout = async () => {
    const response = await apiClient.post(`/auth/logout`);
    return response.data;
}

interface VerifyUserResponse {
    authenticated: boolean;
    message: string;
    user: {
        username: string;
        email: string;
    };
}

// 사용자인증
export const verifyUser = async () => {
    const response = await apiClient.get<VerifyUserResponse>(`/auth/verify-user`);
    return response.data;
}

// 비밀번호 찾기
export const forgotPassword = async (email: Pick<LoginProps, 'email'>) => {
    const response = await apiClient.post(`/auth/forgot-password`, email);
    return response.data;
}

// 비밀번호 초기화
export const resetPassword = async (data: { email: string; code: string; newPassword: string }) => {
    const response = await apiClient.post(`/auth/reset-password`, data);
    return response.data;
}

// 구글 로그인
export const googleLogin = async (token: string) => {
    const response = await apiClient.post<LoginResponse>(`/auth/google`, { token });
    return response.data;
}