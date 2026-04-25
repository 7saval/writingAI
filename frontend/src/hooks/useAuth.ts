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
  refresh,
  createDesktopGoogleSession,
  getDesktopGoogleSessionStatus,
  type LoginResponse,
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
          // verifyUser는 토큰을 반환하지 않으므로 기존 스토어의 토큰 유지
          const currentToken = useAuthStore.getState().accessToken;
          storeLogin(response.user.username, currentToken || "");
          return response;
        }

        // 인증 루프 방지를 위해 refresh 시도
        try {
          const refreshData = await refresh();
          if (refreshData.accessToken) {
            // 1. 재시도 전 스토어 업데이트 (apiClient의 request interceptor에서 사용)
            useAuthStore.getState().setAccessToken(refreshData.accessToken);

            // 2. refresh 성공 후 다시 유저 정보 확인
            const retryResponse = await verifyUser();
            if (retryResponse.authenticated) {
              // 3. 얻은 토큰을 포함하여 로그인 상태 완료
              storeLogin(retryResponse.user.username, refreshData.accessToken);
              return retryResponse;
            }
          }
        } catch (refreshError) {
          // refresh 실패 시 조용히 처리 (로그아웃으로 이어짐)
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
    mutationFn: async (data: Pick<LoginProps, "email">) => {
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
    mutationFn: async (data: Parameters<typeof resetPassword>[0]) => {
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
    onSuccess: (data: LoginResponse) => {
      if (data.user && data.accessToken) {
        storeLogin(data.user.username, data.accessToken);
      }
    },
  });
};

/**
 * 데스크톱용 구글 로그인 훅
 */
export const useDesktopGoogleLogin = () => {
  const { storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<
      LoginResponse & { status: string; message?: string }
    > => {
      // 1. 세션 생성
      const { sessionId, authUrl } = await createDesktopGoogleSession();

      // 2. 기본 브라우저에서 인증 URL 열기
      if (window.electron) {
        await window.electron.openExternalUrl(authUrl);
      } else {
        throw new Error("Electron environment not found");
      }

      // 3. 폴링 시작
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const statusData = await getDesktopGoogleSessionStatus(sessionId);

            if (statusData.status === "completed") {
              clearInterval(pollInterval);
              resolve(statusData);
            } else if (statusData.status === "failed") {
              clearInterval(pollInterval);
              reject(new Error(statusData.message || "Google login failed"));
            } else if (statusData.status === "expired") {
              clearInterval(pollInterval);
              reject(new Error("Login session expired. Please try again."));
            }
            // "pending"인 경우 계속 폴링
          } catch (error) {
            clearInterval(pollInterval);
            reject(error);
          }
        }, 2000);

        // 5분 후 타임아웃
        setTimeout(
          () => {
            clearInterval(pollInterval);
            reject(new Error("Login timed out. Please try again."));
          },
          5 * 60 * 1000,
        );
      });
    },
    onSuccess: (data: LoginResponse) => {
      if (data.user && data.accessToken) {
        storeLogin(data.user.username, data.accessToken);
      }
    },
  });
};
