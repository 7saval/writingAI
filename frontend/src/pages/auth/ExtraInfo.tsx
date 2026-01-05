import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSocialSignupMutation } from "@/hooks/useAuthMutations";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";

interface ExtraInfoFormProps {
    nickname: string;
}

const ExtraInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const socialSignupMutation = useSocialSignupMutation();

    const signupToken = location.state?.signupToken;
    const profile = location.state?.profile;

    useEffect(() => {
        if (!signupToken) {
            toast({
                title: "오류",
                description: "잘못된 접근입니다. 다시 로그인해 주세요.",
                variant: "destructive"
            });
            navigate("/login", { replace: true });
        }
    }, [signupToken, navigate, toast]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<ExtraInfoFormProps>({
        defaultValues: {
            nickname: profile?.name || ""
        }
    });

    const onSubmit = async (data: ExtraInfoFormProps) => {
        try {
            await socialSignupMutation.mutateAsync({
                signupToken,
                nickname: data.nickname
            });
            toast({
                title: "환영합니다!",
                description: "회원가입 및 로그인이 완료되었습니다."
            });
            navigate("/");
        } catch (error: any) {
            console.error(error);
            setError("nickname", {
                type: "manual",
                message: error.response?.data?.message || "회원가입에 실패했습니다."
            });
        }
    };

    if (!signupToken) return null;

    return (
        <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">추가 정보 입력</CardTitle>
                        <CardDescription>
                            서비스 이용을 위해 닉네임을 설정해 주세요.<br />
                            ({profile?.email})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="nickname">닉네임</Label>
                                    <Input
                                        {...register("nickname", {
                                            required: "닉네임을 입력해 주세요.",
                                            minLength: { value: 2, message: "닉네임은 최소 2글자 이상이어야 합니다." }
                                        })}
                                        id="nickname"
                                        placeholder="사용하실 닉네임을 입력하세요"
                                    />
                                    {errors.nickname && (
                                        <p className="text-sm text-destructive">{errors.nickname.message}</p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={socialSignupMutation.isPending}
                                >
                                    {socialSignupMutation.isPending ? "처리 중..." : "가입 완료"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ExtraInfo;
