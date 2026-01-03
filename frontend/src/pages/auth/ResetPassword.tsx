import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useResetPasswordMutation } from "@/hooks/useAuthMutations";
import { useToast } from "@/hooks/useToast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    code: z.string().min(6, { message: "인증 코드를 확인해주세요." }),
    newPassword: z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");
    const { toast } = useToast();
    const { mutateAsync: resetPasswordMutate, isPending } = useResetPasswordMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        if (!email) {
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: "이메일 정보가 없습니다. 처음부터 다시 시도해주세요.",
            });
            return;
        }

        try {
            await resetPasswordMutate({
                email,
                code: values.code,
                newPassword: values.newPassword
            });

            toast({
                title: "비밀번호 변경 완료",
                description: "비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.",
            });

            navigate("/login");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "오류 발생",
                description: error.response?.data?.message || "비밀번호 변경에 실패했습니다.",
            });
        }
    };

    if (!email) {
        return (
            <div className="flex min-h-full w-full items-center justify-center p-6">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-destructive">잘못된 접근</CardTitle>
                        <CardDescription>이메일 정보가 누락되었습니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link to="/forgot-password">비밀번호 찾기로 돌아가기</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-full w-full items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">비밀번호 재설정</CardTitle>
                            <CardDescription>
                                <strong>{email}</strong> 계정의 새 비밀번호를 설정합니다.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>인증 코드</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123456" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>새 비밀번호</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="새 비밀번호 입력" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>새 비밀번호 확인</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="새 비밀번호 다시 입력" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending ? "변경 중..." : "비밀번호 변경하기"}
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

export default ResetPassword;