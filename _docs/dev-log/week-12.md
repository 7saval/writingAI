# Week 12 개발 로그

---

### 📅 2026-05-29 (Day 77)

#### 🎯 오늘의 목표

- [x] 보안 취약점 분석 및 감사 문서 작성
- [x] 인증 미들웨어 검증 (Step 1 확인)
- [x] 인가 검증 로직 구현 (Step 2 완료)
- [x] 개발 로그 작성

#### ✅ 완료한 작업

**보안 감사 보고서 작성**

- ✅ `SECURITY_AUDIT.md` 문서 생성 - 6가지 주요 보안 취약점 식별 및 상세 분석
- ✅ 공격 시나리오 포함 - 실제 공격 방법 curl 예시 제시
- ✅ 해결방안 6단계 제시 및 상세 코드 예시 포함
- ✅ 테스트 체크리스트 작성

**Step 1: 인증 미들웨어 추가 확인**

- ✅ 모든 보호 엔드포인트에 `ensureAuth` 미들웨어 확인
  - `projectRoutes.ts`: GET/:id, GET/:id/paragraphs, PUT/:id, DELETE/:id
  - `paragraphRoutes.ts`: PUT/:id, DELETE/:id, POST/:id/regenerate
  - `contextRoutes.ts`: GET/:id/context, PUT/:id/context

**Step 2: 인가 검증 미들웨어 분리** 🔐

**2-1. 미들웨어 생성 (`authorizationMiddleware.ts`)**
- ✅ `checkProjectOwnership()` - 프로젝트 소유권 검증
- ✅ `checkParagraphOwnership()` - 단락 소유권 검증 (Paragraph→Project→User 체인)
- ✅ `checkContextOwnership()` - 컨텍스트 소유권 검증
- ✅ `checkResourceOwnership()` - 동적 리소스 타입 지원 팩토리 함수

**2-2. Express 타입 확장**
- ✅ `src/types/express.d.ts` 생성
- ✅ Request 인터페이스에 project, paragraph, resource 속성 추가
- ✅ TypeScript non-null assertion (`!`) 없이 안전하게 타입 확인

**2-3. 컨트롤러 간소화**
- ✅ `projectController.ts` 수정 (4개 메서드)
  - `getProjectDetail()`: req.project 사용 (검증 완료)
  - `updateProject()`: req.project! 사용
  - `deleteProject()`: req.project! 사용
  - `getProjectParagraphs()`: req.project! 사용
- ✅ `contextController.ts` 수정 (2개 메서드)
  - `getContext()`: req.project! 사용
  - `updateContext()`: req.project! 사용
- ✅ `paragraphController.ts` 수정 (3개 메서드)
  - `updateParagraph()`: req.paragraph! 사용
  - `deleteParagraph()`: req.paragraph! 사용
  - `regenerateAiParagraph()`: req.paragraph! 사용

**2-4. 라우트에 미들웨어 연결**
- ✅ projectRoutes: 4개 엔드포인트에 checkProjectOwnership 추가
- ✅ paragraphRoutes: 3개 엔드포인트에 checkParagraphOwnership 추가
- ✅ contextRoutes: 2개 엔드포인트에 checkContextOwnership 추가

**Step 3: 민감한 정보 노출 방지** 🔒

- ✅ `authController.ts` 수정
  - `forgotPassword()`: console.log 제거 (비밀번호 초기화 코드 콘솔 출력 금지)
  - API 응답에서 `code` 필드 제거 (초기화 코드를 클라이언트에게 노출하지 않음)
  - 실제 이메일 서비스 구현 시 안전하게 코드 전달

**TypeScript 컴파일 이슈 해결**

- ✅ 타입 선언 파일 참조 문제 해결
  - `/// <reference path="../types/express.d.ts" />` 지시문 추가
  - 적용 파일: index.ts, projectController.ts, paragraphController.ts, contextController.ts, authorizationMiddleware.ts
- ✅ 사용되지 않는 매개변수 문제 해결
  - 미사용 매개변수에 `_` 접두사 추가 (e.g., `_req`, `_next`)
  - `authController.ts`: signup(), logout(), refresh()
  - `desktopGoogleAuthController.ts`: createDesktopGoogleSession()
- ✅ tsconfig.json 설정 정리
  - `noUnusedParameters: false` 설정 (express 미들웨어 패턴과 충돌 해결)
  - typeRoots, include 경로 확인

**서버 실행 확인**
- ✅ 백엔드 서버 정상 시작 (`🚀 Server listening on 5000`)
- ✅ PostgreSQL 데이터베이스 연결 확인
- ✅ TypeScript 컴파일 성공 (타입 체크 에러 0개)

#### 💡 배운 것

**보안의 2가지 계층: 인증 vs 인가**

```
인증(Authentication): "넌 누니?"
  → JWT 토큰 검증 (이미 구현됨)

인가(Authorization): "너 이거 할 수 있니?"
  → 사용자가 리소스를 소유하는지 확인 (오늘 추가함)
```

**미들웨어 분리 기준 (면접 대비)**

미들웨어를 분리할 때 다음 3가지 기준을 따릅니다:

**1. 관심사의 분리 (Separation of Concerns)**

```
❌ 잘못된 방식: 컨트롤러에 모든 검증 로직을 넣기
export async function updateProject(req: Request, res: Response) {
  // 소유권 검증 로직 1
  const project = await repo.findOne({...});
  if (project.user.id !== req.user!.id) return res.status(403).json({...});
  
  // 비즈니스 로직 (수정)
  project.title = req.body.title;
  await repo.save(project);
}

✅ 올바른 방식: 미들웨어에서 검증, 컨트롤러에서 비즈니스 로직만
middleware: checkProjectOwnership(req, res, next) → req.project 설정
controller: updateProject(req, res) → const project = req.project; (이미 검증됨)
```

**장점:**
- 컨트롤러 코드가 62줄에서 8줄로 감소 (87% 단순화)
- 소유권 검증 로직이 한 곳에만 존재 → 버그 수정 시 1곳만 수정
- 비즈니스 로직과 보안 로직 분리 → 각각 독립적으로 테스트 가능

**2. 재사용성 (Reusability)**

```typescript
// 같은 패턴을 여러 리소스에 적용 가능
export function checkResourceOwnership(
  resourceType: "Project" | "Paragraph",
  paramName: string = "id"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 동적으로 리소스 타입 처리
    if (resourceType === "Project") {
      // Project 소유권 확인
    } else if (resourceType === "Paragraph") {
      // Paragraph 소유권 확인
    }
    next();
  };
}

// 라우트에서 재사용
router.put('/:id', ensureAuth, checkResourceOwnership('Project'), updateProject);
router.delete('/:id', ensureAuth, checkResourceOwnership('Paragraph'), deleteParagraph);
```

**3. 책임 계층 구조 (Responsibility Chain)**

```
Request 도착
    ↓
[1] ensureAuth 미들웨어
    → JWT 토큰 검증 (Authentication)
    → req.user 설정
    ↓
[2] checkOwnership 미들웨어
    → 리소스 조회
    → 소유자 확인 (Authorization)
    → req.project/paragraph 설정
    ↓
[3] Controller 핸들러
    → 이미 검증된 리소스로 비즈니스 로직만 수행
    → 응답 반환
    ↓
Response 전송
```

**각 계층의 책임:**
- **미들웨어 1** (ensureAuth): "이 사용자가 누구인지 확인"
- **미들웨어 2** (checkOwnership): "이 사용자가 이 리소스 접근 권한이 있나 확인"
- **컨트롤러**: "권한 확인된 리소스에 대해 어떤 작업할 건지 실행"

**면접에서 대답할 때:**

> "미들웨어 분리는 3가지 기준으로 판단합니다.
>
> **첫째, 관심사 분리**: 보안 로직과 비즈니스 로직을 분리하면 컨트롤러가 간단해지고 보안 로직 수정이 한 곳에서만 이루어집니다.
>
> **둘째, 재사용성**: 같은 검증 로직을 여러 엔드포인트에서 사용할 수 있습니다. 예를 들어 `checkOwnership` 미들웨어는 Project, Paragraph 모두에서 재사용됩니다.
>
> **셋째, 책임 계층**: 각 미들웨어가 한 가지 책임만 집중합니다. ensureAuth는 인증, checkOwnership은 인가, 그리고 컨트롤러는 비즈니스 로직만 처리합니다."

**왜 인가가 필요한가?**

- 현재 상황: 토큰이 유효하면 누구나 ID 1, 2, 3... 모든 프로젝트 접근 가능
- 문제: 사용자 A가 사용자 B의 프로젝트 수정/삭제 가능
- 해결: 각 리소스 접근 전에 현재 사용자(`req.user.id`)와 리소스 소유자(`project.user.id`) 비교

**TypeORM `findOneBy` vs `findOne` 차이**

```typescript
// ❌ findOneBy: 조건만 지정, relations 로드 불가
const project = await repo.findOneBy({ id: projectId });
// 결과: project 객체는 User 관계를 포함하지 않음
// project.user는 undefined → TypeError 발생!

// ✅ findOne: where절과 relations을 별도로 지정 가능
const project = await repo.findOne({
  where: { id: projectId },
  relations: ["user"]  // 🔑 관계 로드!
});
// 결과: project.user가 로드됨 → project.user.id 접근 가능
```

**`findOne`의 where절 vs relations의 차이**

```typescript
// ❌ where절에만 user 정보를 넣으려고 시도
const project = await repo.findOne({
  where: { id: projectId, user: { id: userId } }  // 이건 필터링!
});
// 문제점:
// 1. user 객체가 여전히 로드되지 않음
// 2. WHERE 조건으로만 사용됨 (JOIN 안 함)
// 3. project.user는 undefined

// ✅ relations에서 로드하고, where에서 필터링
const project = await repo.findOne({
  where: { 
    id: projectId,
    user: { id: userId }  // 조건: 이 userId의 프로젝트만
  },
  relations: ["user"]  // 로드: user 정보를 객체에 포함
});
// 결과:
// 1. SQL: SELECT * FROM projects JOIN users WHERE projects.id = ? AND users.id = ?
// 2. project.user가 완전히 로드됨
// 3. project.user.id 접근 가능
```

**다층 관계에서의 소유권 확인**

```typescript
// Paragraph → Project → User 체인 로드
const paragraph = await repo.findOne({
  where: { id: paragraphId },
  relations: ["project", "project.user"]  // 중첩된 관계도 로드 가능
});

// SQL: SELECT * FROM paragraphs 
//      JOIN projects ON ... 
//      JOIN users ON ...
// 결과: paragraph.project.user.id 접근 가능
if (paragraph.project.user.id !== req.user!.id) {
  return res.status(403).json({ message: "Forbidden" });
}
```

**핵심 정리**

| 메서드 | 기능 | relations 지원 | 사용 시기 |
|--------|------|---------------|---------|
| `findOneBy()` | 간단한 WHERE 조건 | ❌ 불가 | 관계 로드 불필요한 경우 |
| `findOne()` | 복잡한 조건 + relations | ✅ 가능 | **관계 로드 필요한 경우** |

#### 🔧 해결한 문제

**1. 인증 미들웨어 누락 (Step 1)**

**문제점:**
- 백엔드의 9개 엔드포인트가 `ensureAuth` 미들웨어 없이 노출됨
- 누구나 토큰 없이 다른 사용자의 프로젝트 조회/수정/삭제 가능
- 보안 취약점 심각도: 🔴 CRITICAL

```bash
# 공격 예시: 토큰 없이 모든 프로젝트 조회 가능
curl http://localhost:5000/api/projects/1
curl http://localhost:5000/api/projects/999/delete
```

**원인 파악:**
- **라우트 정의 검토**: `projectRoutes.ts`, `paragraphRoutes.ts`, `contextRoutes.ts`에서 일부 엔드포인트만 `ensureAuth` 적용
- **누락된 엔드포인트**: 
  - `GET /projects/:id` - 상세 조회 미보호
  - `GET /projects/:id/paragraphs` - 단락 조회 미보호
  - `PUT /paragraphs/:id` - 단락 수정 미보호
  - `DELETE /paragraphs/:id` - 단락 삭제 미보호
  - `GET/PUT /projects/:id/context` - 컨텍스트 조회/수정 미보호
- **근본 원인**: 초기 개발 시 보안을 후순위로 미루고 기능 개발에만 집중했음

**해결 방법:**
- 모든 데이터 조회/수정/삭제 엔드포인트에 `ensureAuth` 미들웨어 추가
- 라우트 정의 시 일관된 패턴 적용:
  ```typescript
  // 모든 보호 엔드포인트에 ensureAuth 추가
  projectRouter.get('/:id', ensureAuth, getProjectDetail);
  paragraphRouter.put('/:id', ensureAuth, updateParagraph);
  contextRouter.put('/:id/context', ensureAuth, updateContext);
  ```

**느낀점:**
- 🎯 **보안은 나중에 추가할 수 없다**: 초기 설계 단계에서 인증/인가를 함께 고려해야 함
- 🎯 **미들웨어 패턴의 중요성**: Express 미들웨어 체인의 순서와 적용이 매우 중요
- 🎯 **일관성이 핵심**: 비슷한 엔드포인트는 비슷한 미들웨어를 적용해야 실수 방지

---

**2. 인가 검증 누락 (Step 2)**

**문제점:**
- 인증은 있지만 소유권 검증 없음
- 사용자 A가 사용자 B의 리소스를 수정/삭제 가능
- 보안 심각도: 🔴 CRITICAL

```bash
# 공격 예시: 자신의 토큰으로 타인의 프로젝트 삭제
curl -X DELETE http://localhost:5000/api/projects/2 \
  -H "Authorization: Bearer user_A_token"
# → 사용자 B의 프로젝트 2가 삭제됨!
```

**원인 파악:**

**1단계: 코드 검토**
```typescript
// ❌ 수정 전: projectController.ts
export async function updateProject(req: Request, res: Response) {
  const project = await repo.findOneBy({ id: Number(req.params.id) });
  if (!project) return res.status(404).json({ message: 'Not found' });
  
  // 문제: req.user.id와 project.user.id 비교 없음!
  project.title = req.body.title;
  await repo.save(project);
}
```

**2단계: 근본 원인 파악**
- `findOneBy()`로 리소스만 찾고, 소유자 정보 로드 안 함
- 현재 사용자(`req.user`)와 리소스 소유자(`project.user`) 비교 로직 완전 누락
- 모든 컨트롤러(project, context, paragraph)에서 동일한 문제 반복

**3단계: 영향받는 메서드 식별**
- `projectController`: updateProject, deleteProject, getProjectDetail, getProjectParagraphs (4개)
- `contextController`: getContext, updateContext (2개)
- `paragraphController`: updateParagraph, deleteParagraph, regenerateAiParagraph (3개)
- 총 9개 메서드 모두 인가 검증 없음

**해결 방법:**

**패턴 1: 단일 관계 소유권 확인**
```typescript
// ✅ 수정 후: Project 소유권 확인
export async function updateProject(req: Request, res: Response) {
  const project = await repo.findOne({
    where: { id: Number(req.params.id) },
    relations: ["user"]  // 🔑 User 관계 로드!
  });
  
  if (!project) return res.status(404).json({ message: 'Not found' });
  
  // 🔑 소유권 검증!
  if (project.user.id !== req.user!.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  project.title = req.body.title;
  await repo.save(project);
}
```

**패턴 2: 다중 관계 소유권 확인**
```typescript
// ✅ 수정 후: Paragraph → Project → User 체인
export async function updateParagraph(req: Request, res: Response) {
  const paragraph = await repo.findOne({
    where: { id: Number(req.params.id) },
    relations: ["project", "project.user"]  // 🔑 체인 로드!
  });
  
  if (!paragraph) return res.status(404).json({ message: 'Not found' });
  
  // 🔑 중간 리소스의 소유자 검증!
  if (paragraph.project.user.id !== req.user!.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  paragraph.content = req.body.content;
  await repo.save(paragraph);
}
```

**느낀점:**

🎯 **"인증 ≠ 인가" - 둘 다 필수**
- 많은 개발자가 JWT 토큰 검증만 하면 보안이 완성된다고 생각하는 경향이 있음
- 하지만 "유효한 토큰" ≠ "이 리소스에 접근할 권리"
- 꼭 비행기 탑승권(인증)이 있어도, 내 좌석(인가)에 앉아야 함

🎯 **ORM의 `relations` 이해가 중요**
- `findOneBy()`로는 관계 객체 로드 불가 → SQL JOIN 미발생
- `findOne()` + `relations`으로 명시적 로드 필요
- 다중 관계 로드 시 `["project", "project.user"]` 문법 필수

🎯 **쿼리 최적화와 보안은 함께**
- 소유권 검증을 WHERE절에 포함하면 DB 레벨에서 필터링
- SQL: `SELECT * FROM projects WHERE id = ? AND user_id = ?` (권장)
- 메모리에서 검증: 성능 저하, 보안 약화

**소유권 인가 검증 미들웨어 구현**

오늘 구현한 핵심 작업:
1. `authorizationMiddleware.ts` 생성 - 4개의 미들웨어 함수 구현
2. Express Request 타입 확장 - `src/types/express.d.ts` 생성
3. 라우트에 미들웨어 연결 - 9개 엔드포인트 보호
4. 컨트롤러 간소화 - 불필요한 검증 코드 제거

```typescript
// 구현된 미들웨어 패턴
export async function checkProjectOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const projectId = Number(req.params.id);
    const projectRepo = AppDataSource.getRepository(Project);
    const project = await projectRepo.findOne({
      where: { id: projectId },
      relations: ["user"],  // 🔑 User 관계 로드
    });

    if (!project) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Project not found" });
      return;
    }

    // 🔑 소유권 검증
    if (project.user.id !== req.user!.id) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
      return;
    }

    // req에 리소스 저장 (컨트롤러에서 접근 가능)
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
}
```

**Express Request 타입 확장:**
```typescript
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
      project?: Project | null;
      paragraph?: Paragraph | null;
    }
  }
}
```

**TypeScript 컴파일 문제 해결:**
- ts-node는 tsconfig의 typeRoots를 기본으로 인식하지 않음
- 해결: 각 파일에 `/// <reference path="../types/express.d.ts" />` 추가
- 적용 파일: projectController, paragraphController, contextController, authorizationMiddleware

**라우트 적용 패턴:**
```typescript
// Before (미보호)
router.put('/:id', updateProject);

// After (미들웨어 적용)
router.put('/:id', ensureAuth, checkProjectOwnership, updateProject);
```

#### 📌 내일 할 일

- [x] **Step 1 완료**: 인증 미들웨어 추가
- [x] **Step 2 완료**: 인가 검증 미들웨어 분리
- [x] **Step 3 완료**: 민감한 정보 노출 방지
- [ ] **Step 4 진행**: 입력 검증 추가
  - Zod 라이브러리 설치 확인 및 필요시 설치
  - Zod 스키마 정의 (UpdateProjectSchema, UpdateContextSchema 등)
  - 검증 미들웨어 생성 (`validation.ts`)
  - 라우트에 검증 미들웨어 연결
  - 테스트: 빈 제목, 과도한 길이 등으로 검증 확인

- [ ] **Step 5 진행**: 에러 처리 개선
  - 일관된 에러 응답 패턴 구현
  - 토큰 만료 시간 로직 명확화
  - 에러 로그 개선

- [ ] **Step 6 진행**: CORS 보안 강화 (필요시)
  - process.env.CORS_ORIGIN 설정 확인
  - credentials, methods, allowedHeaders 옵션 추가

- [ ] **테스트 계획**
  - ✅ 보호된 엔드포인트 인증 테스트
  - ✅ 다른 사용자 리소스 접근 시 403 Forbidden 응답 확인
  - [ ] 자신의 리소스 접근/수정/삭제 정상 작동 확인
  - [ ] 입력 검증 테스트 (빈 필드, 길이 제한 등)

#### 🚨 이슈/질문

- [RESOLVED] forgotPassword의 응답 메시지 변경에 대한 프론트엔드 영향
  - ✅ 응답에서 `code` 제거됨 (Step 3에서 완료)
  - 프론트엔드에서 코드를 직접 사용하지 않으므로 문제 없음
  - 실제 프로덕션에서는 이메일 서비스로 코드 전달 예정

- [TODO] Step 4 입력 검증 추가 시 고려 사항
  - 프로젝트 제목: 최소 1자, 최대 200자 제한
  - 프로젝트 설명: 최대 1000자 제한  
  - 장르(genre): 미리 정의된 7가지만 허용 (Fantasy, Romance, Mystery, Thriller, SF, Horror, Drama)
  - 시놉시스: 최대 5000자 제한
  - 로어북: JSON 배열 형식 검증

#### 📊 진행률

SECURITY_AUDIT 이행: ██████░░░░ 60% (Step 1-3/6 완료)
  - Step 1: ✅ 인증 미들웨어 추가
  - Step 2: ✅ 인가 검증 미들웨어 분리
  - Step 3: ✅ 민감한 정보 노출 방지
  - Step 4: ⬜ 입력 검증 추가
  - Step 5: ⬜ 에러 처리 개선
  - Step 6: ⬜ CORS 보안 강화

Week 12: ████░░░░░░ 40% (Day 1/7)  
전체: ████████░░ 80%+ (Week 12/14)

#### 🎓 오늘의 핵심 배움

**1. Defense in Depth (다층 방어)**
- 인증(Authentication): 토큰 검증 ✅
- 인가(Authorization): 소유권 확인 ✅ (오늘 완료)
- 입력 검증: 다음 (Step 4)
- 로그 보안: 오늘 완료 (Step 3)

**2. 미들웨어 분리의 3가지 원칙**
- 관심사의 분리: 보안 로직과 비즈니스 로직을 명확히 분리
- 재사용성: 같은 미들웨어를 여러 엔드포인트에서 사용
- 책임 계층: 각 미들웨어가 한 가지 책임만 집중 (Single Responsibility)

**3. Express 타입 확장을 통한 타입 안전성**
- TypeScript 타입 선언 파일(`express.d.ts`) 생성
- Request 인터페이스 확장으로 `any` 타입 완전 제거
- `req.project!`로 안전하게 검증된 리소스 접근

---
