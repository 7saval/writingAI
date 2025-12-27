import { getToken, removeToken } from "@/store/authStore";
import axios, { type AxiosRequestConfig } from "axios";


export const createClient = (config?: AxiosRequestConfig) => {
    const axiosInstance = axios.create({
        // baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api',
        baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
        headers: {
            "Content-Type": "application/json"
        },
        ...config,
    });

    // 요청 인터셉터 : 매 요청마다 최신 토큰 헤더에 추가
    axiosInstance.interceptors.request.use((config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    })

    // 응답 인터셉터 : 401 발생 시 로그아웃 처리
    axiosInstance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            // 토큰이 없을 때
            if (error.response && error.response.status === 401) {
                removeToken();
                window.location.href = '/login';
                return;
            }
            return Promise.reject(error);
        })

    return axiosInstance;
}

export const apiClient = createClient();