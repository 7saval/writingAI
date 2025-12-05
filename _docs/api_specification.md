# API 명세서 (API Specification)

> **작성일**: 2025-12-05  
> **프로젝트**: 글쓰기 AI 서포터즈 (Writing AI Supporters)  
> **Base URL**: `http://localhost:5000/api`

---

## 📋 목차

1. [구현 완료된 API](#구현-완료된-api)
   - [프로젝트 관리](#1-프로젝트-관리-projects)
   - [컨텍스트 관리](#2-컨텍스트-관리-시놉시스--설정집)
   - [글쓰기 세션](#3-글쓰기-세션-writing)
2. [구현 예정 API](#구현-예정-api)
   - [사용자 인증](#4-사용자-인증-auth)
   - [단락 관리](#5-단락-관리-paragraphs)
   - [고급 기능](#6-고급-기능)

---

## 🟢 구현 완료된 API

### 1. 프로젝트 관리 (Projects)

#### 1.1 프로젝트 생성

**엔드포인트**: `POST /api/projects`

**설명**: 새로운 글쓰기 프로젝트를 생성합니다.

**요청 헤더**:
```
Content-Type: application/json
```

**요청 본문**:
```json
{
  "title": "나의 첫 판타지 소설",
  "genre": "fantasy",
  "description": "마법과 모험이 가득한 판타지 세계",
  "synopsis": "주인공이 마법사가 되어 세계를 구하는 이야기",
  "lorebook": []
}
```

**필드 설명**:
| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `title` | string | ✅ | - | 프로젝트 제목 |
| `genre` | string | ❌ | `"fantasy"` | 장르 (`fantasy`, `romance`, `thriller`, `sf`) |
| `description` | string | ❌ | `null` | 프로젝트 설명 |
| `synopsis` | string | ❌ | `""` | 작품 시놉시스 |
| `lorebook` | array | ❌ | `[]` | 설정집 데이터 (JSON 배열) |

**응답 (201 Created)**:
```json
{
  "id": 1,
  "title": "나의 첫 판타지 소설",
  "genre": "fantasy",
  "description": "마법과 모험이 가득한 판타지 세계",
  "synopsis": "주인공이 마법사가 되어 세계를 구하는 이야기",
  "lorebook": [],
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z"
}
```

**구현 파일**:
- 라우터: `backend/src/routes/projectRoutes.ts`
- 컨트롤러: `backend/src/controllers/projectController.ts` - `createProject()`

---

#### 1.2 프로젝트 목록 조회

**엔드포인트**: `GET /api/projects`

**설명**: 모든 프로젝트 목록을 최신순으로 조회합니다.

**요청 파라미터**: 없음

**응답 (200 OK)**:
```json
[
  {
    "id": 2,
    "title": "로맨스 소설",
    "genre": "romance",
    "description": "달콤한 사랑 이야기",
    "synopsis": "두 주인공의 운명적인 만남",
    "lorebook": [],
    "createdAt": "2025-12-05T11:00:00.000Z",
    "updatedAt": "2025-12-05T11:00:00.000Z"
  },
  {
    "id": 1,
    "title": "나의 첫 판타지 소설",
    "genre": "fantasy",
    "description": "마법과 모험이 가득한 판타지 세계",
    "synopsis": "주인공이 마법사가 되어 세계를 구하는 이야기",
    "lorebook": [],
    "createdAt": "2025-12-05T10:00:00.000Z",
    "updatedAt": "2025-12-05T10:00:00.000Z"
  }
]
```

**정렬**: `createdAt` 기준 내림차순 (최신순)

**구현 파일**:
- 라우터: `backend/src/routes/projectRoutes.ts`
- 컨트롤러: `backend/src/controllers/projectController.ts` - `getProjects()`

---

#### 1.3 프로젝트 상세 조회

**엔드포인트**: `GET /api/projects/:id`

**설명**: 특정 프로젝트의 상세 정보와 모든 단락을 조회합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**응답 (200 OK)**:
```json
{
  "id": 1,
  "title": "나의 첫 판타지 소설",
  "genre": "fantasy",
  "description": "마법과 모험이 가득한 판타지 세계",
  "synopsis": "주인공이 마법사가 되어 세계를 구하는 이야기",
  "lorebook": [],
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z",
  "paragraphs": [
    {
      "id": 1,
      "content": "어느 날 아침, 주인공은 이상한 꿈을 꾸었다.",
      "writtenBy": "user",
      "orderIndex": 0,
      "createdAt": "2025-12-05T10:05:00.000Z"
    },
    {
      "id": 2,
      "content": "그 꿈 속에서 빛나는 마법의 지팡이가 그를 부르고 있었다.",
      "writtenBy": "ai",
      "orderIndex": 1,
      "createdAt": "2025-12-05T10:05:15.000Z"
    }
  ]
}
```

**응답 (404 Not Found)**:
```json
{
  "message": "Project not found"
}
```

**특징**:
- `paragraphs` 배열이 포함됨 (관계 조회)
- 단락은 `orderIndex` 기준 오름차순 정렬

**구현 파일**:
- 라우터: `backend/src/routes/projectRoutes.ts`
- 컨트롤러: `backend/src/controllers/projectController.ts` - `getProjectDetail()`

---

#### 1.4 프로젝트 수정

**엔드포인트**: `PUT /api/projects/:id`

**설명**: 프로젝트의 기본 정보를 수정합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**요청 본문** (수정할 필드만 포함):
```json
{
  "title": "수정된 제목",
  "genre": "sf",
  "description": "새로운 설명",
  "synopsis": "수정된 시놉시스",
  "lorebook": [
    {
      "id": "1",
      "category": "character",
      "title": "주인공",
      "content": "용감한 전사",
      "tags": ["main", "hero"]
    }
  ]
}
```

**응답 (200 OK)**:
```json
{
  "id": 1,
  "title": "수정된 제목",
  "genre": "sf",
  "description": "새로운 설명",
  "synopsis": "수정된 시놉시스",
  "lorebook": [
    {
      "id": "1",
      "category": "character",
      "title": "주인공",
      "content": "용감한 전사",
      "tags": ["main", "hero"]
    }
  ],
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T12:00:00.000Z"
}
```

**응답 (404 Not Found)**:
```json
{
  "message": "Project not found"
}
```

**특징**:
- 부분 업데이트 지원 (제공된 필드만 수정)
- `lorebook`은 문자열 또는 배열로 전송 가능 (자동 파싱)

**구현 파일**:
- 라우터: `backend/src/routes/projectRoutes.ts`
- 컨트롤러: `backend/src/controllers/projectController.ts` - `updateProject()`

---

### 2. 컨텍스트 관리 (시놉시스 & 설정집)

#### 2.1 컨텍스트 조회

**엔드포인트**: `GET /api/projects/:id/context`

**설명**: 프로젝트의 시놉시스와 설정집을 조회합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**응답 (200 OK)**:
```json
{
  "synopsis": "주인공이 마법사가 되어 세계를 구하는 이야기",
  "lorebook": [
    {
      "id": "1",
      "category": "character",
      "title": "엘리아",
      "content": "주인공. 20세 여성 마법사",
      "tags": ["main", "protagonist"]
    },
    {
      "id": "2",
      "category": "location",
      "title": "마법 학교",
      "content": "주인공이 다니는 마법 학교",
      "tags": ["location", "school"]
    }
  ]
}
```

**응답 (404 Not Found)**:
```json
{
  "message": "Project not found"
}
```

**구현 파일**:
- 라우터: `backend/src/routes/contextRoutes.ts`
- 컨트롤러: `backend/src/controllers/contextController.ts` - `getContext()`

---

#### 2.2 컨텍스트 업데이트

**엔드포인트**: `PUT /api/projects/:id/context`

**설명**: 프로젝트의 시놉시스와 설정집을 업데이트합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**요청 본문**:
```json
{
  "synopsis": "수정된 시놉시스 내용",
  "lorebook": [
    {
      "id": "1",
      "category": "character",
      "title": "엘리아",
      "content": "주인공. 21세 여성 대마법사로 성장",
      "tags": ["main", "protagonist", "powerful"]
    }
  ]
}
```

**필드 설명**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `synopsis` | string | ❌ | 작품 전체 요약 |
| `lorebook` | array | ❌ | 설정집 배열 (문자열로 전송 시 자동 파싱) |

**응답 (200 OK)**:
```json
{
  "message": "Context updated successfully",
  "projectId": 1
}
```

**응답 (404 Not Found)**:
```json
{
  "message": "Project not found"
}
```

**특징**:
- `lorebook`은 JSON 배열 또는 JSON 문자열 형태로 전송 가능
- 자동 파싱 및 에러 핸들링 포함

**구현 파일**:
- 라우터: `backend/src/routes/contextRoutes.ts`
- 컨트롤러: `backend/src/controllers/contextController.ts` - `updateContext()`

---

### 3. 글쓰기 세션 (Writing)

#### 3.1 AI와 함께 글쓰기

**엔드포인트**: `POST /api/writing/:id/write`

**설명**: 사용자가 단락을 작성하면 AI가 자동으로 다음 단락을 생성합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**요청 본문**:
```json
{
  "content": "주인공은 마법 학교의 문을 열고 들어갔다."
}
```

**필드 설명**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `content` | string | ✅ | 사용자가 작성한 단락 내용 |

**응답 (200 OK)**:
```json
{
  "userParagraph": {
    "id": 5,
    "content": "주인공은 마법 학교의 문을 열고 들어갔다.",
    "writtenBy": "user",
    "orderIndex": 4,
    "createdAt": "2025-12-05T13:00:00.000Z"
  },
  "aiParagraph": {
    "id": 6,
    "content": "복도 양쪽으로 늘어선 마법의 촛불들이 그녀를 환영하듯 밝게 빛났다.",
    "writtenBy": "ai",
    "orderIndex": 5,
    "createdAt": "2025-12-05T13:00:15.000Z"
  }
}
```

**응답 (404 Not Found)**:
```json
{
  "message": "Project not found"
}
```

**처리 흐름**:
1. 사용자 단락을 데이터베이스에 저장
2. 프로젝트의 시놉시스, 설정집, 이전 단락들을 기반으로 AI 프롬프트 생성
3. OpenAI API 호출하여 다음 단락 생성
4. AI 단락을 데이터베이스에 저장
5. 두 단락 모두 반환

**AI 컨텍스트 구성**:
- 시놉시스 (있는 경우)
- 설정집 (있는 경우)
- 프로젝트 설명 (있는 경우)
- 최근 8개 단락

**구현 파일**:
- 라우터: `backend/src/routes/writingRoutes.ts`
- 컨트롤러: `backend/src/controllers/writingController.ts` - `writeWithAi()`
- 서비스: `backend/src/services/aiService.ts` - `generateNextParagraph()`

---

## 🔵 구현 예정 API

### 4. 사용자 인증 (Auth)

> **구현 예정**: Week 4  
> **우선순위**: 중간

#### 4.1 회원가입

**엔드포인트**: `POST /api/auth/register`

**설명**: 새로운 사용자를 등록합니다.

**요청 본문**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "username": "홍길동"
}
```

**예상 응답 (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동",
    "createdAt": "2025-12-05T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**구현 예정 파일**:
- 라우터: `backend/src/routes/authRoutes.ts`
- 컨트롤러: `backend/src/controllers/authController.ts`
- 미들웨어: `backend/src/middleware/authMiddleware.ts`

---

#### 4.2 로그인

**엔드포인트**: `POST /api/auth/login`

**설명**: 사용자 인증 후 JWT 토큰을 발급합니다.

**요청 본문**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**예상 응답 (200 OK)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**예상 응답 (401 Unauthorized)**:
```json
{
  "message": "Invalid email or password"
}
```

---

#### 4.3 토큰 검증

**엔드포인트**: `GET /api/auth/me`

**설명**: 현재 로그인한 사용자 정보를 조회합니다.

**요청 헤더**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**예상 응답 (200 OK)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "홍길동",
  "createdAt": "2025-12-05T10:00:00.000Z"
}
```

**예상 응답 (401 Unauthorized)**:
```json
{
  "message": "Invalid or expired token"
}
```

---

### 5. 단락 관리 (Paragraphs)

> **구현 예정**: Week 3-4  
> **우선순위**: 높음

#### 5.1 단락 목록 조회

**엔드포인트**: `GET /api/projects/:id/paragraphs`

**설명**: 특정 프로젝트의 모든 단락을 조회합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**쿼리 파라미터** (선택):
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `limit` | number | 50 | 조회할 단락 수 |
| `offset` | number | 0 | 건너뛸 단락 수 |

**예상 응답 (200 OK)**:
```json
{
  "total": 100,
  "paragraphs": [
    {
      "id": 1,
      "content": "첫 번째 단락",
      "writtenBy": "user",
      "orderIndex": 0,
      "createdAt": "2025-12-05T10:00:00.000Z"
    },
    {
      "id": 2,
      "content": "두 번째 단락",
      "writtenBy": "ai",
      "orderIndex": 1,
      "createdAt": "2025-12-05T10:00:15.000Z"
    }
  ]
}
```

---

#### 5.2 단락 수정

**엔드포인트**: `PUT /api/paragraphs/:id`

**설명**: 특정 단락의 내용을 수정합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 단락 ID |

**요청 본문**:
```json
{
  "content": "수정된 단락 내용"
}
```

**예상 응답 (200 OK)**:
```json
{
  "id": 1,
  "content": "수정된 단락 내용",
  "writtenBy": "user",
  "orderIndex": 0,
  "createdAt": "2025-12-05T10:00:00.000Z"
}
```

---

#### 5.3 단락 삭제

**엔드포인트**: `DELETE /api/paragraphs/:id`

**설명**: 특정 단락을 삭제합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 단락 ID |

**예상 응답 (200 OK)**:
```json
{
  "message": "Paragraph deleted successfully",
  "deletedId": 1
}
```

---

#### 5.4 AI 단락 재생성

**엔드포인트**: `POST /api/paragraphs/:id/regenerate`

**설명**: AI가 작성한 단락을 다시 생성합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 재생성할 AI 단락 ID |

**요청 본문** (선택):
```json
{
  "temperature": 0.9,
  "maxTokens": 600
}
```

**예상 응답 (200 OK)**:
```json
{
  "id": 2,
  "content": "새롭게 생성된 단락 내용",
  "writtenBy": "ai",
  "orderIndex": 1,
  "createdAt": "2025-12-05T10:00:15.000Z"
}
```

---

### 6. 고급 기능

> **구현 예정**: Week 4  
> **우선순위**: 낮음

#### 6.1 프로젝트 설정 저장

**엔드포인트**: `PUT /api/projects/:id/settings`

**설명**: AI 글쓰기 설정을 저장합니다.

**요청 본문**:
```json
{
  "temperature": 0.8,
  "maxTokens": 500,
  "tone": "formal",
  "style": "descriptive"
}
```

**예상 응답 (200 OK)**:
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "temperature": 0.8,
    "maxTokens": 500,
    "tone": "formal",
    "style": "descriptive"
  }
}
```

---

#### 6.2 프로젝트 내보내기

**엔드포인트**: `GET /api/projects/:id/export`

**설명**: 프로젝트를 텍스트 파일로 내보냅니다.

**쿼리 파라미터**:
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `format` | string | `txt` | 내보내기 형식 (`txt`, `pdf`) |

**예상 응답 (200 OK)**:
```
Content-Type: text/plain
Content-Disposition: attachment; filename="project-1.txt"

나의 첫 판타지 소설
==================

어느 날 아침, 주인공은 이상한 꿈을 꾸었다.

그 꿈 속에서 빛나는 마법의 지팡이가 그를 부르고 있었다.

...
```

---

#### 6.3 프로젝트 통계

**엔드포인트**: `GET /api/projects/:id/stats`

**설명**: 프로젝트의 통계 정보를 조회합니다.

**예상 응답 (200 OK)**:
```json
{
  "projectId": 1,
  "totalParagraphs": 50,
  "userParagraphs": 25,
  "aiParagraphs": 25,
  "totalWords": 5000,
  "totalCharacters": 25000,
  "createdAt": "2025-12-05T10:00:00.000Z",
  "lastUpdatedAt": "2025-12-05T15:00:00.000Z"
}
```

---

#### 6.4 프로젝트 삭제

**엔드포인트**: `DELETE /api/projects/:id`

**설명**: 프로젝트와 관련된 모든 데이터를 삭제합니다.

**URL 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 프로젝트 ID |

**예상 응답 (200 OK)**:
```json
{
  "message": "Project deleted successfully",
  "deletedId": 1
}
```

**특징**:
- CASCADE 삭제로 관련된 모든 단락도 함께 삭제됨

---

## 📊 공통 응답 형식

### 성공 응답

모든 성공 응답은 적절한 HTTP 상태 코드와 함께 JSON 형식으로 반환됩니다.

**상태 코드**:
- `200 OK`: 조회/수정 성공
- `201 Created`: 생성 성공
- `204 No Content`: 삭제 성공 (본문 없음)

### 에러 응답

모든 에러는 일관된 형식으로 반환됩니다.

**형식**:
```json
{
  "message": "에러 메시지"
}
```

**상태 코드**:
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

**예시**:
```json
{
  "message": "Project not found"
}
```

---

## 🔐 인증 (구현 예정)

### JWT 토큰 사용

인증이 필요한 엔드포인트는 요청 헤더에 JWT 토큰을 포함해야 합니다.

**헤더 형식**:
```
Authorization: Bearer <token>
```

**예시**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzMzA0ODgwMCwiZXhwIjoxNjMzNjUzNjAwfQ.abc123
```

### 인증이 필요한 엔드포인트 (구현 예정)

- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/writing/:id/write`
- `PUT /api/projects/:id/context`
- 기타 모든 생성/수정/삭제 작업

---

## 📝 데이터 타입 정의

### Project

```typescript
interface Project {
  id: number;
  title: string;
  genre: 'fantasy' | 'romance' | 'thriller' | 'sf';
  description: string | null;
  synopsis: string | null;
  lorebook: LoreNote[];
  createdAt: Date;
  updatedAt: Date;
  paragraphs?: Paragraph[];
}
```

### Paragraph

```typescript
interface Paragraph {
  id: number;
  content: string;
  writtenBy: 'user' | 'ai';
  orderIndex: number;
  createdAt: Date;
}
```

### LoreNote

```typescript
interface LoreNote {
  id: string;
  category: 'character' | 'location' | 'faction' | 'rule' | 'item';
  title: string;
  content: string;
  tags: string[];
}
```

### User (구현 예정)

```typescript
interface User {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
}
```

---

## 🧪 테스트 예시

### cURL 예시

#### 프로젝트 생성
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 프로젝트",
    "genre": "fantasy",
    "description": "테스트용 프로젝트입니다"
  }'
```

#### 프로젝트 목록 조회
```bash
curl http://localhost:5000/api/projects
```

#### AI와 글쓰기
```bash
curl -X POST http://localhost:5000/api/writing/1/write \
  -H "Content-Type: application/json" \
  -d '{
    "content": "주인공은 숲 속을 걸어갔다."
  }'
```

---

## 📌 참고사항

### 구현 우선순위

1. **높음** (Week 1-2 완료)
   - ✅ 프로젝트 CRUD
   - ✅ AI 글쓰기 세션
   - ✅ 컨텍스트 관리

2. **중간** (Week 3-4)
   - 🔵 단락 관리 (수정/삭제)
   - 🔵 AI 재생성
   - 🔵 사용자 인증

3. **낮음** (선택 기능)
   - 🔵 프로젝트 내보내기
   - 🔵 통계 기능
   - 🔵 고급 설정

### 변경 이력

- **2025-12-05**: 초기 문서 작성
  - 구현 완료된 API 문서화
  - 구현 예정 API 명세 작성

---

## 🔗 관련 문서

- [프로젝트 기획서](./planning.md)
- [상세 구현 가이드](./planning_detail.md)
- [데이터베이스 스키마](../backend/src/entity/)
