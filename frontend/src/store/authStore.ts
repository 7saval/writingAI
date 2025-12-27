import { create } from 'zustand';

interface StoreState {
    isLoggedIn: boolean;
    storeLogin: (token: string) => void;
    storeLogout: () => void;
}

// 로컬 스토리지에 토큰 저장
export const setToken = (token: string) => {
    localStorage.setItem('token', token);
};

// 토큰 가져오기
export const getToken = () => {
    return localStorage.getItem('token');
};

// 토큰 삭제
export const removeToken = () => {
    localStorage.removeItem('token');
};

// set함수로 상태 변경
export const useAuthStore = create<StoreState>((set) => ({
    isLoggedIn: getToken() ? true : false,  // 초기값
    storeLogin: (token: string) => {
        set(() => ({ isLoggedIn: true }));
        setToken(token);
    },
    storeLogout: () => {
        set(() => ({ isLoggedIn: false }));
        removeToken();
    }
}));
