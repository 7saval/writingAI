import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPasswordMutation } from "@/hooks/useAuthMutations";
import { useToast } from "@/hooks/useToast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Copy } from "lucide-react";

const formSchema = z.object({
    email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { mutateAsync: forgotPasswordMutate, isPending } = useForgotPasswordMutation();
    const [verificationCode, setVerificationCode] = useState<string | null>(null);
    const [submittedEmail, setSubmittedEmail] = useState<string>("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        try {
            const response = await forgotPasswordMutate({ email: values.email });

            // 개발용: 인증 코드 표시
            if (response.code) {
                setVerificationCode(response.code);
                setSubmittedEmail(values.email);
                toast({
                    title: "인증 코드 발송",
                    description: "이메일로 인증 코드가 발송되었습니다. (개발용: 화면 확인)",
                });
            } else {
                // 실제 운영 환경에서는 바로 이동하거나 메시지 표시
                toast({
                    title: "이메일 발송 완료",
                    description: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
                });
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: error.response?.data?.message || "비밀번호 재설정 요청에 실패했습니다.",
            });
        }
    };

    const handleContinue = () => {
        navigate(`/reset-password?email=${encodeURIComponent(submittedEmail)}`);
    };

    if (verificationCode) {
        return (
            <div className="flex min-h-full w-full items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <CheckCircle2 className="h-12 w-12 text-green-500" />
                            </div>
                            <CardTitle className="text-2xl text-center">인증 코드 발급 완료</CardTitle>
                            <CardDescription className="text-center">
                                아래의 인증 코드를 복사하여 다음 단계에서 입력해주세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="bg-muted">
                                <AlertTitle className="flex items-center justify-between">
                                    <span>인증 코드</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => {
                                            navigator.clipboard.writeText(verificationCode);
                                            toast({ description: "코드가 복사되었습니다." });
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </AlertTitle>
                                <AlertDescription className="mt-2 text-2xl font-bold font-mono tracking-widest text-center">
                                    {verificationCode}
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Button className="w-full" onClick={handleContinue}>
                                    비밀번호 재설정하러 가기
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setVerificationCode(null)}
                                >
                                    다시 시도하기
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
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
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>이메일</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="example@email.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending ? "확인 중..." : "인증 코드 받기"}
                                    </Button>
                                </form>
                            </Form>
                            <div className="mt-4 text-center text-sm">
                                <Link to="/login" className="text-primary hover:underline">
                                    로그인으로 돌아가기
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;