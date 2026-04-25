import { create } from 'zustand';

interface StoreState {
    isLoggedIn: boolean;
    username: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    storeLogin: (username: string, accessToken: string, refreshToken?: string) => void;
    storeLogout: () => void;
    setAccessToken: (token: string) => void;
}

// set함수로 상태 변경
export const useAuthStore = create<StoreState>((set) => ({
    isLoggedIn: false,
    username: null,
    accessToken: null,
    refreshToken: null,
    storeLogin: (username: string, accessToken: string, refreshToken?: string) => {
        set(() => ({ isLoggedIn: true, username, accessToken, refreshToken: refreshToken || null }));
    },
    storeLogout: () => {
        set(() => ({ isLoggedIn: false, username: null, accessToken: null, refreshToken: null }));
    },
    setAccessToken: (accessToken: string) => {
        set(() => ({ accessToken }));
    }
}));
