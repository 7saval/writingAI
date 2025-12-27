import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (password !== repeatPassword) {
            setError("비밀번호가 일치하지 않습니다")
            setIsLoading(false)
            return
        }

        const result = signUp(email, password);

        if (result.success) {
            // 회원가입 후 바로 프로젝트로 이동
            navigate("/projects")
        } else {
            setError(result.error || "회원가입에 실패했습니다")
        }

        setIsLoading(false)
    }

    const signUp = (email: string, password: string) => {
        return {
            success: true,
            error: null,
        }
    }
    return (
        <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">회원가입</CardTitle>
                            <CardDescription>새로운 계정을 만드세요</CardDescription>
                        </CardHeader>
                        <CardContent>
                            `<form onSubmit={handleSignUp}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@email.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">비밀번호</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">최소 6자 이상</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="repeat-password">비밀번호 확인</Label>
                                        <Input
                                            id="repeat-password"
                                            type="password"
                                            required
                                            value={repeatPassword}
                                            onChange={(e) => setRepeatPassword(e.target.value)}
                                        />
                                    </div>
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "계정 생성 중..." : "회원가입"}
                                    </Button>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    이미 계정이 있으신가요?{" "}
                                    <Link to="/login" className="text-primary hover:underline">
                                        로그인
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Signup;