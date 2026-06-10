# WritingAI - Companion Writer

**AI와 함께 소설을 써보세요.** 사용자와 AI가 번갈아가며 한 단락씩 이야기를 만들어나가는 인터랙티브 글쓰기 플랫폼입니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19+-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)](https://www.typescriptlang.org/)

## 주요 기능

- **협력 글쓰기**: 사용자가 한 단락을 작성하면 AI가 자동으로 다음 단락을 생성합니다
- **프로젝트 관리**: 여러 개의 창작 프로젝트를 생성하고 관리할 수 있습니다
- **시놉시스 & 설정집**: 이야기의 전체 줄거리와 세계관(인물, 장소, 아이템 등)을 체계적으로 관리합니다
- **장르별 AI 스타일**: 판타지, 로맨스, 미스터리, 스릴러, SF, 호러, 드라마 7가지 장르에 맞는 글쓰기 스타일을 제공합니다
- **문맥 유지**: 프로젝트의 시놉시스, 설정집, 최근 단락들을 바탕으로 일관성 있는 AI 응답을 생성합니다
- **단락 관리**: 작성한 단락을 수정, 삭제할 수 있으며 AI 단락을 재생성할 수 있습니다

## 기술 스택

### Frontend
- **React 19** - UI 프레임워크
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Shadcn/UI** - 접근성 높은 UI 컴포넌트
- **React Router 7** - 클라이언트 라우팅
- **React Hook Form + Zod** - 폼 관리 및 검증
- **Axios** - HTTP 클라이언트

### Backend
- **Express.js 5** - 웹 서버 프레임워크
- **TypeScript** - 타입 안전성
- **TypeORM 0.3** - ORM 라이브러리
- **MySQL/MariaDB** - 데이터베이스
- **OpenAI API** - AI 텍스트 생성 (GPT-4o-mini)
- **dotenv** - 환경 변수 관리
- **CORS** - 크로스 오리진 요청 처리

## 프로젝트 구조

```
writingAI/
├── electron/                        # Electron 데스크톱 앱
│   ├── main.ts                      # 메인 프로세스 (BrowserWindow 관리)
│   ├── preload.ts                   # 컨텍스트 브릿지 (IPC 노출)
│   └── database.ts                  # 로컬 SQLite 설정
│
├── backend/                         # Express API 서버
│   └── src/
│       ├── index.ts                 # 서버 진입점
│       ├── data-source.ts           # TypeORM 데이터소스 설정
│       ├── entity/                  # TypeORM 엔티티
│       │   ├── Users.ts
│       │   ├── Projects.ts
│       │   ├── Paragraphs.ts
│       │   └── SocialAccounts.ts
│       ├── controllers/             # 요청 처리 및 비즈니스 로직
│       │   ├── authController.ts
│       │   ├── projectController.ts
│       │   ├── contextController.ts
│       │   ├── paragraphController.ts
│       │   ├── writingController.ts  # 변형 생성·선택 엔드포인트 포함
│       │   └── desktopGoogleAuthController.ts
│       ├── routes/                  # API 라우트
│       ├── services/
│       │   ├── aiService.ts         # GPT-4o-mini 직접 호출 (스트리밍 포함)
│       │   ├── variantSessionStore.ts  # 변형 인메모리 세션 (TTL 5분)
│       │   ├── desktopOAuthSessions.ts
│       │   └── langgraph/           # LangGraph AI 파이프라인
│       │       ├── state.ts         # WritingStateAnnotation 상태 정의
│       │       ├── graph.ts         # 노드·엣지 조립 (조건부 루프 포함)
│       │       ├── index.ts         # runWritingGraph / runVariantsGraph
│       │       └── nodes/
│       │           ├── buildContext.ts        # 컨텍스트 메시지 빌드
│       │           ├── generateContent.ts     # Phase 1 단일 생성
│       │           ├── generateVariants.ts    # Phase 2 병렬 3변형 생성
│       │           ├── qualityEvaluator.ts    # Phase 4 LLM-as-Judge 평가
│       │           ├── basicQualityFilter.ts  # Phase 6 규칙 기반 필터
│       │           └── loreConsistencyChecker.ts  # Phase 5 설정집 검증
│       ├── middleware/              # 인증·권한·에러 처리
│       ├── migrations/              # TypeORM 마이그레이션
│       ├── types/                   # Express 타입 확장
│       └── utils/
│           └── sseHelpers.ts        # SSE 헤더 설정 공통 유틸
│
└── frontend/                        # React SPA (웹 & Electron 렌더러)
    └── src/
        ├── main.tsx                 # 진입점
        ├── App.tsx                  # 라우터 설정
        ├── pages/                   # 라우트 페이지
        │   ├── Home.tsx
        │   ├── WritingSession.tsx
        │   ├── auth/                # 로그인·회원가입·비밀번호 재설정
        │   └── modal/               # 프로젝트·시놉시스·설정집 모달
        ├── components/
        │   ├── Editor.tsx           # 단락 입력 + 변형 선택 UI 통합
        │   ├── VariantSelector.tsx  # SSE 스트리밍 변형 카드 선택
        │   ├── ParagraphItem.tsx
        │   ├── ProjectSidebar.tsx
        │   ├── StoryContextPanel.tsx
        │   ├── common/              # Header·Footer·Modal 등 공통 컴포넌트
        │   ├── auth/                # ProtectedRoute
        │   ├── layout/
        │   └── ui/                  # Shadcn/UI 프리미티브
        ├── features/
        │   └── export/              # PDF·Word 내보내기 기능
        ├── hooks/                   # Custom React hooks
        ├── store/                   # Zustand 전역 상태
        │   ├── authStore.ts
        │   ├── useWritingStore.ts
        │   └── useDialogStore.ts
        ├── api/                     # Axios 기반 API 클라이언트
        ├── lib/
        │   ├── sseClient.ts         # POST SSE fetch 공통 유틸
        │   ├── electronHelper.ts    # Electron IPC 브릿지 헬퍼
        │   ├── queryClient.ts
        │   └── utils.ts
        ├── constants/               # 장르·카테고리·글쓰기 단계 상수
        ├── types/
        │   ├── database.ts          # 공유 TypeScript 타입 정의
        │   └── electron.d.ts        # Electron window 타입 선언
        └── utils/                   # 라우트 목록 등 유틸
```

## 빠른 시작

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- MySQL/MariaDB 데이터베이스
- OpenAI API 키 ([API 키 발급하기](https://platform.openai.com/account/api-keys))

### 설치 및 실행

#### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/writingAI.git
cd writingAI
```

#### 2. 백엔드 설정
```bash
cd backend
npm install

# .env 파일 생성
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=writing_ai_db
OPENAI_API_KEY=sk-your-api-key
EOF

# 데이터베이스 마이그레이션
npm run migration:run

# 개발 서버 시작
npm run dev
```

**백엔드는 http://localhost:5000 에서 실행됩니다**

#### 3. 프론트엔드 설정
```bash
cd frontend
npm install

# 개발 서버 시작
npm run dev
```

**프론트엔드는 http://localhost:5173 에서 실행됩니다**

## 사용 방법

### 프로젝트 생성
1. 홈 페이지에서 "새 프로젝트 만들기" 버튼을 클릭합니다
2. 제목, 장르, 설명을 입력합니다
3. "시작하기"를 클릭하면 글쓰기 세션이 열립니다

### 글쓰기 시작
1. 에디터에서 한 단락을 작성합니다
2. "제출" 버튼을 클릭하면 AI가 자동으로 다음 단락을 생성합니다
3. 사용자의 단락과 AI의 단락이 번갈아 추가됩니다

### 시놉시스 & 설정집 관리
- **우측 패널**에서 시놉시스를 작성하고 설정집에 인물, 장소, 규칙 등을 추가합니다
- AI는 이 정보들을 바탕으로 더욱 일관성 있는 단락을 생성합니다

### 단락 편집
- 작성한 단락의 **편집 아이콘**을 클릭하여 내용을 수정할 수 있습니다
- **삭제 아이콘**을 클릭하면 단락을 제거할 수 있습니다
- AI 단락의 **재생성 아이콘**을 클릭하면 새로운 내용을 생성합니다

## API 문서

### 주요 엔드포인트

#### 프로젝트 관리
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects` - 모든 프로젝트 조회
- `GET /api/projects/:id` - 프로젝트 상세 조회
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

#### 컨텍스트 관리
- `GET /api/projects/:id/context` - 시놉시스와 설정집 조회
- `PUT /api/projects/:id/context` - 시놉시스와 설정집 수정

#### 글쓰기 세션
- `POST /api/writing/:id/write` - 사용자 단락 제출 및 AI 응답 생성

#### 단락 관리
- `PUT /api/paragraphs/:id` - 단락 내용 수정
- `DELETE /api/paragraphs/:id` - 단락 삭제
- `POST /api/paragraphs/:id/regenerate` - AI 단락 재생성

자세한 API 명세는 `_docs/api_specification.md` 참고하세요.

## 환경 변수

### Backend (.env)
```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=writing_ai_db

# OpenAI API
OPENAI_API_KEY=sk-your-api-key

# 서버
PORT=5000
NODE_ENV=development
```

### Frontend (.env - 선택사항)
```env
VITE_API_URL=http://localhost:5000/api
```

## 개발 가이드

### 백엔드 명령어
```bash
# 개발 서버 (자동 재로드)
npm run dev

# 타입 체크
npm run dev:typecheck

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 데이터베이스 마이그레이션
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```

### 프론트엔드 명령어
```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 프리뷰
npm run preview

# Linting
npm run lint
```

## 데이터베이스 스키마

### User
사용자 정보 (향후 인증 기능 추가 예정)

### Project
- **id**: 프로젝트 ID
- **title**: 프로젝트 제목
- **genre**: 장르 (fantasy, romance, mystery, thriller, sf, horror, drama)
- **description**: 프로젝트 설명
- **synopsis**: 작품 시놉시스 (텍스트)
- **lorebook**: 설정집 (JSON 배열)
- **createdAt / updatedAt**: 생성/수정 시간

### Paragraph
- **id**: 단락 ID
- **projectId**: 프로젝트 FK
- **content**: 단락 내용
- **writtenBy**: 작성자 (user | ai)
- **orderIndex**: 단락 순서
- **createdAt**: 생성 시간

### LoreNote (설정집 항목)
```json
{
  "id": "uuid",
  "category": "character", // character, location, plot, rule, item
  "title": "캐릭터 이름",
  "content": "캐릭터 설명",
  "tags": ["main", "protagonist"],
  "includeInPrompt": true
}
```

## 아키텍처

### Backend 레이어드 아키텍처
```
Routes (HTTP 라우팅)
  ↓
Controllers (비즈니스 로직)
  ↓
Services (특수 기능: AI 생성)
  ↓
TypeORM Entities (데이터베이스 모델)
```

### AI 통합
- **모델**: GPT-4o-mini
- **컨텍스트**: 최근 5개 단락 + 시놉시스 + 설정집
- **Temperature**: 0.8 (창의성)
- **Max Tokens**: 500 (응답 길이)

각 장르별로 맞춤화된 시스템 프롬프트를 사용하여 일관된 글쓰기 스타일을 유지합니다.

## 주요 기능 구현 상황

- ✅ 프로젝트 CRUD
- ✅ AI 글쓰기 세션
- ✅ 시놉시스 & 설정집 관리
- ✅ 단락 관리 (수정/삭제)
- ✅ AI 단락 재생성
- ✅ 장르별 프롬프트 엔지니어링
- ⏳ 사용자 인증 (구현 예정)
- ⏳ 프로젝트 내보내기 (구현 예정)
- ⏳ 글쓰기 통계 (구현 예정)

## 최근 업데이트

- **2025-12-10**: 장르 프롬프트 보완, 컨텍스트 버튼 가시성 개선
- **2025-12-09**: 설정집 카테고리, 태그, 홈 레이아웃 구현
- **2025-12-08**: 시놉시스 & 설정집 모달 분리
- **2025-12-07**: 단락 관리 UI (수정/삭제/재생성) 구현

## 기여하기

이 프로젝트는 학습 목적으로 개발되고 있습니다. 버그 리포트나 제안사항은 이슈를 통해 알려주세요.

### 개발 환경 설정
1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치를 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 사항은 [LICENSE](LICENSE) 파일을 참고하세요.

## 문의 및 지원

프로젝트에 대한 질문이나 피드백이 있으신가요?
- 🐛 버그 리포트: [GitHub Issues](https://github.com/yourusername/writingAI/issues)
- 💡 기능 제안: [GitHub Discussions](https://github.com/yourusername/writingAI/discussions)

## 관련 문서

- [API 명세서](_docs/api_specification.md) - 상세 API 문서
- [프로젝트 기획서](_docs/planning.md) - 전체 프로젝트 기획

## 감사의 말

이 프로젝트는 다음 오픈소스를 활용합니다:
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [TypeORM](https://typeorm.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

---

**WritingAI와 함께 당신의 이야기를 만들어보세요!** 🚀
