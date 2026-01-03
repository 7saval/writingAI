import { checkEmail, forgotPassword, login, resetPassword, signup } from "@/api/auth.api";
import type { LoginProps } from "@/pages/auth/Login";
import type { SignupProps } from "@/pages/auth/Signup";
import { useAuthStore } from "@/store/authStore"
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useState } from "react";

// 로그인 Mutation
export const useLoginMutation = () => {
    const { storeLogin } = useAuthStore();

    return useMutation({
        mutationFn: async (data: LoginProps) => {
            const response = await login(data);
            return response;
        },
        onSuccess: (data) => {
            // 로그인 성공 시 전역 상태 업데이트
            storeLogin(data.user.username);
        },
        onError: (error) => {
            console.error(error);
        }
    })
}

// 회원가입 Muatation
export const useSignupMutation = () => {
    return useMutation({
        mutationFn: async (data: SignupProps) => {
            const response = await signup(data);
            return response;
        }
    })
}

// 이메일 중복 확인 Mutation
export const useEmailCheckMutation = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            const response = await checkEmail({ email });
            return response;
        },
        onSuccess: () => {

        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.error(error);
        }
    })
}

// 비밀번호 찾기 Mutation
export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await forgotPassword(data);
            return response;
        }
    })
}

// 비밀번호 재설정 Mutation
export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await resetPassword(data);
            return response;
        }
    })
}
