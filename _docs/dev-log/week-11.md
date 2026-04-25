### 📟 2026-04-25 (Day 36)

#### 🚀 개요
Electron 내장 브라우저(`BrowserWindow`)에서 Google OAuth 로그인이 차단되는 문제를 해결하기 위해, 시스템 기본 브라우저를 활용한 **백엔드 세션 + 상태 폴링 방식**의 인증 플로우를 구현했습니다.

#### 🛠 주요 작업 내용

**Backend (API Server)**
- `desktopGoogleAuthController.ts` 구현: OAuth 세션 생성, Google 콜백 처리, 인증 상태 확인 API 추가
- `authRoutes.ts`: 데스크톱 전용 인증 경로 등록
- PKCE(`Code Challenge`/`Verifier`) 적용으로 보안 강화

**Electron (Main/Preload)**
- `main.ts`: 외부 브라우저를 열기 위한 `open-external-url` IPC 핸들러 추가
- `preload.ts`: 렌더러 프로세스에서 외부 URL을 열 수 있도록 브릿지 노출
- `electron.d.ts`: 프론트엔드 타입 정의 업데이트

**Frontend (React)**
- `useDesktopGoogleLogin`: 세션 생성부터 폴링 성공까지의 비즈니스 로직을 캡슐화한 커스텀 훅 구현
- `Login.tsx`: 환경(Web/Electron)에 따른 Google 로그인 UI 분기 처리 및 연동

#### 🧪 테스트 방법
- 로컬 백엔드 서버 실행 (포트 5000)
- Electron 앱 실행 및 로그인 화면 진입
- 'Google 계정으로 로그인' 버튼 클릭 시 기본 브라우저가 열리는지 확인
- 브라우저 로그인 완료 후 앱으로 자동 리디렉션 및 로그인 처리 확인

#### 📝 참고 사항
- 로컬 테스트를 위해 `.env`의 `GOOGLE_DESKTOP_REDIRECT_URI`를 `localhost` 주소로 설정했습니다.
- 배포 시 Render 대시보드의 환경 변수 설정이 필요합니다.
