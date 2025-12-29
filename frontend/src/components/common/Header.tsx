import { LogOut, PenLine, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";

function Header() {
    const { isLoggedIn, storeLogout } = useAuthStore();
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
                                <Button size="icon" variant="outline" className="rounded-full bg-transparent">
                                    <User className="h-4 w-4" />
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
                                    <DropdownMenuItem onClick={storeLogout} className="flex items-center gap-2 cursor-pointer">
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