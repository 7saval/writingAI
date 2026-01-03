import { LogOut, PenLine, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { logout } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";

function Header() {
    const { isLoggedIn, username } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        try {
            await logout();

            // Google 세션 완전히 제거
            googleLogout();

            navigate("/", { replace: true });

            // 쿼리 무효화를 통해 비동기적으로 인증 상태 업데이트 유도
            queryClient.invalidateQueries({ queryKey: ["authUser"] });

            // 로그아웃 성공 토스트 메시지
            toast({
                description: "로그아웃되었습니다."
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <header className="border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <PenLine className="h-6 w-6 text-primary" />
                        <span className="text-xl font-semibold text-foreground">Companion Writer</span>
                    </Link>
                    <nav className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="rounded-full bg-transparent gap-2 px-3 min-w-[40px]">
                                    <User className="h-4 w-4" />
                                    {isLoggedIn && username && <span className="text-sm font-medium">{username}</span>}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link to="/projects" className="flex items-center gap-2 bg-transparent">
                                        <PenLine className="h-4 w-4" />
                                        글쓰기
                                    </Link>
                                </DropdownMenuItem>
                                {isLoggedIn ? (
                                    // <DropdownMenuItem onClick={storeLogout} className="flex items-center gap-2 cursor-pointer">
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer">
                                        <LogOut className="h-4 w-4" />
                                        로그아웃
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem asChild>
                                        <Link to="/login" className="flex items-center gap-2 cursor-pointer">
                                            <User className="h-4 w-4" />
                                            로그인
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header;