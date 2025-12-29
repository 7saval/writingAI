import { create } from 'zustand';

interface StoreState {
    isLoggedIn: boolean;
    username: string | null;
    // storeLogin: (token: string) => void;
    // storeLogin: (token: string, username: string) => void;
    storeLogin: (username: string) => void;
    storeLogout: () => void;
}

// // 로컬 스토리지에 토큰 저장
// export const setToken = (token: string) => {
//     localStorage.setItem('token', token);
// };

// // 토큰 가져오기
// export const getToken = () => {
//     return localStorage.getItem('token');
// };

// // 토큰 삭제
// export const removeToken = () => {
//     localStorage.removeItem('token');
// };

// // 로컬 스토리지에 유저명 저장
// export const setUsername = (username: string) => {
//     localStorage.setItem('username', username);
// };

// // 유저명 가져오기
// export const getUsername = () => {
//     return localStorage.getItem('username');
// };

// // 유저명 삭제
// export const removeUsername = () => {
//     localStorage.removeItem('username');
// };

// set함수로 상태 변경
export const useAuthStore = create<StoreState>((set) => ({
    // isLoggedIn: getToken() ? true : false,  // 초기값
    // username: getUsername(), // 초기값
    // storeLogin: (token: string, username: string) => {
    isLoggedIn: false, // 초기값 (새로고침 시 useEffect에서 verifyUser로 확인)
    username: null,
    // storeLogin: (token: string, username: string) => {
    //     set(() => ({ isLoggedIn: true, username }));
    //     setToken(token);
    //     setUsername(username);
    // },
    storeLogin: (username: string) => {
        set(() => ({ isLoggedIn: true, username }));
        // setToken(token); // 쿠키 방식에서는 토큰 저장 안함
        // setUsername(username); // 선택사항: 닉네임은 로컬스토리지에 저장해도 됨 (여기서는 주석 처리)
    },
    storeLogout: () => {
        set(() => ({ isLoggedIn: false, username: null }));
        // removeToken();
        // removeUsername();
    }
}));
