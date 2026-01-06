import { create } from 'zustand';

interface StoreState {
    isLoggedIn: boolean;
    username: string | null;
    accessToken: string | null;
    storeLogin: (username: string, accessToken: string) => void;
    storeLogout: () => void;
    setAccessToken: (token: string) => void;
}

// set함수로 상태 변경
export const useAuthStore = create<StoreState>((set) => ({
    isLoggedIn: false,
    username: null,
    accessToken: null,
    storeLogin: (username: string, accessToken: string) => {
        set(() => ({ isLoggedIn: true, username, accessToken }));
    },
    storeLogout: () => {
        set(() => ({ isLoggedIn: false, username: null, accessToken: null }));
    },
    setAccessToken: (accessToken: string) => {
        set(() => ({ accessToken }));
    }
}));
