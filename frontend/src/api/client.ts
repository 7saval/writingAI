import axios, { type AxiosRequestConfig } from "axios";
import { refresh } from "./auth.api";
import { useAuthStore } from "@/store/authStore";

export const createClient = (config?: AxiosRequestConfig) => {
    const axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
        headers: {
            "Content-Type": "application/json"
        },
        withCredentials: true, // 쿠키 전송을 위해 필수
        ...config,
    });

    // 요청 인터셉터 : 매 요청마다 최신 토큰 헤더에 추가
    axiosInstance.interceptors.request.use((config) => {
        // const token = getToken();
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    })

    // 응답 인터셉터 : 401 발생 시 토큰 갱신 로직
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            // 401 에러이고 재시도하지 않은 요청인 경우
            // 단, /auth/refresh 요청 자체는 무한 루프 방지를 위해 제외
            if (
                error.response &&
                error.response.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes('/auth/refresh')
            ) {
                originalRequest._retry = true;

                try {
                    // 토큰 갱신 시도
                    const data = await refresh();
                    const newToken = data.accessToken;

                    if (newToken) {
                        useAuthStore.getState().setAccessToken(newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;

                        // 원래 요청 재시도
                        return axiosInstance(originalRequest);
                    } else {
                        // 토큰이 없는 경우 (인증 실패)
                        useAuthStore.getState().storeLogout();
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    // 갱신 실패 시 로그아웃 처리
                    useAuthStore.getState().storeLogout();
                    // window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    )

    return axiosInstance;
}

export const apiClient = createClient();
