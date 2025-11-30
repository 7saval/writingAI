# 글쓰기 AI 서포터즈 프로젝트 기획서

## 📋 프로젝트 개요

### 프로젝트 명
**Companion Writer(Writing AI Supporters)** - AI와 함께 소설 쓰기

### 프로젝트 목표
사용자와 AI가 번갈아가며 한 단락씩 소설을 작성하는 인터랙티브 글쓰기 플랫폼 개발

### 개발 기간
4주 (28일)

### 개발자 레벨
초보 개발자

---

## 🛠️ 기술 스택

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MariaDB 10.5+ (MySQL 프로토콜 호환)

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3 + PostCSS (custom 프리셋)

### AI
- **Primary**: OpenAI GPT API (GPT-4o-mini)
- **Alternative**: Anthropic Claude API

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: nodemon, ts-node

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  Express API    │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│ MariaDB │ │ OpenAI   │
│   DB    │ │   API    │
└─────────┘ └──────────┘
```

---

## 📊 데이터베이스 설계

### ERD (Entity Relationship Diagram)

```
User
├── id (PK)
├── email (unique)
├── password (hashed)
├── username
└── createdAt

Project
├── id (PK)
├── userId (FK → User)
├── title
├── description
├── genre
├── synopsis (text)          # 작품 전체 요약
├── lorebook (json/text)     # 설정집(세계관/인물/아이템) 메모
├── createdAt
└── updatedAt

Paragraph
├── id (PK)
├── projectId (FK → Project)
├── content (text)
├── author (enum: 'user', 'ai')
├── orderIndex
└── createdAt
```

### 관계
- User 1:N Project
- Project 1:N Paragraph

> **시놉시스 & 설정집 저장 전략**
> - `Project.synopsis`: 최대 3,000자까지 지원하는 TEXT 컬럼, 글 전체 방향성을 요약
> - `Project.lorebook`: JSON 컬럼(또는 TEXT로 직렬화)로 인물, 세계관, 규칙, 아이템을 섹션별 배열로 저장
> - 프론트엔드에서는 시놉시스 1개 필드 + 설정집 다중 노트 구조를 제공하고, 저장 시 백엔드에서 하나의 JSON 객체로 병합한다.

---

## 🎯 핵심 기능 명세

### 1. 사용자 인증 (Week 4)
- [ ] 회원가입
- [ ] 로그인
- [ ] JWT 토큰 기반 인증

### 2. 프로젝트 관리 (Week 1-3)
- [x] 프로젝트 생성 (제목, 장르, 설명)
- [x] 프로젝트 목록 조회
- [x] 프로젝트 상세 조회
- [ ] 프로젝트 수정/삭제

### 3. AI 글쓰기 세션 (Week 2-3)
- [x] 사용자 단락 작성
- [x] AI 자동 응답 생성
- [x] 이전 컨텍스트 유지
- [x] 단락 순서 관리
- [ ] 단락 재생성 기능
- [ ] 단락 수정/삭제

### 4. 고급 기능 (Week 4)
- [ ] 장르별 글쓰기 스타일
- [ ] 창의성 레벨 조절
- [ ] 단락 길이 설정
- [ ] 프로젝트 내보내기 (txt, pdf)

### 5. 시놉시스 & 설정집 패널 (Week 2-3)
- [ ] 프로젝트별 시놉시스 편집/자동 저장
- [ ] 설정집(세계관, 인물, 아이템) 카드 관리
- [ ] 글쓰기 화면 우측 패널 탭 전환 레이아웃
- [ ] "AI 컨텍스트에 포함" 토글 및 반영 여부 시각화
- [ ] 백엔드 API: `PUT /api/projects/:id/context` (synopsis, lorebook)
**핵심 파일**:
```
src/
└── services/
    └── aiService.ts
```

**주요 함수**:
- `generateNextParagraph()`: AI 단락 생성
- `buildPrompt()`: 프롬프트 구성
- `limitContext()`: 컨텍스트 토큰 제한

#### Day 4-5: 글쓰기 세션 API
- [ ] Paragraph CRUD API
- [ ] 글쓰기 세션 엔드포인트
  - POST /api/projects/:id/write (사용자 작성 + AI 응답)
  - GET /api/projects/:id/paragraphs (단락 목록)
  - POST /api/paragraphs/:id/regenerate (AI 재생성)
- [ ] 단락 순서(orderIndex) 관리
- [ ] 트랜잭션 처리
- [ ] 시놉시스 & 설정집 API
  - GET /api/projects/:id/context → { synopsis, lorebook }
  - PUT /api/projects/:id/context → 시놉시스 및 설정집 동시 저장 (optimistic locking)
  - LoreNote 단위 PATCH/DELETE (추가 기능 대비)
  - 컨텍스트 변경 시 `ContextHistory` 테이블에 스냅샷 저장

**파일 구조**:
```
src/
├── routes/
│   └── writingRoutes.ts
└── controllers/
    └── writingController.ts
```

#### Day 6-7: 에러 처리 & 최적화
- [ ] API 에러 핸들링
  - API 키 오류
  - 할당량 초과
  - 타임아웃 처리
- [ ] 로깅 시스템 추가
- [ ] 응답 시간 최적화
- [ ] API 레이트 리미팅

├── api/
│   └── client.ts
├── pages/
├── components/
└── types/
```

#### Day 3-4: 프로젝트 관리 화면
- [ ] 프로젝트 목록 페이지
  - 프로젝트 카드 컴포넌트
  - 빈 상태 처리
- [ ] 프로젝트 생성 폼
  - 제목, 장르, 설명 입력
  - 유효성 검사
- [ ] 프로젝트 상세 페이지
  - 메타데이터 표시
  - 글쓰기 세션으로 이동

**컴포넌트**:
- `ProjectList.tsx`
- `ProjectCard.tsx`
- `CreateProjectForm.tsx`
- `ProjectDetail.tsx`

#### Day 5-7: 글쓰기 세션 화면 (핵심)
- [ ] 글쓰기 인터페이스 컴포넌트
  - 단락 목록 표시
  - 사용자/AI 구분 스타일링
  - 텍스트 입력 영역
- [ ] 실시간 상태 관리
  - 로딩 인디케이터
  - AI 작성 중 표시
  - 에러 메시지
- [ ] UX 개선
  - 자동 스크롤
  - 입력 제한 (최소/최대 글자 수)
  - 키보드 단축키
- [ ] 시놉시스 & 설정집 패널
  - 에디터 영역(65%) + 우측 패널(35%) 스플릿 레이아웃
  - 상단 탭: `시놉시스` / `설정집` / `AI 참고 로그`
  - 시놉시스: 마크다운 지원 단일 텍스트 박스, 2초 딜레이 자동 저장
  - 설정집: 카드 리스트 + 태그 필터, 각 카드별 "AI 참고" 토글
  - 패널 하단에 "AI 프롬프트에 포함된 항목" 배지 표시
  - `StoryContextPanel.tsx`, `SynopsisEditor.tsx`, `LoreNoteList.tsx` 컴포넌트 추가

**컴포넌트**:
- `WritingSession.tsx`
- `ParagraphList.tsx`
- `ParagraphItem.tsx`
- `InputArea.tsx`
- `StoryContextPanel.tsx`
- `SynopsisEditor.tsx`
- `LoreNoteList.tsx`

**주요 기능**:
```typescript
// 상태 관리
const [paragraphs, setParagraphs] = useState([]);
const [currentInput, setCurrentInput] = useState('');
const [isAiWriting, setIsAiWriting] = useState(false);

// AI 응답 처리
const handleSubmit = async () => {
  // 1. 사용자 입력 전송
  // 2. AI 응답 대기
  // 3. 화면 업데이트
};
```

---

### Week 4: 고급 기능 & 마무리
**목표**: 인증 시스템 추가 및 프로덕션 준비

#### Day 1-2: 사용자 인증
- [ ] JWT 인증 시스템
  - 회원가입 API
  - 로그인 API
  - 토큰 검증 미들웨어
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] 프론트엔드 인증 플로우
  - 로그인 페이지
  - 회원가입 페이지
  - 토큰 저장 (localStorage)
  - Protected Routes

```bash
# Backend
npm install jsonwebtoken bcrypt
npm install @types/jsonwebtoken @types/bcrypt

# Frontend
# 토큰 관리 로직 추가
```

**파일 구조**:
```
Backend:
src/
├── routes/
│   └── authRoutes.ts
└── middleware/
    └── authMiddleware.ts

Frontend:
src/
├── pages/
│   ├── Login.tsx
│   └── Register.tsx
├── context/
│   └── AuthContext.tsx
└── utils/
    └── auth.ts
```

#### Day 3-4: 추가 기능 구현
- [ ] 장르별 프롬프트 템플릿
  - 판타지, 로맨스, SF, 스릴러 등
- [ ] 글쓰기 설정 기능
  - 창의성 레벨 (temperature)
  - 단락 길이 (max_tokens)
  - 톤/스타일 설정
- [ ] 단락 재생성 기능
- [ ] 프로젝트 통계
  - 총 단락 수
  - 단어 수
  - 작성 날짜

**추가 API**:
- PUT /api/projects/:id/settings (설정 저장)
- POST /api/paragraphs/:id/regenerate (재생성)

#### Day 5-6: 테스트 & 버그 수정
- [ ] 통합 테스트
  - 전체 글쓰기 플로우
  - 긴 대화 컨텍스트 관리
  - 에러 시나리오
- [ ] 성능 테스트
  - API 응답 시간
  - DB 쿼리 최적화
- [ ] UI/UX 개선
  - 반응형 디자인
  - 접근성 개선
  - 로딩 상태 개선

**테스트 체크리스트**:
- [ ] 프로젝트 생성/조회/수정/삭제
- [ ] 사용자-AI 연속 글쓰기
- [ ] 긴 대화에서 컨텍스트 유지
- [ ] API 에러 처리
- [ ] 인증 플로우

#### Day 7: 배포 준비
- [ ] 환경 변수 정리
- [ ] 프로덕션 빌드
- [ ] CORS 설정 확인
- [ ] 데이터베이스 마이그레이션
- [ ] 배포 문서 작성

**배포 옵션**:
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify
- Database: PlanetScale, AWS RDS

---

## 🔑 환경 변수 설정

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=writing_ai_db

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📦 프로젝트 구조

### Backend
```
writing-ai-backend/
├── src/
│   ├── entity/
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── Paragraph.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── projectRoutes.ts
│   │   └── writingRoutes.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   └── writingController.ts
│   ├── services/
│   │   └── aiService.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   └── validation.ts
│   ├── data-source.ts
│   └── index.ts
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

### Frontend
```
writing-ai-frontend/
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ProjectList.tsx
│   │   ├── CreateProject.tsx
│   │   └── WritingSession.tsx
│   ├── components/
│   │   ├── ProjectCard.tsx
│   │   ├── ParagraphList.tsx
│   │   ├── ParagraphItem.tsx
│   │   └── InputArea.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── auth.ts
│   ├── App.tsx
│   └── index.tsx
├── .env
├── package.json
└── tsconfig.json
```

---

## 🤖 AI 통합 상세

### 프롬프트 엔지니어링

#### 시스템 프롬프트 템플릿
```typescript
const systemPrompts = {
  fantasy: `당신은 판타지 소설 작가입니다.
마법, 모험, 영웅의 여정을 다룹니다.
세계관이 풍부하고 상상력이 넘치는 문장을 작성하세요.`,
  
  romance: `당신은 로맨스 소설 작가입니다.
감정선을 섬세하게 표현하고 인물의 내면을 깊이 있게 묘사하세요.
설레는 순간과 갈등을 자연스럽게 담아내세요.`,
  
  thriller: `당신은 스릴러 소설 작가입니다.
긴장감을 유지하고, 복선을 깔며, 예상치 못한 전개를 만드세요.
독자가 다음 장을 궁금해하도록 작성하세요.`,
  
  sf: `당신은 SF 소설 작가입니다.
과학적 개념을 흥미롭게 풀어내고 미래 사회를 상상하세요.
기술과 인간성의 관계를 탐구하세요.`
};
```

#### 시놉시스 & 설정집 주입 플로우
1. 글쓰기 세션 진입 시 `GET /api/projects/:id/context`로 시놉시스/설정집을 초기 로딩한다.
2. 사용자가 우측 패널에서 편집하면 2초 딜레이 디바운싱 후 `PUT /api/projects/:id/context`로 자동 저장한다.
3. 글을 제출할 때 프론트엔드는 현재 패널 상태와 함께 `includeSynopsis`, `includeLorebook`, `loreFocusTags` 값을 세션 API에 전달한다.
4. 백엔드는 `buildContext()` 호출 시 시놉시스 → 설정집 → 최근 단락 순으로 블록을 구성하고, OpenAI 시스템/유저 프롬프트 앞부분에 붙인다.
5. 실제로 프롬프트에 포함된 시놉시스/설정집 항목을 응답 payload에 함께 내려 프론트 패널 하단 "AI 참고 로그"에 표기한다.

#### 컨텍스트 관리 전략
```typescript
interface ContextOptions {
  maxParagraphs: number;      // 포함할 최대 단락 수 (기본: 10)
  maxTokens: number;          // 최대 토큰 수 (기본: 3000)
  includeDescription: boolean; // 프로젝트 설명 포함 여부
  includeSynopsis: boolean;    // 시놉시스 포함 여부
  includeLorebook: boolean;    // 설정집 포함 여부
  loreFocusTags?: string[];    // 설정집에서 강조할 태그
}

function buildContext(
  project: Project,
  paragraphs: Paragraph[],
  options: ContextOptions
): string {
  // 최근 N개 단락만 포함
  const recentParagraphs = paragraphs.slice(-options.maxParagraphs);

  const synopsisBlock = options.includeSynopsis && project.synopsis
    ? `\n[Synopsis]\n${project.synopsis}\n`
    : '';

  const lorebookBlock = options.includeLorebook && project.lorebook
    ? buildLorebookSection(project.lorebook, options.loreFocusTags)
    : '';
  
  // 컨텍스트 구성
  let context = `${synopsisBlock}${lorebookBlock}`;
  
  if (options.includeDescription && project.description) {
    context += `[이야기 배경: ${project.description}]\n\n`;
  }
  
  context += recentParagraphs
    .map(p => p.content)
    .join('\n\n');
  
  return context;
}
```

#### API 호출 설정
```typescript
const completionOptions = {
  model: 'gpt-4o-mini',
  temperature: 0.8,        // 창의성 (0.0-2.0)
  max_tokens: 500,         // 최대 응답 길이
  top_p: 0.9,             // 다양성
  frequency_penalty: 0.3,  // 반복 방지
  presence_penalty: 0.3    // 새로운 주제 도입
};

function buildLorebookSection(
  lorebook: LoreNote[],
  tags: string[] = []
): string {
  const filtered = tags.length
    ? lorebook.filter(note => note.tags.some(tag => tags.includes(tag)))
    : lorebook;

  return filtered
    .map(note => `[${note.category}] ${note.title}\n${note.content}`)
    .join('\n\n');
}

interface LoreNote {
  id: string;
  category: 'character' | 'location' | 'faction' | 'rule' | 'item';
  title: string;
  content: string;
  tags: string[];
}
```

### 비용 관리
```typescript
// 일일 사용량 제한
const LIMITS = {
  FREE_TIER: {
    dailyRequests: 50,
    maxTokensPerRequest: 500
  },
  PREMIUM: {
    dailyRequests: 500,
    maxTokensPerRequest: 1000
  }
};

// 사용량 추적
async function checkUsageLimit(userId: number): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const count = await getRequestCount(userId, today);
  return count < LIMITS.FREE_TIER.dailyRequests;
}
```

---

## 🎨 UI/UX 가이드라인

### Tailwind 테마 프리셋
`tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        userBg: '#f0f9ff',
        aiBg: '#f5f3ff',
        text: '#1f2937',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

`src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-text;
  }
}
```

### 레이아웃 가이드
- 헤더: `flex items-center justify-between border-b border-border`
- 메인: `grid grid-cols-[65%_35%] gap-6` (Desktop), `flex flex-col` (모바일)
- 카드: `rounded-xl border border-border bg-white shadow-sm`
- 버튼: `inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-indigo-500`

### 반응형 브레이크포인트
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## ✅ MVP (Minimum Viable Product) 체크리스트

### 필수 기능 (4주 내 완성)
- [x] 프로젝트 생성/조회
- [x] 사용자가 단락 작성
- [x] AI가 자동으로 다음 단락 생성
- [x] 이전 내용 기반 컨텍스트 유지
- [x] 작성 히스토리 저장/조회
- [ ] 기본 사용자 인증

### 선택 기능 (시간 있으면)
- [ ] 단락 수정/삭제
- [ ] AI 재생성 기능
- [ ] 장르별 스타일 변경
- [ ] 프로젝트 내보내기 (txt)
- [ ] 글쓰기 통계
- [ ] 다크 모드

---

## 🚨 예상되는 도전 과제

### 1. TypeORM 학습 곡선
**해결책**: 공식 문서의 기본 예제부터 시작

### 2. AI 응답 지연
**해결책**: 
- 로딩 인디케이터 표시
- 스트리밍 응답 고려 (고급 기능)

### 3. 긴 대화 컨텍스트 관리
**해결책**:
- 최근 10개 단락만 포함
- 요약 기능 추가 (선택)

### 4. API 비용
**해결책**:
- 요청 수 제한
- 캐싱 전략
- 무료 티어 활용

---

## 📚 학습 자료

### TypeORM
- [공식 문서](https://typeorm.io/)
- [Entity 가이드](https://typeorm.io/entities)
- [Relations 가이드](https://typeorm.io/relations)

### OpenAI API
- [API 문서](https://platform.openai.com/docs)
- [Playground](https://platform.openai.com/playground)
- [Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)

### React + TypeScript
- [React 공식 문서](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎯 성공 기준

### 기술적 목표
- [ ] 모든 API 엔드포인트 정상 작동
- [ ] 데이터베이스 정규화 완료
- [ ] 에러 없이 빌드 성공
- [ ] 반응형 UI 구현

### 기능적 목표
- [ ] 사용자가 프로젝트를 만들고 관리할 수 있음
- [ ] AI가 문맥에 맞는 단락을 생성함
- [ ] 작성한 내용이 안전하게 저장됨
- [ ] 직관적이고 사용하기 쉬운 UI

### 개인 학습 목표
- [ ] TypeORM 기본 사용법 숙지
- [ ] REST API 설계 경험
- [ ] AI API 통합 경험
- [ ] 풀스택 프로젝트 완성

---

## 📝 일일 개발 로그 템플릿

```markdown
## YYYY-MM-DD

### 오늘의 목표
- [ ] 작업 1
- [ ] 작업 2

### 완료한 작업
- ✅ 작업 A
- ✅ 작업 B

### 배운 것
- 개념 또는 기술

### 내일 할 일
- [ ] 작업 1
- [ ] 작업 2

### 이슈/질문
- 문제 상황 및 해결 필요 사항
```

---

## 🔄 Git 워크플로우

### 브랜치 전략
```
main (프로덕션)
  └── develop (개발)
        ├── feature/user-auth
        ├── feature/ai-integration
        └── feature/writing-session
```

### 커밋 메시지 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드, 패키지 등
```

---

## 🎉 마무리

이 프로젝트를 통해 다음을 경험하게 됩니다:
- 풀스택 개발 전체 프로세스
- AI API 통합 및 프롬프트 엔지니어링
- 데이터베이스 설계 및 ORM 사용
- 현대적인 웹 개발 스택

**화이팅! 🚀**

프로젝트 진행 중 궁금한 점이나 막히는 부분이 있으면 언제든지 질문하세요!