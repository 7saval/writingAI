import { useQuery } from "@tanstack/react-query";
import { verifyUser } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

export const useAuthQuery = () => {
    const { storeLogin, storeLogout } = useAuthStore();

    return useQuery({
        queryKey: ["authUser"],
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
