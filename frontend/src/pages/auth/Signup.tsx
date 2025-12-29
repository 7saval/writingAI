import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [repeatPassword, setRepeatPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [emailError, setEmailError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isEmailChecked, setIsEmailChecked] = useState(false)
    const navigate = useNavigate()

    // 이메일 중복 확인
    const handleCheckEmail = async () => {
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }

        try {
            const response = await apiClient.post('/auth/check-email', { email });
            setEmailError(response.data.message);
            setIsEmailChecked(true);
        } catch (error: any) {
            setIsEmailChecked(false);
            if (error.response && error.response.status === 409) {
                setEmailError(error.response.data.message);
            } else {
                alert("중복 확인 중 오류가 발생했습니다.");
            }
        }
    }

    // 회원가입
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isEmailChecked) {
            alert("이메일 중복확인을 해주세요.");
            return;
        }

        setIsLoading(true)
        setError(null)

        if (password !== repeatPassword) {
            setError("비밀번호가 일치하지 않습니다")
            setIsLoading(false)
            return
        }

        // 회원가입 API 호출
        try {
            await apiClient.post('/auth/signup', { username, email, password })
            alert("회원가입이 완료되었습니다.");
            navigate("/login");
        } catch (error: any) {
            console.error('회원가입 중 오류 발생:', error);
            // 409 Conflict: 이미 가입된 이메일 (백엔드 메시지 사용)
            if (error.response && error.response.status === 409) {
                setError(error.response.data.message);
            } else {
                alert("회원가입에 실패했습니다.");
            }
        }

        setIsLoading(false)
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
                                        <Label htmlFor="username">사용자명</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="사용자명을 입력하세요."
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example@email.com"
                                                required
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setIsEmailChecked(false);
                                                    setEmailError(null);
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCheckEmail}
                                            >
                                                중복확인
                                            </Button>
                                        </div>
                                    </div>
                                    {emailError && <p className={`text-sm ${isEmailChecked ? 'text-green-600' : 'text-destructive'}`}>{emailError}</p>}
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
                                            onChange={(e) => {
                                                setRepeatPassword(e.target.value)
                                                if (e.target.value !== password) {
                                                    setError("비밀번호가 일치하지 않습니다")
                                                } else {
                                                    setError(null)
                                                }
                                            }}
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