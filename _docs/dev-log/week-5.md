### 📅 2026-01-02 (Day 22)

#### 🎯 오늘의 목표
- [x] 사용자 인증 로직 및 경로 보호 개선
- [ ] 비밀번호 찾기, 재설정 화면 및 기능 구현
- [ ] 구글 OAuth 구현

#### ✅ 완료한 작업
- ✅ 사용자 인증 로직 및 경로 보호 개선


#### 📝 작업 상세
- 전역 인증 체크 개선 (App.tsx)
- 보호된 경로 도입 (ProtectedRoute.tsx & routeList.tsx)

```typescript
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isLoggedIn } = useAuthStore();
    const [isLoading, setIsLoading] = useState(!isLoggedIn);

    useEffect(() => {
        const checkStatus = async () => {
            if (!isLoggedIn) {
                try {
                    const response = await verifyUser();
                    if (response.authenticated) {
                        useAuthStore.setState({
                            isLoggedIn: true,
                            username: response.user.username,
                        });
                    }
                } catch (error) {
                    // 인증 실패 시 처리 없음 (isLoggedIn은 false로 유지됨)
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [isLoggedIn]);

    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center">Loading...</div>; // 로딩 처리 (필요시 컴포넌트로 교체)
    }

    if (!isLoggedIn) {
        // 로그인이 안 되어 있다면 로그인 페이지로 리다이렉트하며 메시지 전달
        return <Navigate to="/login" state={{ message: "로그인이 필요한 서비스입니다." }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
```


#### 🚨 이슈/트러블슈팅
- [문제발생] `App.tsx`에서 `useEffect()`로 `verifyUser` API 호출 시 유저가 첫 화면에 접속하거나 로그인 화면 등 사용자 인증이 필요하지 않은 순간에도 계속 체크를 해서 콘솔에 401 (Unauthorized) 에러가 뜬다. 글쓰기 작업 화면(/projects)을 들어갈 때만 사용자 인증 체크를 하도록 하고 싶었다.
- [원인파악]
    - 브라우저는 서버로부터 4xx 응답을 받으면 자바스크립트에서 에러를 처리(catch)하더라도 네트워크 탭과 콘솔에 무조건 빨간색 에러 로그를 남긴다.
    - `App.tsx`에서 세션 유지를 위해 앱 구동 시 매번 `verifyUser`를 호출하는데, 로그인하지 않은 사용자는 당연히 401 응답을 받게 되므로 이 에러가 콘솔을 어지럽힌다.
- [해결방안]
    - **백엔드 수정**: 사용자 인증 확인(`verify-user`) API가 세션이 없을 때 401이 아닌 **200 OK**를 반환하도록 변경하고, 응답 데이터에 `authenticated: false` 플래그를 추가했다. 이를 통해 브라우저 수준의 강제 에러 로그를 방지했다.
    - **프론트엔드 수정**:
        - `App.tsx`의 체크 로직은 유지하되(헤더의 로그인/로그아웃 상태 반영을 위해), 백엔드에서 준 `authenticated` 플래그를 확인하여 스토어를 업데이트한다.
        - **`ProtectedRoute` 도입**: 글쓰기 등 인증이 필수인 특정 경로는 `ProtectedRoute`로 감싸서, 로그인이 안 된 상태에서 접근할 경우에만 경고를 주거나 `/login`으로 리다이렉트하도록 강제했다.


#### 💡 **개념 정리**
- 

**참고 링크**:
- 

#### 📌 내일 할 일
- [ ] 비밀번호 찾기, 재설정 화면 및 기능 구현
- [ ] 구글 OAuth 구현

#### 📌 디벨롭 사항
- [ ] 글쓰기 애니메이션
- [ ] 사용자정의 프롬프트 구현 
- [ ] 사용자 인증 시스템 구현
- [ ] 백엔드 에러 핸들링 개선
- [ ] 작성 글 내보내기
- [ ] 배포하기


#### 📝 피드백 내용
- 글쓰기 애니메이션
    - 스트림 형식 / 잘라서 눈속임

- database.ts
    - 타입 형식 : 카멜 - 스네이크 맞추기

- ai 생성 시 스크롤 맨 밑으로 이동하도록 구현


#### 📊 진행률
Week 5: ███████████░░░ 85%

---
### 📅 2026-01-03 (Day 23)

#### 🎯 오늘의 목표
- [x] 사용자 인증 API(verify-user) tanstack query로 구현
- [x] 비밀번호 찾기, 재설정 화면 및 기능 구현
- [x] 구글 OAuth 구현

#### ✅ 완료한 작업
- ✅ 사용자 인증 API(verify-user) tanstack query로 구현
- ✅ 비밀번호 찾기, 재설정 화면 및 기능 구현
- ✅ 구글 OAuth 구현
- ✅ 백엔드 Google OAuth 토큰 검증 시 Google API 호출 ➡️ google-auth-library 라이브러리 활용


#### 📝 작업 상세
- **`useEffect` 기반 인증 로직을 TanStack Query(`useQuery`)로 전환**
    - `App.tsx`와 `ProtectedRoute.tsx`에 흩어져 있던 인증 확인 로직을 `useAuthQuery` 커스텀 훅으로 단일화
    - `staleTime` 설정을 통해 5분간 캐싱을 유지하여 불필요한 API 호출 방지
    - 서버 상태 관리의 선언적 코딩 패턴 도입

```typescript
// [변경 전] App.tsx / ProtectedRoute.tsx에서 개별적으로 useEffect 사용
useEffect(() => {
    const checkAuth = async () => {
        try {
            const response = await verifyUser();
            if (response.authenticated) {
                useAuthStore.setState({ isLoggedIn: true, username: response.user.username });
            }
        } catch (error) { /* Silent Check */ }
    };
    checkAuth();
}, []);

// [변경 후] useAuthQuery 커스텀 훅으로 캡슐화 및 간소화
// hooks/useAuthQuery.ts
export const useAuthQuery = () => {
    const { storeLogin, storeLogout } = useAuthStore();
    return useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const response = await verifyUser();
                if (response.authenticated) {
                    storeLogin(response.user.username);
                    return response;
                }
                storeLogout();
                return null;
            } catch (error) {
                storeLogout();
                return null;
            }
        },
        staleTime: 1000 * 60 * 5, // 5분 캐싱
    });
};

// App.tsx
function App() {
    useAuthQuery(); // 한 줄로 인증 상태 확인 및 전역 스토어 동기화 완료
    // ...
}
```

- **비밀번호 찾기(ForgotPassword) 및 재설정(ResetPassword) 기능 구현**
    - **Frontend**:
        - `react-hook-form`과 `zod`를 사용하여 유효성 검사가 포함된 폼 UI 구현
        - `ForgotPassword`: 이메일 입력 시 인증 코드 요청하고, 발급된 코드를 화면에 표시(개발용 임시 처리) 후 `/reset-password`로 이동
        - `ResetPassword`: 이메일(쿼리 파라미터), 인증 코드, 새 비밀번호를 입력받아 최종 변경 요청
        - `TanStack Query`의 `useMutation`을 사용하여 API 호출 및 상태 관리 (`useForgotPasswordMutation`, `useResetPasswordMutation`)
    - **Backend**:
        - `forgotPassword`: 6자리 랜덤 인증 코드 생성 및 DB 저장 (5분 유효), 이메일 발송 로직(현재는 로그 출력)
        - `resetPassword`: 인증 코드 및 유효기간(expires) 검증 후 비밀번호 해싱하여 업데이트

```typescript
// [Backend] authController.ts - 비밀번호 재설정 로직 (요약)
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, code, newPassword } = req.body;
        const user = await repo.findOneBy({ email });
        
        // 인증 코드 및 만료 시간 검증
        if (user.resetCode !== code || user.resetCodeExpires < new Date()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: '인증코드가 유효하지 않습니다.' });
        }

        // 비밀번호 변경 및 인증 정보 초기화
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetCode = null; 
        await repo.save(user);

        return res.status(StatusCodes.OK).json({ message: '비밀번호가 변경되었습니다.' });
    } catch (error) {
        next(error);
    }
}
```

```typescript
// [Frontend] ResetPassword.tsx - 폼 제출 핸들러
const onSubmit = async (values: FormValues) => {
    try {
        await resetPasswordMutate({
            email, // URL Param에서 가져온 이메일
            code: values.code,
            newPassword: values.newPassword
        });
        
        toast({ title: "비밀번호 변경 완료", description: "로그인해주세요." });
        navigate("/login");
    } catch (error: any) {
        toast({ 
            variant: "destructive", 
            description: error.response?.data?.message || "오류 발생" 
        });
    }
};
```

- **Google OAuth 구현**
    
    **1) Google API Console 설정**
    - [Google API Console](https://console.cloud.google.com/apis/dashboard)에서 OAuth 2.0 클라이언트 ID 생성
    - 승인된 JavaScript 원본 및 리디렉션 URI 설정
    - 클라이언트 ID를 프론트엔드 `.env` 파일에 저장
    
    **2) 데이터베이스 스키마 설계 (확장 가능한 구조)**
    - `SocialAccount` 엔티티 생성: 향후 다양한 소셜 로그인(카카오, 네이버 등)을 지원하기 위한 확장 가능한 구조
    - `Users` 엔티티와 1:N 관계 설정 (한 유저가 여러 소셜 계정 연동 가능)
    
    ```typescript
    // SocialAccounts.ts
    @Entity('social_accounts')
    export class SocialAccount {
        @PrimaryGeneratedColumn()
        id!: number;
    
        @Column()
        provider!: string; // 'google', 'kakao', 'naver' 등
    
        @Column()
        socialId!: string; // 소셜 플랫폼에서 제공하는 고유 ID
    
        @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
        @JoinColumn({ name: 'userId' })
        user!: User;
    
        @Column()
        userId!: number;
    
        @CreateDateColumn()
        connectedAt!: Date;
    }
    ```
    
    **3) 백엔드 구현**
    - **Access Token 검증**: 클라이언트로부터 받은 Google Access Token을 Google API로 검증
    - **사용자 정보 조회**: 검증된 토큰으로 사용자 이메일 및 프로필 정보 획득
    - **계정 연동 로직**:
        - 이미 연동된 소셜 계정이 있으면 → 기존 유저로 로그인
        - 연동 안 된 경우:
            - 같은 이메일의 기존 유저가 있으면 → 소셜 계정 연동
            - 신규 유저면 → 새 유저 생성 + 소셜 계정 연결
    - **JWT 토큰 발급**: 로그인 성공 시 JWT 생성 및 쿠키에 저장
    
    **📚 Google OAuth 토큰 검증 방식 비교**
    
    Google OAuth에서 백엔드로 토큰을 검증하는 방식은 크게 두 가지가 있습니다:
    
    **방식 1: Access Token 검증 (fetch 사용)**
    ```typescript
    // 프론트엔드에서 Access Token을 받아서 검증
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const payload = await googleResponse.json();
    ```
    
    - ✅ **장점**: 간단하고 직관적, 추가 라이브러리 불필요
    - ⚠️ **단점**: Access Token은 보안성이 상대적으로 낮음 (서명 검증 없음)
    - 📌 **사용 시나리오**: 빠른 프로토타입, 간단한 인증
    
    **방식 2: ID Token 검증 (google-auth-library 사용) ⭐ 권장**
    ```typescript
    import { OAuth2Client } from 'google-auth-library';
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // 프론트엔드에서 ID Token을 받아서 검증
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    ```
    
    - ✅ **장점**: 
        - Google 공식 라이브러리로 더 안전
        - **서명 검증** (토큰이 실제로 Google에서 발급했는지 확인)
        - **만료 시간 자동 검증**
        - **Audience 검증** (우리 앱을 위한 토큰인지 확인)
    - ⚠️ **단점**: 추가 라이브러리 필요 (`google-auth-library`)
    - 📌 **사용 시나리오**: 프로덕션 환경, 보안이 중요한 서비스
    
    **🔐 보안 차이점**
    | 항목 | Access Token | ID Token |
    |------|-------------|----------|
    | 서명 검증 | ❌ 없음 | ✅ 있음 |
    | 만료 검증 | 수동 | ✅ 자동 |
    | Audience 검증 | ❌ 없음 | ✅ 있음 |
    | 위조 방지 | ⚠️ 낮음 | ✅ 높음 |
    
    **💡 결론**: 프로덕션 환경에서는 **ID Token + google-auth-library** 방식을 권장합니다.
    
    ---
    
    ```typescript
    // authController.ts - googleLogin 함수 (ID Token 방식으로 구현)
    import { OAuth2Client } from 'google-auth-library';
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    export async function googleLogin(req: Request, res: Response, next: NextFunction) {
        const { token } = req.body;
        
        // 1. ID Token 검증 (google-auth-library 사용)
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '유효하지 않은 토큰입니다.'
            });
        }
        
        const { sub: socialId, email, name } = payload;
        
        // 2. 소셜 계정 조회
        let socialAccount = await socialRepo.findOne({
            where: { provider: 'google', socialId },
            relations: ['user']
        });
        
        let user: User;
        
        if (socialAccount) {
            // 이미 연동된 계정 → 로그인
            user = socialAccount.user;
        } else {
            // 연동 안된 경우
            const existingUser = await userRepo.findOneBy({ email });
            
            if (existingUser) {
                // 기존 유저 존재 → 소셜 계정 연동
                user = existingUser;
            } else {
                // 신규 유저 생성
                user = userRepo.create({
                    email,
                    username: name || 'User',
                    password: undefined // 소셜 로그인 유저는 비밀번호 없음
                });
                await userRepo.save(user);
            }
            
            // 소셜 계정 생성 및 연결
            socialAccount = socialRepo.create({
                provider: 'google',
                socialId,
                user
            });
            await socialRepo.save(socialAccount);
        }
        
        // 3. JWT 토큰 발급 및 쿠키 저장
        const jwtToken = jwt.sign({ id: user.id, email: user.email }, 
            process.env.JWT_SECRET!, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        res.cookie("token", jwtToken, { httpOnly: true });
        res.status(StatusCodes.OK).json({
            message: '구글 로그인이 완료되었습니다.',
            token: jwtToken,
            user: { username: user.username, email: user.email }
        });
    }
    ```
    
    **4) 프론트엔드 구현**
    - **라이브러리**: `@react-oauth/google` 사용
    - **GoogleOAuthProvider**: `main.tsx`에서 앱 전체를 감싸서 Google OAuth 컨텍스트 제공
    - **useGoogleLogin 훅**: 구글 로그인 플로우 처리
        - `onSuccess`: Access Token을 백엔드로 전송하여 인증 처리
        - `onError`: 에러 핸들링
    - **TanStack Query**: `useGoogleLoginMutation` 훅으로 API 호출 및 상태 관리
    
    ```typescript
    // Login.tsx - 구글 로그인 핸들러 (ID Token 방식)
    const googleLoginMutation = useGoogleLoginMutation();
    
    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            // credentialResponse.credential이 ID Token입니다
            await googleLoginMutation.mutateAsync(credentialResponse.credential);
            navigate("/");
        } catch (error) {
            console.error(error);
            setError("root", { 
                type: "manual", 
                message: "Google 로그인에 실패했습니다." 
            });
        }
    };
    
    const handleGoogleError = () => {
        setError("root", { type: "manual", message: "Google 로그인에 실패했습니다." });
    };
    
    // GoogleLogin 컴포넌트 사용 (ID Token을 자동으로 제공)
    <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text="continue_with"
        width="100%"
    />
    ```
    
    ```typescript
    // useAuthMutations.ts - 구글 로그인 Mutation
    export const useGoogleLoginMutation = () => {
        const { storeLogin } = useAuthStore();
        return useMutation({
            mutationFn: async (token: string) => {
                const response = await googleLogin(token);
                return response;
            },
            onSuccess: (data) => {
                storeLogin(data.user.username); // 전역 상태 업데이트
            },
            onError: (error) => {
                console.error(error);
            }
        })
    }
    ```
    
    **5) 인증 플로우 요약**
    ```
    [사용자] → Google 로그인 버튼 클릭
         ↓
    [Google OAuth] → Access Token 발급
         ↓
    [Frontend] → Access Token을 Backend로 전송
         ↓
    [Backend] → Google API로 Token 검증 및 사용자 정보 조회
         ↓
    [Backend] → DB에서 소셜 계정 조회/생성 및 유저 연동
         ↓
    [Backend] → JWT 토큰 발급 및 쿠키 저장
         ↓
    [Frontend] → 로그인 상태 업데이트 및 메인 페이지로 이동
    ``` 


#### 🚨 이슈/트러블슈팅
[이슈1]  
- **이슈**: `useAuthQuery`를 사용하는 `App` 컴포넌트 내부에서 `QueryClientProvider`를 선언하여 `No QueryClient set` 에러 발생
- **해결**: `QueryClientProvider`를 `main.tsx`로 이동시켜 `App` 컴포넌트 상위에서 Context를 제공하도록 구조 변경

[이슈2]
- **이슈**: `shadcn/ui`의 기본 `toast` 사용 시 `useToast` 훅과 `Toaster` 컴포넌트 간의 의존성으로 인해 코드가 복잡해지는 느낌을 받았다. 더 직관적이고 가벼운 `sonner` 라이브러리로 교체하여 코드 품질과 DX(개발자 경험)를 개선하고자 했다.
- **진행**:
    - `shadcn/ui`를 통해 `sonner` 컴포넌트 설치 및 기존 `Toaster` 교체
    - 각 페이지의 `useToast` 호출부를 `sonner`의 `toast` 함수로 마이그레이션
    - **문제 발생**:
        1. 토스트가 중복으로 렌더링되는 현상 (React Strict Mode 등의 영향)
        2. 닫기 버튼이 보이지 않거나, 텍스트가 회색으로 표시되어 가독성이 떨어지는 스타일 이슈 발생
- **해결**:
    - `App.tsx` 최상단에 `Toaster` 컴포넌트를 배치하여 전역 컨텍스트 확보
    - `components/ui/sonner.tsx`에서 `toastOptions`를 커스터마이징하여 스타일(폰트 색상, 배경색) 및 닫기 버튼 가시성 문제 해결
- **결과**:
    - 호출 코드가 `toast({ title: ... })` 또는 `toast.success(...)` 형태로 훨씬 간결해지고, 닫기 버튼 등 스타일이 의도한 대로 표시됨.
    - `useToast` 훅 의존성을 제거하고 직관적인 API를 사용하여 전반적인 코드 가독성 향상. 

[이슈3] 보호된 경로(/projects)에서 로그아웃 시 리다이렉트 충돌 문제
- **문제발생**: `/projects` 페이지에서 로그아웃 시 메인화면(`/`)으로 이동하고 싶으나, 자꾸 `/login` 화면으로 튕기면서 "로그인이 필요한 서비스입니다"라는 중복 토스트가 뜸.
- **원인파악**: 로그아웃 버튼 클릭 시 인증 상태(`isLoggedIn`)가 먼저 `false`로 변함. 이때 `/projects`에 머물러 있던 `ProtectedRoute`가 상태 변화를 즉시 감지하고 `<Navigate />`(자동 리다이렉트)를 실행함. 이 명령이 `Header`의 홈 이동 명령과 충돌하여 로그인 페이지로 강제 이동되는 것이 원인.
- **해결방안**: 
    1. 처음엔 실행 순서 변경 및 '로그아웃 중' 플래그를 도입했으나, 상태 동기화와 라우팅 시차 문제로 해결되지 않음.
    2. 최종적으로 `ProtectedRoute`에서 자동 리다이렉트 컴포넌트(`<Navigate />`)를 제거함.
    3. 대신 인증되지 않은 접근 시 `AlertDialog`(알럿 모달)를 띄워 사용자에게 안내하고, [확인] 클릭 시에만 수동으로 이동하게 함으로써 자동 리다이렉트 충돌을 근본적으로 차단함.
- **결과**: 로그아웃 시 충돌 없이 매끄럽게 홈 화면으로 이동하며, 비로그인 상태로 접근 시에도 갑작스러운 화면 전환 대신 친절한 안내 모달을 통한 명확한 동선을 제공하게 됨.

#### 💡 **개념 정리**
- **useQuery**: 
    - queryKey : 캐시(데이터)를 구분하는 키
    - queryFn : 캐시(데이터)를 가져오거나 업데이트하는 함수
    - staleTime : 캐시(데이터)의 유효기간
    - 로딩(isLoading), 데이터(data), 에러(error) 상태는 TanStack Query가 알아서 관리
- **Server State vs Client State**: API를 통해 가져오는 인증 정보는 서버 상태이며, 이를 TanStack Query로 관리함으로써 캐싱, 동기화, 로딩 상태 처리를 자동화할 수 있음.
- **Declarative Programming**: "어떻게(How)" 로직을 수행할지 명령하는 대신 "무엇(What)"이 필요한지 선언하여 코드의 가독성과 유지보수성을 높임.

- **zod와 zodResolver**
    - Zod와 zodResolver는 React Hook Form과 함께 사용할 때 **강력하고 간편한 유효성 검사(Validation)**를 구현하기 위해 사용 
    - zod : 규칙을 만드는 도구 ("비밀번호는 6자리 이상!")
    - zodResolver : 만든 규칙을 React Hook Form이 이해할 수 있게 통역해주는 도구
    
    **왜 쓰는가?**  
    ① 유효성 검사 로직 분리: 컴포넌트 내부가 아니라 외부에서 깔끔하게 규칙을 정의할 수 있습니다. (예: "이메일 형식이어야 하고, 최소 5글자 이상이어야 함")  
    ② 자동 타입 추론: Zod로 정의한 규칙(Schema)을 통해 TypeScript 타입(interface)을 자동으로 만들어낼 수 있습니다. (타입 정의를 두 번 할 필요가 없음)  
    ③ 런타임 에러 방지: 사용자가 입력한 데이터가 실제로 우리가 원하는 형태인지 확실하게 보장해줍니다.

    **어떻게 쓰는가?**  
    [단계별 설명]
    ① z.object로 데이터의 형태(Schema)와 규칙 정의
    ② z.infer를 사용해 TypeScript 타입을 추출
    ③ useForm의 resolver 옵션에 zodResolver를 넣어 연결

    ```typescript
    // 로그인폼 예시
    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import * as z from "zod";

    // 1. 스키마 정의 (유효성 검사 규칙)
    const loginSchema = z.object({
    email: z.string()
        .min(1, "이메일을 입력해주세요.") // 필수 입력
        .email("올바른 이메일 형식이 아닙니다."), // 이메일 형식 체크
    password: z.string()
        .min(6, "비밀번호는 최소 6자 이상이어야 합니다.") // 길이 체크
        .max(20, "비밀번호는 20자 이하여야 합니다."),
    });

    // 2. 타입 추론 (interface를 따로 만들 필요 없이 스키마에서 추출)
    // type LoginFormData = { email: string; password: string; } 와 동일
    type LoginFormData = z.infer<typeof loginSchema>;
    export default function LoginForm() {

        // 3. React Hook Form과 연결
        const {
            register,
            handleSubmit,
            formState: { errors },
        } = useForm<LoginFormData>({
            resolver: zodResolver(loginSchema), // 여기서 연결!
            mode: "onBlur", // 예: 포커스를 잃었을 때 검사
        });
        const onSubmit = (data: LoginFormData) => {
            // 여기까지 왔다면 데이터는 무조건 유효함이 보장됩니다.
            console.log("제출 성공:", data);
        };
        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label>이메일</label>
                <input {...register("email")} className="border p-2" />
                {/* 에러 메시지 자동 출력 */}
                {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
            </div>
            <div>
                <label>비밀번호</label>
                <input type="password" {...register("password")} className="border p-2" />
                {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
            </div>
            <button type="submit">로그인</button>
            </form>
        );
    }
    ```


**참고 링크**:
- [zod 라이브러리](https://zod.dev/?id=introduction)
- [zod 스키마 정의](https://zod.dev/api?id=primitives)


#### 📌 내일 할 일
- [ ] 구글 OAuth 구현

#### 📌 디벨롭 사항
- [ ] 글쓰기 애니메이션
- [ ] 사용자정의 프롬프트 구현 
- [ ] 사용자 인증 시스템 구현
- [ ] 백엔드 에러 핸들링 개선
- [ ] 작성 글 내보내기
- [ ] 배포하기


#### 📝 피드백 내용
- 글쓰기 애니메이션
    - 스트림 형식 / 잘라서 눈속임

- database.ts
    - 타입 형식 : 카멜 - 스네이크 맞추기

- ai 생성 시 스크롤 맨 밑으로 이동하도록 구현


#### 📊 진행률
Week 5: ███████████░░░ 85%

---