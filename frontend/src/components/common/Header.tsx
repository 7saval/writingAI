import { PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Header() {
    return (
        <header className="border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <PenLine className="h-6 w-6 text-primary" />
                        <span className="text-xl font-semibold text-foreground">Companion Writer</span>
                    </Link>
                    <Button variant="ghost" className="flex items-center gap-2">
                        <Link to="/projects" className="flex items-center gap-2 bg-transparent">
                            <PenLine className="h-4 w-4" />
                            글쓰기
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Header;