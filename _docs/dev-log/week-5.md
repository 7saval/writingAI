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