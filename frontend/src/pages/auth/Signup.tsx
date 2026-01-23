import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignupMutation, useEmailCheckMutation } from "@/hooks/useAuthMutations";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export interface SignupProps {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
}

const Signup = () => {
    const navigate = useNavigate();
    // const { userSignup,
    //     userEmailCheck,
    //     emailError,
    //     isEmailChecked,
    //     isLoading } = useAuth();
    const signupMutation = useSignupMutation();
    const emailCheckMutation = useEmailCheckMutation();

    // react-hook-form 사용
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        getValues,
        formState: { errors }
    } = useForm<SignupProps>();

    const onSubmit = async (data: SignupProps) => {
        // 이메일 중복 확인 여부 체크
        if (!emailCheckMutation.isSuccess) {
            alert("이메일 중복 확인을 해주세요.");
            return;
        }

        try {
            // await userSignup(data);
            await signupMutation.mutateAsync(data);
            alert("회원가입이 완료되었습니다.");
            navigate('/login');
        } catch (error: any) {
            console.error('회원가입 중 오류 발생:', error);
            setError("root", {
                type: "manual",
                message: error.response?.data?.message || "회원가입에 실패했습니다."
            });
        }
    };

    // 이메일 중복 확인
    const handleCheckEmail = async () => {
        const email = getValues("email");

        // 이메일 유효성 검사
        if (!email) {
            setError("email", {
                type: "manual",
                message: "이메일을 입력해주세요."
            });
            return;
        }

        // 이메일 형식 검사
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError("email", {
                type: "manual",
                message: "이메일 형식이 올바르지 않습니다."
            });
            return;
        }

        // 이메일 형식이 올바르면 react-hook-form 에러 클리어
        clearErrors("email");

        try {
            // await userEmailCheck(email);
            await emailCheckMutation.mutateAsync(email)
        } catch (error) {
            // 에러는 mutation에서 자동으로 처리됨
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
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">사용자명</Label>
                                        <Input
                                            {...register("username", {
                                                required: { value: true, message: "사용자명을 입력해주세요." }
                                            })}
                                            placeholder="사용자명을 입력하세요."
                                        />
                                        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                                        {/* <Input
                                            id="username"
                                            type="text"
                                            placeholder="사용자명을 입력하세요."
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        /> */}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">이메일</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                {...register("email",
                                                    {
                                                        required: { value: true, message: "이메일을 입력해주세요." },
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: "이메일 형식이 올바르지 않습니다"
                                                        },
                                                    }
                                                )}
                                                type="email"
                                                placeholder="example@email.com"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCheckEmail}
                                                disabled={emailCheckMutation.isPending}
                                            >
                                                {emailCheckMutation.isPending ? "확인 중..." : "중복확인"}
                                            </Button>
                                            {/* <Input
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
                                            /> */}
                                        </div>
                                    </div>
                                    {/* errors.email: react-hook-form의 유효성 검사 에러 (필수 입력, 이메일 형식)
                                    emailCheckMutation: 이메일 중복 확인 결과 (TanStack Query에서 관리) */}
                                    {errors.email ? (
                                        <p className="text-sm text-destructive">{errors.email.message}</p>
                                    ) : emailCheckMutation.isError ? (
                                        <p className="text-sm text-destructive">
                                            {emailCheckMutation.error?.response?.data?.message || "이미 사용 중인 이메일입니다."}
                                        </p>
                                    ) : emailCheckMutation.isSuccess ? (
                                        <p className="text-sm text-green-600">
                                            {emailCheckMutation.data?.message || "사용 가능한 이메일입니다."}
                                        </p>
                                    ) : null}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">비밀번호</Label>
                                        <Input
                                            {...register("password", {
                                                required: { value: true, message: "비밀번호를 입력해주세요." },
                                                minLength: { value: 6, message: "비밀번호는 최소 6자 이상이어야 합니다." }
                                            })}
                                            type="password"
                                            placeholder="비밀번호를 입력하세요."
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                                        {/* <Input
                                            id="password"
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        /> */}
                                        <p className="text-xs text-muted-foreground">최소 6자 이상</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="repeat-password">비밀번호 확인</Label>
                                        <Input
                                            {...register("repeatPassword", {
                                                required: { value: true, message: "비밀번호 확인을 입력해주세요." },
                                                validate: (value) => value === getValues("password") || "비밀번호가 일치하지 않습니다."
                                            })}
                                            type="password"
                                            placeholder="비밀번호를 입력하세요."
                                        />
                                        {errors.repeatPassword && <p className="text-sm text-destructive">{errors.repeatPassword.message}</p>}
                                        {/* <Input
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
                                        /> */}
                                    </div>
                                    {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
                                    <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                                        {signupMutation.isPending ? "계정 생성 중..." : "회원가입"}
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