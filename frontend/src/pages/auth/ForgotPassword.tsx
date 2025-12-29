import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [resetToken, setResetToken] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        //     const result = requestPasswordReset(email)

        //     if (result.success) {
        //       // 토큰을 가져와서 다음 페이지로 전달
        //       const token = localStorage.getItem(`reset_token_${email}`)
        //       if (token) {
        //         setResetToken(token)
        //       }
        //     } else {
        //       setError(result.error || "비밀번호 재설정 요청에 실패했습니다")
        //     }

        //     setIsLoading(false)
    }

    const handleContinue = () => {
        // 이메일과 토큰을 URL 파라미터로 전달
        navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`)
    }

    if (resetToken) {
        return (
            <div className="flex min-h-full w-full items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                                <CardTitle className="text-2xl text-center">인증 완료</CardTitle>
                                <CardDescription className="text-center">새 비밀번호를 설정하세요</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 text-center">
                                    <strong>{email}</strong> 계정의 비밀번호를 재설정할 수 있습니다.
                                </p>
                                <Button className="w-full" onClick={handleContinue}>
                                    새 비밀번호 설정하기
                                </Button>
                                <div className="mt-4 text-center text-sm">
                                    <Link to="/auth/login" className="text-primary hover:underline">
                                        로그인으로 돌아가기
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">비밀번호 찾기</CardTitle>
                            <CardDescription>이메일을 입력하여 비밀번호를 재설정하세요</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleResetPassword}>
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
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "확인 중..." : "계속하기"}
                                    </Button>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    <Link to="/login" className="text-primary hover:underline">
                                        로그인으로 돌아가기
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

export default ForgotPassword;