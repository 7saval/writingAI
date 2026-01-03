import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/useAuthMutations";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useEffect, useRef } from "react";

export interface LoginProps {
    email: string;
    password: string;
}

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const loginMutation = useLoginMutation();

    const toastShownRef = useRef(false);

    useEffect(() => {
        const message = location.state?.message;
        if (message && !toastShownRef.current) {
            toast({
                title: "알림",
                description: message,
            });
            toastShownRef.current = true;
            // 메시지를 한 번 보여준 후 state를 비워서 새로고침 시 다시 뜨지 않게 함
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, toast, navigate]);

    // react-hook-form 사용
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<LoginProps>();

    const onSubmit = async (data: LoginProps) => {
        try {
            // await userLogin(data);
            await loginMutation.mutateAsync(data);
            navigate("/");
        } catch (error: any) {
            setError("root",
                {
                    type: "manual",
                    message: error.response?.data?.message || "로그인에 실패했습니다"
                }
            );
        };
    };

    // 이메일 로그인
    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setError(null);

    //     login({ email, password })
    //         .then((res) => {
    //             // storeLogin(res.token, res.user.username);
    //             storeLogin(res.user.username);
    //             navigate("/");
    //         })
    //         .catch((error) => {
    //             setError(error.response?.data?.message || "로그인에 실패했습니다");
    //         })
    //         .finally(() => {
    //             setIsLoading(false);
    //         });

    //     // try {
    //     //     const res = await apiClient.post('/auth/login', { email, password });
    //     //     storeLogin(res.data.token);
    //     //     navigate("/");
    //     // } catch (error: any) {
    //     //     const message = error.response?.data?.message || "로그인에 실패했습니다";
    //     //     setError(message);
    //     // } finally {
    //     //     setIsLoading(false);
    //     // }
    // }

    // 구글 로그인
    const handleGoogleLogin = async () => {
        // const supabase = createClient()
        // setIsLoading(true)
        // setError(null)

        try {
            // const { error } = await supabase.auth.signInWithOAuth({
            //     provider: "google",
            //     options: {
            //     redirectTo: `${window.location.origin}/editor`,
            //     },
            // })
            // if (error) throw error
        } catch (error: unknown) {
            // setError(error instanceof Error ? error.message : "Google 로그인에 실패했습니다");
            // setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">로그인</CardTitle>
                            <CardDescription>이메일과 비밀번호를 입력하여 로그인하세요</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <Input
                                            {...register("email",
                                                {
                                                    required: { value: true, message: "이메일을 입력해주세요" },
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: "이메일 형식이 올바르지 않습니다"
                                                    }
                                                }
                                            )}
                                            type="email"
                                            placeholder="example@email.com"
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                                        {/* <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@email.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        /> */}
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">비밀번호</Label>
                                            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                                비밀번호 찾기
                                            </Link>
                                        </div>
                                        <Input
                                            {...register("password",
                                                {
                                                    required: { value: true, message: "비밀번호를 입력해주세요" }
                                                }
                                            )}
                                            type="password"
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                                        {/* <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        /> */}
                                    </div>
                                    {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
                                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                        {loginMutation.isPending ? "로그인 중..." : "로그인"}
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">또는</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full bg-transparent"
                                        onClick={handleGoogleLogin}
                                    // disabled={isLoading}
                                    >
                                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                            <path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </svg>
                                        Google로 로그인
                                    </Button>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    계정이 없으신가요?{" "}
                                    <Link to="/signup" className="text-primary hover:underline">
                                        회원가입
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

export default Login;