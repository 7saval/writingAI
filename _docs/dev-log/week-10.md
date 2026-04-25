### 📟 2026-04-14 (Day 35)

#### 🎯 오늘의 목표

- [x] Electron 1차 Windows 빌드/배포 설정 정리
- [x] `electron-builder` 기반 설치 파일 생성
- [x] 배포 앱에서 `frontend/dist`를 정상 로드하도록 경로 수정
- [x] Render API 주소를 Electron 빌드에 주입
- [x] 배포 산출물 `release/` Git 추적 제외
- [x] Electron Google 로그인 차단 원인 분석
- [x] Electron용 Google 로그인 별도 구현 계획 문서화
- [x] Electron Google 로그인용 backend OAuth session store 1차 구현

#### ✅ 완료한 작업

- [x] Electron 배포 설정 추가 및 정리
  - 루트 `package.json`에 `name`, `version`, `description`, `author` 메타데이터 추가
  - `electron-builder`의 `build` 설정 구성
  - Windows 타깃을 `nsis`로 설정
  - 출력 폴더를 `release/`로 지정

- [x] Electron 배포용 빌드 흐름 구성
  - `frontend` 빌드
  - Electron main/preload TypeScript 컴파일
  - `electron-builder` 패키징
  - 최종 명령:

```powershell
cmd /c npm run electron:build
```

- [x] 배포 앱의 `frontend/dist` 로드 경로 수정
  - Electron main process에서 배포 시 `frontend/dist/index.html`을 열도록 변경
  - `electron-builder.files`에 `frontend/dist/**/*` 전체를 포함
  - `index.html`만 포함하면 JS/CSS/font asset이 빠질 수 있음을 확인

- [x] Vite asset 경로 수정
  - `frontend/vite.config.ts`에 `base: "./"` 추가
  - `file://` 환경에서 `/assets/...` 절대경로가 깨질 수 있으므로 `./assets/...` 상대경로로 빌드되게 조정

- [x] Electron 빌드 시 Render API 주소 주입
  - Vercel 환경변수는 Electron 로컬 빌드에 자동 적용되지 않음을 확인
  - `electron:build` 명령에 `VITE_API_URL=https://writingai-dcb3.onrender.com/api` 주입
  - 설치 앱에서 로그인 API가 `localhost:5000`이 아니라 Render API를 바라보도록 수정

- [x] Windows 설치 파일 생성 성공
  - 생성 파일:

```text
release/Companion Writer Setup 0.1.0.exe
release/Companion Writer Setup 0.1.0.exe.blockmap
release/latest.yml
release/win-unpacked/
```

- [x] 배포 산출물 Git ignore 처리
  - `.gitignore`에 `release/` 추가
  - 설치 파일과 `win-unpacked` 폴더가 Git에 올라가지 않도록 정리

- [x] Electron Google 로그인 차단 원인 분석
  - 기존 `@react-oauth/google` 팝업 방식은 Electron 내장 브라우저에서 Google OAuth 정책상 차단될 수 있음을 확인
  - 스크린샷의 `400 invalid_request`는 Google OAuth가 embedded user-agent를 허용하지 않는 흐름으로 판단
  - Electron에서는 기본 브라우저를 여는 별도 OAuth 흐름이 필요하다고 정리

- [x] Electron용 Google 로그인 구현 계획 문서화
  - `_docs/electron_build.md` 하단에 `Electron Google Login Plan` 추가
  - 백엔드 session + Electron polling + 기본 브라우저 `openExternal` 방식으로 계획 수립
  - 구현 순서와 수정 파일 링크를 단계별로 정리

- [x] Electron Google 로그인용 backend session store 1차 구현
  - `backend/src/services/desktopOAuthSessions.ts` 구현
  - `backend/src/types/desktopOAuth.ts` 타입 분리
  - 5분 만료 session 관리
  - PKCE용 `codeVerifier`, `codeChallenge` 생성
  - polling 응답용 serializer 추가
  - 함수별 주석 추가

#### 🧩 해결한 문제

**문제 1: `electron-builder`가 `name`, `version` 누락으로 실패**

- **상황**: `npm run electron:build` 실행 시 `Please specify 'name'`, `Please specify 'version'` 에러 발생
- **원인**: 루트 `package.json`에 Electron app package metadata가 부족했음
- **해결**:
  - `name: "companion-writer"`
  - `version: "0.1.0"`
  - `description`
  - `author`
    추가
- **결과**: 빌드가 다음 단계로 진행됨

**문제 2: 배포 앱에서 `frontend/dist` asset 경로가 깨질 수 있었음**

- **상황**: `frontend/dist/index.html`만 패키지에 넣으면 JS/CSS/font asset이 빠질 수 있었음
- **원인**:
  - `electron-builder.files`에 `frontend/dist/index.html`만 포함
  - Vite 기본 빌드 결과가 `/assets/...` 절대경로를 사용
- **해결**:
  - `frontend/dist/**/*` 전체 포함
  - `vite.config.ts`에 `base: "./"` 추가
  - Electron main process에서 `../frontend/dist/index.html` 로드
- **결과**: `file://` 환경에서도 프론트 asset을 상대경로로 로드할 수 있게 됨

**문제 3: 아이콘 파일 때문에 Windows 패키징 실패**

- **상황**: `build/pencil.ico must be at least 256x256` 에러 발생
- **원인**: 지정한 `.ico` 파일이 Windows 패키징 요구 조건을 만족하지 못함
- **해결**:
  - 1차 빌드 목표에서는 아이콘 커스터마이징을 제외
  - `win.icon` 설정 제거
- **결과**: 기본 Electron 아이콘으로 빌드 진행 가능

**문제 4: `winCodeSign` 압축 해제 중 symbolic link 권한 오류**

- **상황**: NSIS 설치 파일 생성 중 `Cannot create symbolic link` 오류 발생
- **원인**: Windows 환경에서 electron-builder의 code signing helper 압축 해제 시 symlink 생성 권한 부족
- **해결**:
  - `win.signAndEditExecutable: false` 추가
- **결과**: 1차 설치 파일 생성 성공

**문제 5: 설치 앱에서 로그인 API가 `localhost:5000`을 바라봄**

- **상황**: 설치 앱에서 로그인부터 실패
- **원인**:
  - 프론트 기본 API 주소가 `http://localhost:5000/api`
  - Vercel의 `VITE_API_URL`은 Electron 로컬 빌드에는 자동 주입되지 않음
- **해결**:
  - `electron:build`에 `cross-env VITE_API_URL=https://writingai-dcb3.onrender.com/api` 추가
- **결과**: 설치 앱이 Render API를 호출하도록 변경

#### 🧠 배운 점

**1. Electron 배포 빌드는 웹 배포와 환경변수 주입 시점이 다르다**

- Vercel 환경변수는 Vercel에서 웹 프론트를 빌드할 때만 적용된다.
- Electron 설치 파일은 로컬에서 다시 프론트를 빌드해서 포함하므로, 빌드 명령에서 직접 `VITE_API_URL`을 주입해야 한다.
- 같은 React 앱이라도 웹 배포와 Electron 배포는 빌드 환경이 다르다는 점을 분리해서 봐야 한다.

**2. `file://` 환경에서는 asset path와 router 전략이 중요하다**

- 웹에서는 `/assets/...` 절대경로가 자연스럽지만, Electron 배포 앱은 `file://`로 `index.html`을 여는 구조다.
- Vite `base: "./"` 설정이 없으면 정적 asset 로딩이 깨질 수 있다.
- Electron에서는 프론트 산출물 전체를 포함하고, main process에서 정확한 `index.html` 경로를 열어야 한다.

**3. Electron builder의 실패는 단계별로 원인이 다르다**

- metadata 누락
- icon 규격
- native module rebuild
- code signing helper
- NSIS 생성

각 단계가 독립적으로 실패할 수 있으므로, 로그에서 어디까지 진행됐는지를 보는 게 중요했다.

**4. Google OAuth는 Electron 내장 브라우저에서 처리하면 안 된다**

- Google 로그인 팝업이 Electron 앱 안에서 뜨면 embedded user-agent 정책에 걸릴 수 있다.
- Electron용 OAuth는 기본 브라우저를 열고, 앱은 별도 방식으로 결과를 받아야 한다.
- 이번 프로젝트에서는 deep link보다 backend session + polling 방식이 1차 구현에 더 안전하다고 판단했다.

#### 🧪 확인한 것

- [x] `cmd /c npm run build --prefix frontend` 성공
- [x] `cmd /c npx tsc -p tsconfig.electron.json` 성공
- [x] `cmd /c npm run electron:build` 성공
- [x] `release/Companion Writer Setup 0.1.0.exe` 생성 확인
- [x] `frontend/dist/index.html`의 asset 경로가 `./assets/...`로 생성되는 것 확인
- [x] `cmd /c npm run build --prefix backend` 성공
- [x] 설치 앱에서 이메일 로그인 API가 Render API를 바라보는 방향으로 수정

#### 📌 내일 할 일

- [x] Electron용 Google 로그인 backend controller 구현
  - `backend/src/controllers/desktopGoogleAuthController.ts`
  - `POST /api/auth/google/desktop/session`
  - `GET /api/auth/google/desktop/callback`
  - `GET /api/auth/google/desktop/session/:sessionId`
- [x] `backend/src/routes/authRoutes.ts`에 desktop Google auth route 연결
- [x] Google authorization code를 token endpoint에 교환하는 로직 구현
- [x] Google Cloud Console redirect URI와 백엔드 `redirect_uri` 일치 여부 재확인
- [x] Electron main/preload에 `openExternalUrl` IPC 추가
- [x] 프론트 로그인 화면에서 웹 Google 로그인과 Electron Google 로그인 분기
- [x] Electron 앱에서 polling으로 Google 로그인 완료 처리

- [ ] 1차 빌드/배포 후 남은 구현 사항 정리 및 진행
  - [ ] 설치 앱 수동 검증 체크리스트 수행
    - 앱 실행
    - 이메일 로그인
    - 프로젝트 목록 조회
    - 프로젝트 진입
    - 문단 작성/저장
    - 앱 종료 후 재실행 시 데이터 유지 확인
    - Word export
    - PDF export
  - [ ] 배포용 앱 아이콘 재준비
    - 256x256 이상 포함된 `.ico` 파일 생성
    - `package.json`의 `win.icon` 설정 복구
  - [ ] `signAndEditExecutable: false` 우회 설정 재검토
    - 1차 내부 테스트에서는 유지 가능
    - 공개 배포 전 코드 서명/실행 파일 메타데이터 편집 방식 다시 확인
  - [ ] Electron 앱 데이터 위치와 DB 확인 방법 문서화
    - `app.getPath("userData")`
    - `writingApp.db`
    - Windows `%APPDATA%/Companion Writer`
  - [ ] 배포 환경 로그 확인 방법 정리
    - Electron DevTools
    - Render backend logs
    - 설치 앱 실행 로그
  - [ ] 배포 산출물 공유 방식 결정
    - GitHub Releases
    - Notion/Drive 임시 공유
    - 내부 테스트용 설치 파일 전달 방식
  - [ ] 장기 후속 작업 분리
    - 자동 업데이트
    - Windows 코드 서명
    - macOS 빌드
    - CI/CD 기반 자동 빌드

#### 🚨 이슈/질문

- Electron Google 로그인에서 refresh token을 1차 구현에 포함할지, accessToken 기반 로그인 완료까지만 볼지 결정 필요
- backend session store를 현재는 메모리 `Map`으로 설계했는데, Render 재시작/멀티 인스턴스까지 고려하면 Redis 또는 DB 저장으로 확장 필요
- `signAndEditExecutable: false`는 1차 빌드를 위한 우회이므로, 공개 배포 전 코드 서명과 아이콘 규격을 다시 정리해야 함 ✅
- Google OAuth 신규 사용자 흐름에서 `extra-info` 페이지로 이동할 때 기존 웹 플로우와 동일하게 처리되는지 검증 필요 ✅

#### 📊 진행률

Week 10: 25%
Total: 72%

---
