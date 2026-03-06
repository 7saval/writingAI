import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkEmail,
  forgotPassword,
  login,
  resetPassword,
  signup,
  googleLogin,
  socialSignup,
  verifyUser,
} from "@/api/auth.api";
import type { LoginProps } from "@/pages/auth/Login";
import type { SignupProps } from "@/pages/auth/Signup";
import { useAuthStore } from "@/store/authStore";
import type { AxiosError } from "axios";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

/**
 * 사용자 인증 상태를 확인하는 Query 훅
 */
export const useAuthUserQuery = () => {
  const { storeLogin, storeLogout } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        const response = await verifyUser();
        if (response.authenticated) {
          storeLogin(response.user.username, response.accessToken);
          return response;
        }
        storeLogout();
        return null;
      } catch (error) {
        storeLogout();
        return null;
      }
    },
    // 사용자가 앱을 사용하는 동안 인증 상태를 유지하기 위해 staleTime 설정
    staleTime: 1000 * 60 * 5, // 5분
    retry: false, // 인증 실패 시 반복 요청 방지
  });
};

/**
 * 로그인 Mutation 훅
 */
export const useLoginMutation = () => {
  const { storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginProps) => {
      const response = await login(data);
      return response;
    },
    onSuccess: (data) => {
      // 로그인 성공 시 전역 상태 업데이트
      if (data.user && data.accessToken) {
        storeLogin(data.user.username, data.accessToken);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

/**
 * 회원가입 Mutation 훅
 */
export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: SignupProps) => {
      const response = await signup(data);
      return response;
    },
  });
};

/**
 * 이메일 중복 확인 Mutation 훅
 */
export const useEmailCheckMutation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await checkEmail({ email });
      return response;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error(error);
    },
  });
};

/**
 * 비밀번호 찾기 Mutation 훅
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await forgotPassword(data);
      return response;
    },
  });
};

/**
 * 비밀번호 재설정 Mutation 훅
 */
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await resetPassword(data);
      return response;
    },
  });
};

/**
 * 구글 로그인 Mutation 훅
 */
export const useGoogleLoginMutation = () => {
  const { storeLogin } = useAuthStore();
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await googleLogin(token);
      return response;
    },
    onSuccess: (data) => {
      if (data.user && data.accessToken) {
        storeLogin(data.user.username, data.accessToken);
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

/**
 * 소셜 회원가입 Mutation 훅
 */
export const useSocialSignupMutation = () => {
  const { storeLogin } = useAuthStore();
  return useMutation({
    mutationFn: async (data: { signupToken: string; nickname: string }) => {
      const response = await socialSignup(data);
      return response;
    },
    onSuccess: (data: any) => {
      if (data.user && data.accessToken) {
        storeLogin(data.user.username, data.accessToken);
      }
    },
  });
};
