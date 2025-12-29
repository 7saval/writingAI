import { apiClient } from "@/api/client";
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
}

// 로그인
export const login = async (data: Omit<SignupProps, 'username'>) => {
    const response = await apiClient.post<LoginResponse>(`/auth/login`, data);
    return response.data;
}