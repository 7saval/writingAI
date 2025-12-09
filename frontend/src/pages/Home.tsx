import { Button } from "@/components/ui/button";
import { BookOpen, PenLine, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                        <Sparkles className="h-4 w-4" />
                        <span>AI와 함께하는 창작의 새로운 경험</span>
                    </div>

                    <h1 className="text-balance mb-6 text-5xl font-bold leading-tight text-foreground lg:text-6xl">
                        AI와 함께 만드는
                        <br />
                        <span className="text-primary">당신만의 이야기</span>
                    </h1>

                    <p className="text-pretty mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Companion Writer는 사용자와 AI가 번갈아가며 한 단락씩 소설을 작성하는
                        <br />
                        인터랙티브 글쓰기 플랫폼입니다. 창의력의 한계를 넘어보세요.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button size="lg" className="gap-2 px-8" asChild>
                            <Link to="/projects">
                                <PenLine className="h-5 w-5" />
                                함께 글쓰기 시작하기
                            </Link>
                        </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <PenLine className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-card-foreground">협업 글쓰기</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                AI와 번갈아가며 단락을 작성하며 예상치 못한 전개와 창의적인 아이디어를 발견하세요.
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-card-foreground">스마트 설정</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                시놉시스와 설정집을 관리하며 일관성 있는 스토리 세계를 구축할 수 있습니다.
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-card-foreground">프로젝트 관리</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                여러 글쓰기 프로젝트를 쉽게 관리하고 언제든지 이어서 작성할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Home;