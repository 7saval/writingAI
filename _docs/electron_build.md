# Electron Build Plan

## 목표

현재 프로젝트를 Electron 데스크톱 앱으로 빌드하고, Windows 기준 1차 배포가 가능한 상태까지 정리한다.

이 문서는 "어떻게 Electron 앱을 배포 가능한 형태로 만들지"에 대한 계획서다.

우선 범위는 아래처럼 잡는다.

- 1차 대상 플랫폼: Windows
- 1차 산출물: 설치형 앱 또는 포터블 앱
- 빌드 도구: `electron-builder`
- 현재 전제:
  - 프론트엔드는 `frontend/dist`로 빌드
  - Electron 메인/프리로드는 `dist-electron`으로 빌드
  - 루트 `package.json`에 `electron:build` 스크립트가 이미 존재

## 현재 상태 요약

현재 프로젝트는 아래 구조를 이미 가지고 있다.

- 프론트엔드 빌드:
  - `npm run build --prefix frontend`
- Electron 메인 빌드:
  - `tsc -p tsconfig.electron.json`
- 통합 빌드:
  - `npm run electron:build`
- 패키징 도구:
  - `electron-builder`
- 네이티브 모듈:
  - `better-sqlite3`

즉, "개발용 Electron 실행"과 "프로덕션 빌드 진입점"은 이미 어느 정도 갖춰져 있고, 이제 필요한 것은 패키징 설정 정리와 배포 검증 절차 문서화다.

## 1차 배포 원칙

처음부터 모든 플랫폼과 고급 기능을 한 번에 다루지 않는다.

1차 원칙은 아래와 같다.

- Windows만 먼저 배포
- 자동 업데이트는 제외
- 코드 서명은 후순위
- 설치 파일 생성이 우선
- 실제 사용자 입장에서 설치 후 실행 가능한지 검증하는 데 집중

이렇게 해야 복잡도를 줄이면서 배포 파이프라인을 빠르게 완성할 수 있다.

## 최종 목표 상태

아래 조건이 만족되면 1차 빌드/배포 준비 완료로 본다.

- `npm run electron:build`로 배포 산출물이 생성된다.
- 생성된 설치 파일 또는 실행 파일이 Windows에서 실행된다.
- 로그인, 프로젝트 열기, 문단 작성, 저장이 정상 동작한다.
- Word export, PDF export가 빌드된 앱에서도 정상 동작한다.
- DB 저장과 재실행 후 데이터 유지가 정상 동작한다.

## 전체 진행 단계

### 1단계. 빌드 산출물 구조 점검

목표:

- 현재 빌드 결과물이 패키징 가능한 구조인지 확인

할 일:

- [x] `frontend/dist` 생성 결과 확인
- [x] `dist-electron/main.js`, `dist-electron/preload.js` 생성 결과 확인
- [x] `electron:build` 실행 시 프론트/메인 빌드 순서가 안정적인지 확인
- [x] Electron이 프로덕션 환경에서 `file://` 경로로 프론트엔드 화면을 정상 로드하는지 확인
- [x] preload 경로가 빌드 후에도 올바른지 확인

주의:

- 개발 환경에서는 `ELECTRON_START_URL`을 쓰지만, 배포 빌드에서는 `file://.../dist/index.html` 경로를 쓰게 된다.
- 따라서 개발 서버 기준으로만 동작하는 경로가 없는지 확인해야 한다.

### 2단계. electron-builder 설정 정리

목표:

- 패키징에 필요한 메타데이터와 포함 파일 범위를 명확히 정의

할 일:

- [x] 루트 `package.json`에 `build` 설정 추가
- [x] `appId` 정의
- [x] `productName` 정의
- [x] `directories.output` 정의
- [x] `files` 포함 범위 정의
- [x] Windows 타깃 정의
- [x] 아이콘 경로 정의

권장 기본 설정 항목:

```json
{
  "build": {
    "appId": "com.writingai.app",
    "productName": "WritingAI",
    "directories": {
      "output": "release"
    },
    "files": ["dist-electron/**/*", "frontend/dist/**/*", "package.json"],
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    }
  }
}
```

설정 시 확인 포인트:

- `files`에 꼭 필요한 결과물만 넣기
- 소스 파일 전체를 무분별하게 넣지 않기
- 빌드 후 필요한 폰트/정적 자산이 누락되지 않게 하기

### 3단계. 정적 자산 및 런타임 자산 포함 범위 점검

목표:

- 빌드된 앱 안에서 실제 기능에 필요한 파일이 빠지지 않도록 정리

할 일:

- [x] 프론트엔드 번들 파일 포함 여부 확인
- [x] Electron 메인/프리로드 파일 포함 여부 확인
- [x] PDF export용 폰트 파일 포함 여부 확인
- [x] 앱 아이콘 포함 여부 확인
- [x] native module 관련 파일 포함 여부 확인

특히 중요:

- `better-sqlite3`는 네이티브 모듈이라 빌드 후 실행 검증이 반드시 필요하다.
- PDF export에서 사용하는 폰트 파일이 빌드된 앱 안에서도 접근 가능한지 확인해야 한다.

### 4단계. Windows 배포 형식 결정

목표:

- 사용자에게 어떤 형태로 앱을 전달할지 결정

선택지:

1. 설치형 (`nsis`)
2. 포터블 (`portable`)

#### 설치형과 포터블 비교

**설치형 (`nsis`)**

- 설치 마법사를 통해 앱을 PC에 설치한다.
- 보통 `Program Files` 계열 경로에 앱이 배치된다.
- 시작 메뉴, 바탕화면 바로가기, 제거 프로그램 등록이 쉽다.
- 일반 사용자에게 가장 익숙한 배포 방식이다.
- 이후 자동 업데이트나 버전 관리로 확장하기 좋다.
- 단점은 설치 과정이 한 번 필요하다는 점이다.

**포터블 (`portable`)**

- 설치 과정 없이 실행 파일 하나로 바로 실행한다.
- USB, 임시 환경, 내부 테스트 배포에 편하다.
- 빠르게 전달해서 실행만 확인하고 싶을 때 유리하다.
- 단점은 설치 UX가 약하고, 시작 메뉴/제거 프로그램 같은 “앱처럼 보이는” 경험이 부족하다는 점이다.

#### 현재 프로젝트 기준 비교

설치형이 더 적합한 경우:

- 일반 사용자에게 실제 배포할 예정인 경우
- 데스크톱 앱처럼 자연스러운 설치 경험이 필요한 경우
- 시작 메뉴, 바로가기, 제거 기능이 필요한 경우
- 나중에 자동 업데이트까지 고려하는 경우

포터블이 더 적합한 경우:

- 팀 내부 테스트용으로 빠르게 배포할 경우
- 설치 권한이 없는 환경에서 실행해야 하는 경우
- 설치 과정 없이 실행만 빠르게 검증하고 싶은 경우

#### 현재 권장안

- 1차 기본 배포 형식은 설치형(`nsis`)
- 필요하면 내부 테스트용으로 포터블을 추가 생성

즉, 배포 기준은 설치형을 우선하고, 테스트 편의를 위해 포터블을 보조 수단으로 두는 전략이 가장 현실적이다.

권장:

- 1차는 `nsis` 설치형 권장

이유:

- 일반 사용자에게 가장 익숙함
- 시작 메뉴/바탕화면 바로가기 정책을 붙이기 쉬움
- 이후 자동 업데이트로 확장하기도 비교적 자연스러움

추가 결정 사항:

- [ ] 설치 경로 기본값 유지 여부
- [ ] 바탕화면 아이콘 생성 여부
- [ ] 시작 메뉴 등록 여부
- [ ] 제거 프로그램 등록 여부

### 5단계. 환경 변수와 런타임 설정 정리

목표:

- 개발 환경 전용 설정이 배포 빌드에 섞이지 않도록 정리

할 일:

- [x] `ELECTRON_START_URL`이 배포 빌드에서는 사용되지 않도록 점검
- [x] 프론트엔드 `.env` 값 중 배포 시 필요한 값과 불필요한 값을 구분
- [x] API 서버 URL이 고정값인지, 환경별 분리가 필요한지 판단
- [x] Google OAuth 등 외부 연동 키가 배포 앱에서 어떻게 동작할지 점검

질문이 필요한 항목:

- 이 앱이 로컬 앱이면서도 외부 백엔드와 통신하는 구조를 유지할지
- 배포 환경별 API base URL을 별도로 둘지

### 6단계. 기능 검증 체크리스트 작성

목표:

- 빌드된 앱에서 핵심 기능이 실제로 동작하는지 확인

필수 검증 항목:

- [x] 앱 실행
- [ ] 로그인
- [ ] 프로젝트 목록 조회
- [ ] 프로젝트 진입
- [ ] 문단 작성
- [ ] 자동 저장/DB 저장
- [ ] 앱 종료 후 재실행 시 데이터 유지
- [ ] Word export 저장
- [ ] PDF export 저장
- [ ] 저장 다이얼로그 동작
- [ ] preload/IPC 기능 정상 동작

추가 검증 항목:

- [ ] 한글 폰트가 PDF/Word에서 깨지지 않는지
- [ ] 긴 문서 PDF export가 정상 동작하는지
- [ ] hidden window 기반 PDF export가 패키징 후에도 정상 동작하는지

### 7단계. 배포 산출물 정리

목표:

- 실제 배포 가능한 파일과 폴더 구조를 정리

권장 결과물:

- `release/`
  - 설치 파일 `.exe`
  - 필요 시 포터블 `.exe`
  - 최신 버전 메모

정리할 것:

- [x] 최종 산출물 폴더 규칙 확정 (`release/`)
- [x] 버전명 표기 방식 확정 (`package.json` version 기준)
- [x] 릴리스 파일명 규칙 확정 (`Companion Writer Setup x.x.x.exe`)

예시:

- `WritingAI Setup 0.1.0.exe`

### 8단계. 코드 서명과 경고 대응

목표:

- 외부 배포 시 보안 경고를 줄이는 방향 검토

1차 판단:

- 내부 테스트/지인 테스트 배포는 무서명으로도 가능
- 공개 배포 전에는 Windows 코드 서명 검토 필요

할 일:

- [ ] Windows 코드 서명 필요성 판단
- [ ] SmartScreen 경고 대응 방안 조사
- [ ] 코드 서명 인증서 비용/절차 확인

주의:

- 이 단계는 1차 빌드 성공 이후로 미뤄도 된다.
- 지금은 “실행 가능한 설치 파일을 만들 수 있는가”가 먼저다.

### 9단계. 배포 채널 결정

목표:

- 사용자에게 어떤 경로로 배포할지 정리

선택지 예시:

- GitHub Releases
- Notion/드라이브 공유
- 프로젝트 공식 웹페이지

정리할 것:

- [ ] 배포 업로드 위치 결정
- [ ] 릴리스 노트 템플릿 작성
- [ ] 버전 이력 관리 방식 결정

### 10단계. 후속 확장 계획

1차 배포 후 고려할 항목:

- [ ] 자동 업데이트(`electron-updater`)
- [ ] macOS 배포
- [ ] 코드 서명 자동화
- [ ] CI/CD 기반 자동 빌드
- [ ] 릴리스 태그 기반 자동 업로드

## 실제 작업 순서 제안

가장 현실적인 실행 순서는 아래다.

1. `electron-builder` 설정 추가
2. Windows 설치형 빌드 1차 생성
3. 로컬 설치 테스트
4. export/DB/native module 기능 검증
5. 외부 테스트 배포
6. 코드 서명/업데이트는 후속 작업으로 분리

## 우선 확인이 필요한 리스크

### 리스크 1. `file://` 환경에서 라우팅이 안정적인가

현재 Electron은 개발 환경에서는 `ELECTRON_START_URL`, 배포 환경에서는 정적 파일을 로드한다.

따라서 아래를 우선 확인해야 한다.

- 숨김 PDF export route가 패키징 후에도 정상 로드되는가
- `createBrowserRouter` 기반 구조가 배포 환경에서 문제 없는가

### 리스크 2. `better-sqlite3`가 패키징 후에도 정상 동작하는가

네이티브 모듈은 개발 환경에서는 잘 되더라도 패키징 후 문제가 날 수 있다.

그래서 아래 검증이 필요하다.

- 앱 실행 시 DB 초기화 성공 여부
- 저장/조회/재실행 시 데이터 유지 여부

### 리스크 3. 폰트/정적 파일이 export에서 누락되지 않는가

Word/PDF export는 일반 화면보다 정적 파일 의존성이 더 강하다.

특히 아래를 확인해야 한다.

- PDF용 폰트 파일 접근 가능 여부
- export route에서 필요한 CSS/자산 누락 여부

## 완료 기준

아래 조건이 모두 만족되면 Electron 빌드/배포 1차 목표 달성으로 본다.

- `npm run electron:build`가 성공한다.
- Windows 설치 파일이 생성된다.
- 설치 후 앱이 정상 실행된다.
- 프로젝트 작성/저장 기능이 동작한다.
- Word export가 저장된다.
- PDF export가 저장된다.
- 앱 재실행 후 데이터가 유지된다.

## 다음 액션

문서 기준으로 바로 이어서 할 작업은 아래다.

- [x] `package.json`에 `electron-builder` 배포 설정 초안 추가
- [x] 아이콘 파일 준비
- [x] `release` 출력 폴더 기준 첫 Windows 빌드 생성
- [x] 빌드된 설치 파일 수동 테스트

---

---

## Electron Google Login Plan

### Goal

Electron 배포 앱에서는 기존 웹용 `@react-oauth/google` 팝업 로그인을 그대로 사용하지 않는다.

Google OAuth는 Electron 내장 브라우저 창에서 차단될 수 있으므로, Electron 앱에서는 기본 브라우저를 열고 백엔드 session + polling 방식으로 로그인 결과를 받는다.

```text
Electron app
-> Google login button
-> backend creates temporary OAuth session
-> Electron opens Google auth URL in the default browser
-> Google redirects to backend callback with authorization code
-> backend exchanges code for Google tokens
-> Electron polls backend session status
-> Electron receives app accessToken/user
-> app login completed
```

1차 구현 방식:

- 백엔드 session 생성
- Electron 앱 polling
- 기본 브라우저 `shell.openExternal`
- deep link는 후속 작업으로 분리

### Before Starting

- [x] Electron build가 Render API를 바라보는지 확인
  - [`package.json`](../package.json)
  - `electron:build`에서 `VITE_API_URL=https://writingai-dcb3.onrender.com/api` 주입
- [x] Google Cloud Console에 callback URI 등록
  - `https://writingai-dcb3.onrender.com/api/auth/google/desktop/callback`
- [x] Render 백엔드 환경변수 확인
  - `GOOGLE_CLIENT_ID`
  - `ACCESS_TOKEN_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `CORS_ORIGIN`

### Step 1. Backend OAuth Session Store

목표:

- Electron Google 로그인 시도마다 임시 session을 만든다.
- 1차 구현은 메모리 `Map`으로 시작한다.
- 운영 안정화 단계에서는 Redis 또는 DB 저장으로 바꾼다.

추가 파일:

- [`backend/src/services/desktopOAuthSessions.ts`](../backend/src/services/desktopOAuthSessions.ts)

구현할 것:

- [x] `createDesktopOAuthSession()`
- [x] `getDesktopOAuthSession(sessionId)`
- [x] `getDesktopOAuthSessionByState(state)`
- [x] `completeDesktopOAuthSession(state, result)`
- [x] `failDesktopOAuthSession(state, message)`
- [x] 5분 만료 처리

데이터 형태:

```ts
type DesktopOAuthSession = {
  sessionId: string;
  state: string;
  codeVerifier: string;
  status: "pending" | "completed" | "failed" | "expired";
  createdAt: number;
  result?: DesktopOAuthResult;
  message?: string;
};
```

주의:

- `sessionId`, `state`, `codeVerifier`는 `crypto.randomBytes()`로 생성한다.
- `state`는 Google callback 검증용이다.
- `sessionId`는 Electron polling용이다.

### Step 2. Backend Desktop Google Controller

목표:

- Electron 앱 전용 Google OAuth endpoint를 기존 웹 Google 로그인과 분리한다.

추가 파일 권장:

- [`backend/src/controllers/desktopGoogleAuthController.ts`](../backend/src/controllers/desktopGoogleAuthController.ts)

참고 파일:

- [`backend/src/controllers/authController.ts`](../backend/src/controllers/authController.ts)

추가할 endpoint 1:

```http
POST /api/auth/google/desktop/session
```

역할:

- session 생성
- Google OAuth URL 생성
- `{ sessionId, authUrl }` 반환

응답 예시:

```json
{
  "sessionId": "random-session-id",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

Google OAuth URL에 넣을 값:

```text
client_id=GOOGLE_CLIENT_ID
redirect_uri=https://writingai-dcb3.onrender.com/api/auth/google/desktop/callback
response_type=code
scope=openid email profile
state=...
code_challenge=...
code_challenge_method=S256
prompt=select_account
```

추가할 endpoint 2:

```http
GET /api/auth/google/desktop/callback?code=...&state=...
```

역할:

- `state`로 session 찾기
- Google token endpoint에 `code` 교환
- `id_token` 검증
- 기존 Google 로그인 로직과 동일하게 사용자 조회/연동/신규 가입 처리
- session 상태를 `completed` 또는 `failed`로 변경
- 브라우저에는 완료 안내 HTML 반환

브라우저 응답 예시:

```html
<h1>로그인이 완료되었습니다.</h1>
<p>Companion Writer 앱으로 돌아가세요.</p>
```

추가할 endpoint 3:

```http
GET /api/auth/google/desktop/session/:sessionId
```

역할:

- Electron 앱 polling용 상태 반환

pending 응답:

```json
{
  "status": "pending"
}
```

completed 응답:

```json
{
  "status": "completed",
  "accessToken": "...",
  "user": {
    "username": "...",
    "email": "..."
  }
}
```

신규 사용자 응답:

```json
{
  "status": "completed",
  "isNewUser": true,
  "signupToken": "...",
  "profile": {
    "email": "...",
    "name": "..."
  }
}
```

failed 응답:

```json
{
  "status": "failed",
  "message": "Google 로그인에 실패했습니다."
}
```

### Step 3. Backend Routes

목표:

- 새 desktop Google auth endpoint를 `/api/auth` 아래에 연결한다.

수정 파일:

- [`backend/src/routes/authRoutes.ts`](../backend/src/routes/authRoutes.ts)

추가할 route:

```ts
authRouter.post("/google/desktop/session", createDesktopGoogleSession);
authRouter.get("/google/desktop/callback", handleDesktopGoogleCallback);
authRouter.get(
  "/google/desktop/session/:sessionId",
  getDesktopGoogleSessionStatus,
);
```

확인:

- [x] Render 배포 후 `POST /api/auth/google/desktop/session` 호출 성공
- [x] 응답에 `authUrl` 포함
- [x] 브라우저에서 `authUrl` 접속 시 Google 로그인 화면 표시
- [x] Google 로그인 후 callback endpoint 호출

### Step 4. Electron External Browser API

목표:

- Electron 앱이 Google OAuth URL을 기본 브라우저로 열 수 있게 한다.
- `BrowserWindow` 내부 팝업을 사용하지 않는다.

수정 파일:

- [`electron/main.ts`](../electron/main.ts)
- [`electron/preload.ts`](../electron/preload.ts)
- [`frontend/src/types/electron.d.ts`](../frontend/src/types/electron.d.ts)

`electron/main.ts`:

- [x] `shell` import 추가
- [x] IPC handler 추가

```ts
ipcMain.handle("open-external-url", async (_event, url: string) => {
  await shell.openExternal(url);
});
```

`electron/preload.ts`:

```ts
openExternalUrl: (url: string) =>
  ipcRenderer.invoke("open-external-url", url),
```

`frontend/src/types/electron.d.ts`:

```ts
openExternalUrl: (url: string) => Promise<void>;
```

확인:

- [x] Electron 앱에서 `window.electron.openExternalUrl(url)` 호출 가능
- [x] 기본 브라우저가 열린다

### Step 5. Frontend API

목표:

- Electron Google 로그인 session 생성과 polling API를 프론트에서 호출한다.

수정 파일:

- [`frontend/src/api/auth.api.ts`](../frontend/src/api/auth.api.ts)

추가할 함수:

```ts
export const createDesktopGoogleSession = async () => {
  const response = await apiClient.post("/auth/google/desktop/session");
  return response.data;
};

export const getDesktopGoogleSessionStatus = async (sessionId: string) => {
  const response = await apiClient.get(
    `/auth/google/desktop/session/${sessionId}`,
  );
  return response.data;
};
```

확인:

- [x] Electron build에서 `apiClient`가 Render API를 바라봄
- [x] `createDesktopGoogleSession()` 응답에 `sessionId`, `authUrl` 포함

### Step 6. Frontend Electron Google Login Hook

목표:

- Electron 앱에서 Google 로그인 버튼 클릭 시 session 생성, 브라우저 열기, polling, 로그인 완료 처리를 수행한다.

수정 파일:

- [`frontend/src/hooks/useAuth.ts`](../frontend/src/hooks/useAuth.ts)
- 또는 [`frontend/src/hooks/useAuthMutations.ts`](../frontend/src/hooks/useAuthMutations.ts)
- 로그인 상태 저장 참고: [`frontend/src/store/authStore.ts`](../frontend/src/store/authStore.ts)

구현 흐름:

```text
1. createDesktopGoogleSession()
2. window.electron.openExternalUrl(authUrl)
3. 2초마다 getDesktopGoogleSessionStatus(sessionId)
4. status === "completed"면 storeLogin()
5. 신규 사용자면 /extra-info로 이동
6. failed/expired/timeout이면 에러 표시
```

권장 polling 설정:

- interval: 2초
- timeout: 5분
- 완료/실패 시 polling 중단

주의:

- polling timer는 component unmount 시 정리한다.
- accessToken은 기존 이메일 로그인과 동일하게 `storeLogin()`에 저장한다.
- refresh token 저장은 1차 구현 범위에서 제외한다.

### Step 7. Login UI Branching

목표:

- 웹에서는 기존 `@react-oauth/google` 유지
- Electron에서는 새 desktop OAuth 버튼 사용

수정 파일:

- [`frontend/src/pages/auth/Login.tsx`](../frontend/src/pages/auth/Login.tsx)

분기 기준:

```ts
const isElectron = Boolean(window.electron);
```

렌더링 방향:

```tsx
{
  isElectron ? (
    <Button type="button" onClick={handleElectronGoogleLogin}>
      Google 계정으로 로그인
    </Button>
  ) : (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      text="continue_with"
      size="large"
      theme="outline"
    />
  );
}
```

확인:

- [x] 웹/Vercel에서는 기존 Google 버튼 표시
- [x] Electron 앱에서는 기존 Google 팝업 버튼 미표시
- [x] Electron 앱에서는 새 버튼 클릭 시 기본 브라우저 열림

### Step 8. Render Deploy And Google Console

목표:

- 백엔드 callback endpoint가 실제 Render 환경에서 동작하게 한다.

Google Cloud Console:

- [x] OAuth client redirect URI 추가

```text
https://writingai-dcb3.onrender.com/api/auth/google/desktop/callback
```

Render:

- [x] 백엔드 최신 코드 배포
- [x] `GOOGLE_CLIENT_ID`가 Google Cloud Console client id와 일치
- [x] `NODE_ENV=production`
- [x] DB 연결 정상

### Step 9. Electron Rebuild

목표:

- 새 프론트/Electron 코드가 설치 파일에 포함되게 한다.

확인 파일:

- [`package.json`](../package.json)
- [`frontend/vite.config.ts`](../frontend/vite.config.ts)
- [`electron/main.ts`](../electron/main.ts)
- [`electron/preload.ts`](../electron/preload.ts)

빌드:

```powershell
cmd /c npm run electron:build
```

결과물:

```text
release/Companion Writer Setup 0.1.0.exe
```

설치 후 이전 앱이 남아 있으면 제거 후 재설치한다.

### Step 10. Manual Verification

Electron 앱:

- [ ] 이메일 로그인 정상
- [ ] Electron Google 로그인 버튼 표시
- [ ] 버튼 클릭 시 기본 브라우저 열림
- [ ] Google 계정 선택 가능
- [ ] Google 로그인 후 브라우저에 완료 안내 표시
- [ ] Electron 앱에서 polling 완료
- [ ] 앱 로그인 상태로 이동
- [ ] 신규 Google 사용자면 추가 정보 입력 페이지로 이동
- [ ] 기존 Google 사용자면 홈으로 이동

백엔드:

- [ ] `/auth/google/desktop/session` 성공
- [ ] `/auth/google/desktop/callback` 성공
- [ ] `/auth/google/desktop/session/:sessionId`가 `completed` 반환
- [ ] 실패 시 `failed` 또는 `expired` 반환

로그 확인:

- Electron DevTools Network
- Render backend logs
- Google Cloud Console OAuth 설정

### Follow-Up Work

1차 구현에서는 accessToken 기반 로그인 완료까지만 목표로 한다.

후속 검토:

- [ ] Electron용 refresh token 저장 전략
- [ ] Windows Credential Manager 또는 OS secure storage 사용
- [ ] session 저장소를 메모리 `Map`에서 Redis/DB로 변경
- [ ] deep link 방식 검토
- [ ] Google 로그인 완료 후 앱 자동 focus
- [ ] desktop OAuth 실패 메시지 UX 개선

### Debug Guide

Google 브라우저 화면에서 `redirect_uri_mismatch`:

- Google Cloud Console redirect URI가 Render callback URL과 정확히 일치하지 않음

Electron에서 polling이 계속 `pending`:

- callback endpoint가 호출되지 않았거나 `state` 검증 실패
- Render logs 확인

Electron에서 `completed`를 받았는데 로그인 상태가 안 바뀜:

- `storeLogin()` 호출 인자 확인
- 기존 이메일 로그인 성공 처리와 동일한 구조인지 확인

Google 로그인은 됐는데 앱 재실행 후 로그아웃됨:

- refresh token을 Electron 앱에 저장하지 않았기 때문
- 1차 범위에서는 정상적인 제한으로 보고 후속 작업에서 처리

브라우저에서 Google OAuth가 또 차단됨:

- `shell.openExternal()`이 아니라 Electron 내부 팝업이 열리고 있는지 확인
- Electron에서는 반드시 기본 브라우저를 열어야 함

---

## Auto Update Plan

### Goal

앱이 실행될 때 GitHub Releases에서 새 버전을 자동으로 감지하고, 백그라운드에서 다운로드 후 사용자에게 재시작을 유도한다.

버전 번호는 `package.json`의 `version` 필드를 단일 진실의 원천으로 삼고, npm version 명령으로 자동 관리한다.

흐름:

```text
npm version patch/minor/major
→ package.json version 자동 증가 + git tag 생성
→ npm run electron:build
→ release/ 폴더에 새 .exe 생성
→ gh release create로 GitHub Releases에 업로드
→ 기존 앱이 실행되면 latest.yml을 polling해서 업데이트 감지
→ 백그라운드 다운로드
→ 사용자에게 "새 버전이 있습니다. 재시작할까요?" 알림
→ 앱 재시작 시 자동 설치
```

### Step 1. electron-updater 설치

```powershell
npm install electron-updater
npm install -D @types/electron-updater
```

### Step 2. package.json publish 설정

`electron-builder`가 어디에 업데이트 피드를 게시할지 알아야 한다.

`package.json`의 `build` 섹션에 추가:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "7saval",
      "repo": "writingAI"
    }
  }
}
```

이 설정이 있어야 `electron-builder`가 빌드 시 `latest.yml`을 올바른 형식으로 생성한다.

할 일:

- [x] `package.json` `build` 섹션에 `publish` 설정 추가

### Step 3. main.ts 업데이트 로직

수정 파일:

- [`electron/main.ts`](../electron/main.ts)

추가할 것:

```ts
import { autoUpdater } from "electron-updater";

// 업데이트 로그 활성화 (개발 중 디버깅용)
autoUpdater.logger = require("electron-log");

// 앱 준비 후 업데이트 체크
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

// 업데이트 다운로드 완료 → 렌더러에 알림
autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update-downloaded");
});
```

렌더러에서 재시작 요청을 받을 IPC 핸들러도 추가:

```ts
ipcMain.handle("restart-and-install", () => {
  autoUpdater.quitAndInstall();
});
```

할 일:

- [x] `electron-updater` import 추가
- [x] `autoUpdater.checkForUpdatesAndNotify()` 호출 추가
- [x] `update-downloaded` 이벤트 → 렌더러 IPC 전송
- [x] `restart-and-install` IPC 핸들러 추가

### Step 4. preload.ts IPC 노출

수정 파일:

- [`electron/preload.ts`](../electron/preload.ts)

추가할 것:

```ts
onUpdateDownloaded: (callback: () => void) =>
  ipcRenderer.on("update-downloaded", callback),
restartToUpdate: () => ipcRenderer.invoke("restart-to-update"),
```

할 일:

- [x] `onUpdateDownloaded` 노출
- [x] `restartToUpdate` 노출

### Step 5. electron.d.ts 타입 추가

수정 파일:

- [`frontend/src/types/electron.d.ts`](../frontend/src/types/electron.d.ts)

추가할 것:

```ts
onUpdateDownloaded: (callback: () => void) => void;
restartToUpdate: () => Promise<void>;
```

할 일:

- [x] 타입 선언 추가

### Step 6. 프론트엔드 업데이트 알림 UI

수정 파일 (예시):

- `frontend/src/components/common/UpdateBanner.tsx` (신규)

동작:

- `window.electron.onUpdateDownloaded()` 구독
- 업데이트 감지 시 하단 또는 상단에 배너 표시
- "지금 재시작" 버튼 클릭 → `window.electron.restartToUpdate()` 호출
- Electron 앱 안에서만 렌더링 (`window.electron` 조건부)

할 일:

- [x] `UpdateBanner` 컴포넌트 작성
- [x] `App.tsx` 또는 레이아웃 컴포넌트에 포함

### Step 7. 버전 번호 자동화

`npm version` 명령이 `package.json`의 `version`을 올리고 git tag를 자동 생성한다.

```powershell
# 패치 버전 올리기 (0.1.0 → 0.1.1)
npm version patch

# 마이너 버전 올리기 (0.1.0 → 0.2.0)
npm version minor

# 메이저 버전 올리기 (0.1.0 → 1.0.0)
npm version major
```

버전 올린 뒤 빌드:

```powershell
npm run electron:build
```

`electron-builder`가 `package.json`의 `version`을 읽어 `.exe` 파일명과 `latest.yml`에 자동 반영한다.

할 일:

- [ ] `npm version patch` 테스트 (버전 증가 + git tag 확인)
- [ ] 새 버전으로 빌드 후 파일명 확인

### Step 8. 릴리스 워크플로우 (수동)

gh CLI가 설치된 경우 아래 순서로 릴리스한다.

```powershell
# 1. 버전 올리기
npm version patch

# 2. 빌드
npm run electron:build

# 3. GitHub Release 생성 + .exe + latest.yml 업로드
$version = node -p "require('./package.json').version"
& "C:\Program Files\GitHub CLI\gh.exe" release create "v$version" "release\Companion.Writer.Setup.exe" "release\latest.yml" `
  --repo 7saval/writingAI `
  --title "v$version" `
  --notes "업데이트 내용을 여기에 작성"

# 4. git push (현재 브랜치 + 태그 포함)
git push origin HEAD --tags
```

이 순서로 올리면:

- GitHub Release에 새 `.exe`가 올라감
- `latest.yml`도 같이 올라가서 기존 앱이 업데이트를 감지함
- 헤더 다운로드 버튼 URL도 새 버전으로 갱신 필요

할 일:

- [x] gh CLI 설치 (`winget install --id GitHub.cli`)
- [x] `gh auth login`으로 인증
- [ ] 위 릴리스 워크플로우 1회 테스트

### Step 9. 헤더 다운로드 URL 버전 관리

현재 헤더에 버전이 하드코딩되어 있다.

```tsx
href =
  "https://github.com/7saval/writingAI/releases/download/v0.1.0/Companion.Writer.Setup.0.1.0.exe";
```

릴리스할 때마다 URL을 수동으로 올리는 대신, GitHub의 `latest` redirect를 활용할 수 있다.

```
https://github.com/7saval/writingAI/releases/latest/download/Companion.Writer.Setup.exe
```

이 URL은 항상 가장 최근 릴리스의 해당 파일명을 가리킨다.

단, 파일명이 릴리스마다 동일해야 한다. `electron-builder`는 기본적으로 버전 번호를 파일명에 포함하므로, `artifactName` 옵션으로 고정할 수 있다.

`package.json` `build.win` 설정에 추가:

```json
"win": {
  "target": "nsis",
  "icon": "build/icon.ico",
  "artifactName": "Companion.Writer.Setup.exe"
}
```

이렇게 하면 버전과 관계없이 파일명이 항상 `Companion.Writer.Setup.exe`로 고정되고, 헤더 URL도 고정된다.

할 일:

- [ ] `artifactName` 설정 추가
- [ ] 헤더 URL을 `latest/download` 방식으로 변경
- [ ] 테스트: 새 버전 릴리스 후 URL이 새 파일을 가리키는지 확인

### 완료 기준

아래 조건이 모두 만족되면 자동 업데이트 완료로 본다.

- `npm version patch` → `npm run electron:build`로 새 버전 `.exe` 생성
- GitHub Release 업로드 후 기존 앱에서 업데이트 감지
- "새 버전이 있습니다" 배너 표시
- "재시작" 클릭 시 새 버전으로 자동 설치
- 헤더 다운로드 버튼이 항상 최신 버전을 받아옴
