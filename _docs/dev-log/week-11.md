### 📟 2026-04-25 (Day 36)

#### 🎯 오늘의 목표

- [x] Electron 환경에서 구글 로그인 차단 문제 해결 및 구현
- [x] 백엔드 세션 및 상태 폴링 시스템 구축
- [x] TypeScript 타입 오류(JWT, Express) 해결
- [x] PR 피드백 반영 (refreshToken 추가 및 폴링 클린업)

#### ✅ 완료한 작업

- ✅ **데스크톱 전용 구글 로그인 플로우 구현**
  - 시스템 브라우저를 활용한 OAuth 인증 우회 로직 완성
  - 백엔드 `desktopOAuthSessions` 서비스 및 컨트롤러 구현
  - Electron IPC(`open-external-url`) 및 프리로드 스크립트 연동
- ✅ **인증 보안 강화 (PKCE)**
  - `code_challenge`, `code_verifier` 생성 및 검증 로직 적용
- ✅ **PR 코드 리뷰 피드백 반영**
  - 데스크톱 로그인 결과에 `refreshToken` 추가 전달 및 저장
  - `useDesktopGoogleLogin` 훅에 `useRef`/`useEffect` 클린업 로직 추가 (메모리 누수 방지)
  - 백엔드 리디렉션 URI 하드코딩 제거

#### 💡 배운 것

**Electron 브라우저 제한**

- 구글은 보안상의 이유로 임베디드 브라우저(User-Agent가 일반 브라우저와 다른 경우)에서의 OAuth 로그인을 차단함. 이를 위해 시스템 기본 브라우저를 실행하고 백엔드를 거쳐 결과를 앱으로 전달하는 우회 전략이 필수적임.

**데스크톱용 상태 폴링(Polling) 방식**

- **필요성**: 데스크톱 앱(Electron)은 구글 서버가 직접 리디렉션할 수 있는 고정된 웹 주소가 없습니다. 따라서 인증은 시스템 브라우저에서 진행하고, 앱은 백엔드에 "인증이 완료되었는지" 주기적으로 확인(Polling)하여 최종 토큰을 받아와야 합니다.
- **역할**: 인증 프로세스와 앱 간의 통신 상태를 동기화하는 브릿지 역할을 수행합니다.

**`shell.openExternal`의 역할**

- 구글 OAuth는 보안상의 이유로 임베디드 환경(`webview`, `BrowserWindow`)에서의 로그인을 차단합니다.
- `shell.openExternal`은 사용자의 **기본 브라우저**를 실행시켜 구글의 보안 정책을 준수하면서 안전하게 인증을 진행하도록 돕습니다.

**TypeScript 유연한 타입 처리**

- 라이브러리 내부 인터페이스(`SignOptions` 등)를 명시적으로 임포트하여 `as any` 없이도 환경 변수 값의 타입을 라이브러리 규격에 맞게 캐스팅하는 방법을 익혔습니다.

#### 🔧 해결한 문제

**1. 데스크톱용 `refreshToken` 유실 및 수동 전달**

- **문제**: 데스크톱 앱은 브라우저와 쿠키를 공유하지 않아 `refreshToken`이 누락됨.
- **해결**: 백엔드 폴링 응답 JSON 바디에 `refreshToken`을 포함하고, 프론트엔드 `authStore`에 이를 저장하도록 수정했습니다.

```typescript
// backend/src/controllers/desktopGoogleAuthController.ts
desktopOAuthSessions.completeDesktopOAuthSession(state, {
  accessToken,
  refreshToken, // 바디에 포함하여 수동 전달
  user: { username, email },
});
```

**2. 폴링 인터벌 클린업을 통한 메모리 누수 방지**

- **문제**: `useMutation` 내에서 실행되는 `setInterval`이 컴포넌트 언마운트 시 중단되지 않음.
- **해결**: `useRef`로 인터벌 ID를 보관하고, `useEffect` 클린업 함수를 통해 즉시 해제하도록 개선했습니다.

```typescript
// frontend/src/hooks/useAuth.ts
const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  return () => {
    // 컴포넌트 이탈 시 즉시 중단
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
  };
}, []);
```

**3. 리디렉션 URI 하드코딩 제거 및 환경 변수화**

- **문제**: 배포 주소(Render)가 코드에 고정되어 로컬 개발 환경과 충돌 발생.
- **해결**: 환경 변수 기반으로 전환하여 유지보수성을 높였습니다.

**4. 데스크톱 앱 토큰 갱신(Refresh) 실패 문제**

- **문제 발견**:
  - 인증 상태 점검 중, 데스크톱 앱은 쿠키를 사용하지 않아 백엔드의 기존 리프레시 로직(`req.cookies`)이 작동하지 않음을 확인.
- **진행 과정**:
  1. `apiClient` 인터셉터가 헤더에 `accessToken`을 넣는 과정은 정상이지만, `refresh` API 호출 시 리프레시 토큰이 전달되지 않는 구조 파악.
  2. 백엔드 `authController.ts`가 쿠키에만 의존하고 있음을 확인.
- **해결**:
  - **백엔드**: 쿠키가 없을 시 요청 바디(`req.body.refreshToken`)를 확인하도록 폴백 구현.
  - **프론트엔드**: `refresh` 호출 시 스토어의 리프레시 토큰을 바디에 담아 전송하도록 수정.

```typescript
// backend: 쿠키와 바디 모두 지원
const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

// frontend: 스토어 토큰 활용
const refreshToken = useAuthStore.getState().refreshToken;
const response = await apiClient.post("/auth/refresh", { refreshToken });
```

#### 📌 내일 할 일

- [ ] 데스크톱 로그인 세션 만료 시간 최적화 테스트
- [ ] 로그아웃 시 백엔드 세션 정리 로직 보완
- [ ] 전체 빌드 후 아이콘 및 패키징 최종 확인

#### 📊 진행률

Week 11: ██████░░░░ 60% (Day 37/42)  
전체: ████████░░ 80% (Week 11/14)
