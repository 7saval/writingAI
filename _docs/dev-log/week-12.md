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
  paramName: string = "id",
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
router.put(
  "/:id",
  ensureAuth,
  checkResourceOwnership("Project"),
  updateProject,
);
router.delete(
  "/:id",
  ensureAuth,
  checkResourceOwnership("Paragraph"),
  deleteParagraph,
);
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
  relations: ["user"], // 🔑 관계 로드!
});
// 결과: project.user가 로드됨 → project.user.id 접근 가능
```

**`findOne`의 where절 vs relations의 차이**

```typescript
// ❌ where절에만 user 정보를 넣으려고 시도
const project = await repo.findOne({
  where: { id: projectId, user: { id: userId } }, // 이건 필터링!
});
// 문제점:
// 1. user 객체가 여전히 로드되지 않음
// 2. WHERE 조건으로만 사용됨 (JOIN 안 함)
// 3. project.user는 undefined

// ✅ relations에서 로드하고, where에서 필터링
const project = await repo.findOne({
  where: {
    id: projectId,
    user: { id: userId }, // 조건: 이 userId의 프로젝트만
  },
  relations: ["user"], // 로드: user 정보를 객체에 포함
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
  relations: ["project", "project.user"], // 중첩된 관계도 로드 가능
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

| 메서드        | 기능                    | relations 지원 | 사용 시기                 |
| ------------- | ----------------------- | -------------- | ------------------------- |
| `findOneBy()` | 간단한 WHERE 조건       | ❌ 불가        | 관계 로드 불필요한 경우   |
| `findOne()`   | 복잡한 조건 + relations | ✅ 가능        | **관계 로드 필요한 경우** |

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
  projectRouter.get("/:id", ensureAuth, getProjectDetail);
  paragraphRouter.put("/:id", ensureAuth, updateParagraph);
  contextRouter.put("/:id/context", ensureAuth, updateContext);
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
  if (!project) return res.status(404).json({ message: "Not found" });

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
    relations: ["user"], // 🔑 User 관계 로드!
  });

  if (!project) return res.status(404).json({ message: "Not found" });

  // 🔑 소유권 검증!
  if (project.user.id !== req.user!.id) {
    return res.status(403).json({ message: "Forbidden" });
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
    relations: ["project", "project.user"], // 🔑 체인 로드!
  });

  if (!paragraph) return res.status(404).json({ message: "Not found" });

  // 🔑 중간 리소스의 소유자 검증!
  if (paragraph.project.user.id !== req.user!.id) {
    return res.status(403).json({ message: "Forbidden" });
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
      relations: ["user"], // 🔑 User 관계 로드
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
router.put("/:id", updateProject);

// After (미들웨어 적용)
router.put("/:id", ensureAuth, checkProjectOwnership, updateProject);
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

### 📅 2026-06-01 (Day 78)

#### 🎯 오늘의 목표

- [x] 실시간 AI 스트리밍 UI 구현 방식 조사 및 설계
- [x] SSE(Server-Sent Events) 개념 학습
- [x] 기존 방식과 스트리밍 방식의 이점 비교 분석
- [x] 스트리밍 기능 구현 완료 (4단계)
- [x] 에러 해결 및 버그 수정

#### ✅ 완료한 작업

**실시간 AI 스트리밍 구현 계획 수립**

- ✅ 현재 코드베이스 분석 (백엔드 `aiService.ts`, `writingController.ts`, 프론트 `Editor.tsx`, `useTypingAnimation.ts`)
- ✅ 기존 방식의 문제점 도출 및 스트리밍 전환 근거 정리
- ✅ SSE 방식 채택 결정 및 7개 파일 변경 계획 확정
- ✅ 개발 로그 작성

**Step 1: 백엔드 구현** ✅

- ✅ `aiService.ts` - `generateNextParagraphStream()` 제너레이터 함수 추가
  - OpenAI `stream: true` 옵션으로 토큰 실시간 수신
  - `for await...of` 루프로 각 청크 yield
- ✅ `writingController.ts` - `writeWithAiStream()` SSE 컨트롤러 추가
  - SSE 헤더 설정 (Content-Type, Cache-Control, Connection)
  - 4가지 이벤트 타입 전송: user, ai_start, chunk, done, error
  - 스트림 완료 후 AI 단락 content 업데이트
- ✅ `writingRoutes.ts` - `POST /:id/write/stream` 라우트 연결
- ✅ 백엔드 타입 체크 통과 (tsconfig strict mode)

**Step 2: 프론트엔드 타입 & API** ✅

- ✅ `types/database.ts` - `Paragraph` 인터페이스에 `isStreaming?: boolean` 필드 추가
- ✅ `writing.api.ts` - `writeParagraphStream()` 함수 구현
  - `fetch` + `ReadableStream` 으로 SSE 스트림 수신
  - `TextDecoder`로 utf-8 디코딩
  - `data: ` 라인 파싱 후 JSON 디코딩
  - 5가지 콜백 인터페이스: onUserParagraph, onAiStart, onChunk, onDone, onError
- ✅ 프론트엔드 빌드 성공

**Step 3: 프론트엔드 Editor.tsx** ✅

- ✅ `useWriteParagraphMutation` 제거
- ✅ `writeParagraphStream` import 추가
- ✅ `handleSubmit` 함수 완전 교체
  - tempAiParagraph를 `isStreaming: true`로 초기화
  - 5개 콜백 함수 구현
  - onUserParagraph: 임시 ID → 실제 DB ID로 교체
  - onAiStart: 서버 paragraph 데이터 병합
  - onChunk: 매 토큰마다 content 누적
  - onDone: isStreaming 완료 표시
  - onError: 에러 핸들링

**Step 4: 프론트엔드 ParagraphItem.tsx** ✅

- ✅ `isStreaming` 상태 렌더링 분기 추가
  - 스트리밍 중: `paragraph.content` 직접 표시 (displayedContent 대신)
  - 스트리밍 중: 실시간 커서 깜빡임 표시
- ✅ 스트리밍 중 버튼 비활성화
  - 수정 버튼: `!paragraph.isStreaming &&` 조건 추가
  - 재생성 버튼: `!paragraph.isStreaming &&` 조건 추가
  - 삭제 버튼: `!paragraph.isStreaming &&` 조건 추가
- ✅ 기존 isLoading, isTyping 로직 유지 (하위 호환)

**모든 파일 타입 체크 및 빌드 성공** ✅

- ✅ 백엔드: `npm run dev:typecheck` 통과
- ✅ 프론트엔드: `npm run build` 성공

#### 💡 배운 것

---

**SSE(Server-Sent Events) 개념**

SSE는 서버가 클라이언트에게 **단방향으로 실시간 데이터를 밀어주는(push)** HTTP 기반 프로토콜이다.
특별한 프로토콜 업그레이드 없이 `Content-Type: text/event-stream` 헤더 하나로 동작하며, HTTP의 keep-alive 연결을 활용한다.

```
일반 HTTP (Request-Response)
클라이언트 → 요청 → 서버
클라이언트 ← 응답 ← 서버  (연결 종료)

SSE
클라이언트 → 요청 → 서버
클라이언트 ← 데이터 ← 서버  (연결 유지)
클라이언트 ← 데이터 ← 서버
클라이언트 ← 데이터 ← 서버
           ...계속...

WebSocket
클라이언트 ↔ 데이터 ↔ 서버  (양방향)
```

**SSE 메시지 포맷**

SSE는 메시지 포맷이 단순하다. `data:` 접두사 + 내용 + 빈 줄 2개(`\n\n`)가 하나의 이벤트다.

```
data: 안녕하세요\n\n
data: {"type": "chunk", "content": "소설의"}\n\n
data: {"type": "chunk", "content": " 첫 줄은"}\n\n
data: {"type": "done"}\n\n
```

**SSE vs WebSocket 비교**

| 항목          | SSE                        | WebSocket               |
| ------------- | -------------------------- | ----------------------- |
| 통신 방향     | 서버 → 클라이언트 (단방향) | 양방향                  |
| 프로토콜      | HTTP                       | ws:// (별도 핸드셰이크) |
| 구현 복잡도   | 낮음                       | 높음                    |
| 자동 재연결   | 브라우저 내장              | 직접 구현 필요          |
| 적합한 케이스 | 알림, 스트리밍, 로그       | 채팅, 게임, 실시간 협업 |

> AI 생성 스트리밍처럼 서버에서 클라이언트로만 데이터가 흐르는 케이스에는 SSE가 WebSocket보다 훨씬 간단하고 충분하다.

---

**기존 타이핑 시뮬레이션 방식의 문제점과 실시간 스트리밍으로 전환하는 이유**

현재 WritingAI의 AI 단락 생성 흐름:

```
유저 제출
  → POST /writing/:id/write (Axios)
  → OpenAI gpt-4o-mini 응답 전체 대기 (~3-5초)
  → 바운스 로딩 애니메이션 표시
  → 응답 수신 후 useTypingAnimation 훅으로 타이핑 시뮬레이션 (30ms/글자)
```

**문제 1: 실제 대기 시간보다 훨씬 더 긴 총 소요 시간**

- OpenAI 응답: 약 3-5초
- 타이핑 시뮬레이션: 500자 기준 약 15초 (30ms × 500글자)
- 총 UX 소요 시간: **최대 20초** (실제 생성은 5초인데 UI가 20초처럼 느껴짐)

**문제 2: 첫 피드백까지의 대기 시간 (TTFF, Time To First Feedback)**

- 유저가 제출 후 3-5초는 아무것도 못 보고 바운스 점만 본다.
- 스트리밍이면 첫 토큰이 ~200ms 안에 화면에 나타난다.

**문제 3: 타이핑 시뮬레이션은 "가짜 UX"**

- 실제 AI 생성 과정이 아닌, 클라이언트에서 완성된 텍스트를 인위적으로 천천히 보여주는 것
- 소설 글쓰기 플랫폼이라는 특성상 "AI가 진짜로 써 내려가는" 느낌이 몰입감에 중요한데, 지금 방식은 그 경험을 제공하지 못함

**스트리밍 전환 시 이점 요약**

```
[기존]
유저 제출 → [바운스 로딩 3-5초] → 응답 수신 → [타이핑 시뮬레이션 15초]
총 UX 시간: 최대 20초

[스트리밍]
유저 제출 → [~200ms] → 첫 글자 표시 시작 → [실제 생성 3-5초에 걸쳐 점진적 출력]
총 UX 시간: 3-5초 (체감상 즉각 반응)
```

1. **체감 응답 속도 향상**: 첫 글자 등장까지 200ms. ChatGPT, Gemini, Claude가 이 방식을 쓰는 이유
2. **자연스러운 글쓰기 UX**: 소설 쓰기 맥락에서 AI가 실제로 "글을 써 내려가는" 몰입감 제공
3. **총 대기 시간 단축**: 타이핑 시뮬레이션 15초 제거 → 실제 생성 시간(3-5초)이 곧 UX 시간
4. **미래 확장성**: 스트리밍 중 취소(abort) 기능을 나중에 추가 가능

---

**실시간 스트리밍 구현 아키텍처 설계**

```
OpenAI API (stream: true)
  → 토큰 생성될 때마다 백엔드 수신
  → Express SSE 응답으로 즉시 프론트엔드 전달
  → React state에 토큰 누적 (setParagraphs)
  → ParagraphItem이 매 토큰마다 리렌더링
```

**SSE 이벤트 타입 설계**

```json
{ "type": "user",     "paragraph": { ...userParagraph } }    // 유저 단락 저장 완료
{ "type": "ai_start", "paragraph": { ...aiParagraph } }      // AI 단락 ID 확보
{ "type": "chunk",    "content": "소설의" }                   // 토큰 스트리밍
{ "type": "done",     "paragraph": { ...finalAiParagraph } }  // 완료 및 DB 업데이트
```

**클라이언트 SSE 수신 방식 선택: `fetch` + `ReadableStream`**

- `EventSource` API는 GET 전용 → 요청 body(content, prompt, stage)를 보낼 수 없어 부적합
- Axios는 SSE 미지원
- `fetch` + `response.body.getReader()` 가 POST body와 SSE 스트리밍 모두 지원

```typescript
const res = await fetch(`/api/writing/${projectId}/write/stream`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ content, prompt, stage }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();
```

**변경 파일 목록 (7개)**

```
backend/src/services/aiService.ts           generateNextParagraphStream() 추가
backend/src/controllers/writingController.ts writeWithAiStream() 추가
backend/src/routes/writingRoutes.ts         POST /:id/write/stream 라우트 추가
frontend/src/types/database.ts              isStreaming?: boolean 필드 추가
frontend/src/api/writing.api.ts             writeParagraphStream() 추가
frontend/src/components/Editor.tsx          handleSubmit을 스트리밍 방식으로 교체
frontend/src/components/ParagraphItem.tsx   isStreaming 상태 렌더링 분기 추가
```

기존 `useWriting.ts`, `useTypingAnimation.ts`는 변경 없음 (regenerate 플로우에서 계속 사용).

**렌더링 상태 분기 설계**

| 상태                | 표시                                       |
| ------------------- | ------------------------------------------ |
| `isLoading: true`   | 바운스 점 3개 (기존 유지)                  |
| `isStreaming: true` | 실시간 content 누적 + 커서 블록 깜빡임     |
| `isTyping: true`    | 타이핑 시뮬레이션 + 커서 (regenerate 전용) |
| 기본                | content 정적 표시                          |

---

**CORS 정책 이해 (실전 학습)**

```
시나리오 1: ❌ 실패
- 서버: res.setHeader("Access-Control-Allow-Origin", "*")
- 클라이언트: fetch(..., { credentials: "include" })
- 결과: CORS 정책 위반 → 요청 차단

시나리오 2: ✅ 성공 (우리 해결책)
- 서버 미들웨어: cors({ origin: ["http://localhost:5173"], credentials: true })
- 클라이언트: fetch(...) // credentials 제거
- 결과: 요청 성공, credentials 불필요 (JWT 사용)

시나리오 3: ✅ 대안
- 서버: res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173")
- 클라이언트: fetch(..., { credentials: "include" })
- 결과: 요청 성공 (구체적 오리진 지정)
```

**핵심 규칙:**

- `credentials: "include"` → CORS 헤더는 와일드카드 불가
- `credentials: "omit"` (기본) → 와일드카드 `*` 가능
- JWT 기반 인증 → credentials 필요 없음 (Authorization 헤더 사용)

**면접 대비 답변:**

> "CORS와 credentials를 함께 사용할 때 중요한 점은 와일드카드를 피하는 것입니다.
> credentials를 포함하려면 Access-Control-Allow-Origin에 구체적인 오리진을 명시해야 합니다.
> JWT 토큰 기반 인증을 사용한다면 credentials가 필요 없으므로,
> 이 경우 미들웨어 수준에서 CORS를 처리하고 컨트롤러에서 재설정하지 않는 것이 좋습니다."

---

**콜백 기반 상태 관리 패턴 (React Hooks 심화)**

```typescript
// ❌ 문제 패턴: ID 추적 실패
const tempId = -(Date.now() + 1);  // 임시 ID

// 1. 임시 데이터 추가
setParagraphs([...prev, tempParagraph]);

// 2. 서버 응답으로 교체 (ID 변경!)
onAiStart: (serverData) => {
  setParagraphs(prev =>
    prev.map(p => p.id === tempId ? { ...serverData } : p)
    // ❌ ID가 serverData.id로 바뀜
  );
},

// 3. 이후 업데이트 불가 (ID를 찾을 수 없음)
onChunk: (content) => {
  setParagraphs(prev =>
    prev.map(p =>
      p.id === tempId  // ❌ 더 이상 tempId인 항목이 없음
        ? { ...p, content: p.content + content }
        : p
    )
  );
},
```

```typescript
// ✅ 해결 패턴: ID 명시적 유지
const tempId = -(Date.now() + 1);

onAiStart: (serverData) => {
  setParagraphs(prev =>
    prev.map(p =>
      p.id === tempId
        ? {
            ...p,
            ...serverData,
            id: tempId,  // 🔑 ID 명시적으로 유지!
            isStreaming: true,
            content: "",
          }
        : p
    )
  );
},

onChunk: (content) => {
  setParagraphs(prev =>
    prev.map(p =>
      p.id === tempId  // ✅ 계속 찾을 수 있음
        ? { ...p, content: p.content + content }
        : p
    )
  );
},
```

**적용 시나리오:**

- 원격 데이터 동기화 중 UI 업데이트 필요할 때
- 여러 콜백이 같은 데이터를 추적할 때
- 임시 데이터와 실제 데이터를 구분할 때

**일반화된 패턴:**

```typescript
// Step 1: 추적할 ID 결정
const trackingId = useRef(Symbol("unique"));

// Step 2: 모든 업데이트에서 trackingId 유지
const updateData = (data) =>
  setData((prev) =>
    prev.map((item) =>
      item._trackingId === trackingId.current
        ? { ...item, ...data, _trackingId: trackingId.current }
        : item,
    ),
  );

// Step 3: 콜백들이 trackingId로 안전하게 데이터 추적 가능
```

#### 🔧 해결한 문제

**1. CORS 정책 위반 (Access-Control-Allow-Origin 와일드카드 + credentials 충돌)**

**문제점:**

```
Access-Control-Allow-Origin: * (와일드카드)
+ credentials: 'include' (쿠키 포함)
= CORS 정책 위반 🔴
```

```
Error: Access to fetch at 'http://localhost:5000/api/writing/5/write/stream'
from origin 'http://localhost:5173' has been blocked by CORS policy:
The value of the 'Access-Control-Allow-Origin' header in the response must not be
the wildcard '*' when the request's credentials mode is 'include'.
```

**원인 파악:**

- 백엔드 `writeWithAiStream()`에서 `res.setHeader("Access-Control-Allow-Origin", "*")` 직접 설정
- 프론트엔드 `writeParagraphStream()`에서 `credentials: "include"` 옵션 사용
- CORS 정책상 이 두 설정이 함께 있으면 안 됨

**해결 방법:**

```typescript
// ❌ 제거된 코드 (백엔드)
res.setHeader("Access-Control-Allow-Origin", "*");

// ✅ cors 미들웨어가 이미 처리함 (index.ts)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","), // http://localhost:5173 포함
    credentials: true,
  }),
);
```

```typescript
// ❌ 제거된 코드 (프론트엔드)
credentials: ("include",
  // ✅ JWT 인증 사용하므로 쿠키 불필요
  fetch(`${apiUrl}/writing/${projectId}/write/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // credentials 제거 ✅
    body: JSON.stringify({ content, prompt, stage }),
  }));
```

**배운 점:**

- CORS + credentials 조합은 와일드카드 불가 → 구체적 오리진 필수
- 이미 cors 미들웨어가 처리하면 컨트롤러에서 재설정하지 말 것
- JWT 기반 인증 시 credentials 필요 없음

---

**2. 화면에 커서만 깜박이고 AI 콘텐츠 미표시**

**문제점:**

- SSE 응답에는 생성한 content가 정상적으로 오고 있음
- 하지만 화면에는 커서(`▌`)만 깜박일 뿐 content가 표시되지 않음
- 바운스 로딩 에러 → 시간 후 DB에는 저장됨 (백그라운드에서 스트림 실행)

**원인 파악:**

```typescript
// onAiStart: 서버의 실제 paragraph로 교체
onAiStart: (paragraph) => {
  setParagraphs((prev) =>
    prev.map((p) =>
      p.id === tempAiId
        ? { ...paragraph, isStreaming: true, content: "" }  // ID가 변경됨!
        : p
    )
  );
},

// onChunk: 여전히 tempAiId로 찾음 (찾을 수 없음 ❌)
onChunk: (content) => {
  setParagraphs((prev) =>
    prev.map((p) =>
      p.id === tempAiId  // 더 이상 존재하지 않음!
        ? { ...p, content: p.content + content }
        : p
    )
  );
},
```

**문제의 본질:**

1. `tempAiId`: 임시 음수 ID (-(Date.now() + 1))
2. `onAiStart`에서 서버 paragraph로 교체 → ID가 실제 DB ID로 변경
3. `onChunk`는 여전히 `tempAiId`로 찾으려고 함
4. 찾을 수 없으므로 content 업데이트 안 됨 ❌

**해결 방법:**

```typescript
// ID를 명시적으로 유지
onAiStart: (paragraph) => {
  setParagraphs((prev) =>
    prev.map((p) =>
      p.id === tempAiId
        ? {
            ...p,
            ...paragraph,
            id: tempAiId,  // 🔑 ID 유지!
            isStreaming: true,
            content: "",
          }
        : p
    )
  );
},
```

**배운 점:**

- 콜백 기반 state update 시 ID 매핑 추적이 핵심
- 서버 데이터로 spread할 때 클라이언트 추적 ID 덮어씌워지는 위험
- 임시 ID 유지 → onChunk에서 계속 찾을 수 있음

---

**3. 로컬 테스트에서 정상 작동 확인** ✅

- ✅ CORS 에러 해결 후 SSE 스트림 정상 수신
- ✅ 바운스 로딩 없이 즉시 글자 표시 시작
- ✅ 토큰 실시간 누적으로 점진적 출력
- ✅ 스트리밍 완료 후 커서 사라짐

**4. BOLA (Broken Object Level Authorization) 취약점 해결**

**문제점:**

- `/write` 및 `/write/stream` 엔드포인트에 인증/인가 미들웨어가 누락되어 로그인하지 않은 사용자나 타인이 임의로 글을 생성할 수 있는 심각한 보안 취약점 존재.

**해결 방법:**

- `writingRoutes.ts`에 `ensureAuth` 및 `checkProjectOwnership` 미들웨어 추가 적용.
- (해결 과정에서 기존 계획된 `스트리밍 엔드포인트에 ensureAuth 미들웨어 추가 검토` 항목 완료 처리됨)

**5. SSE 스트리밍 도중 클라이언트 연결 해제 시 리소스 누수 방지**

**문제점:**

- 스트리밍 중 브라우저 탭을 닫거나 요청을 취소하면 서버는 계속해서 OpenAI API를 호출하며 토큰을 낭비함.
- 예외 발생 시 DB에 내용이 비어있는(`""`) 단락이 그대로 남는 문제 발생.

**해결 방법:**

- `writingController.ts`에 `req.on('close')` 이벤트를 리스닝하여 연결 종료 감지.
- `AbortController`를 도입해 `client.chat.completions.create`에 `signal`을 전달하여 OpenAI API 스트림 즉시 취소.
- 스트림 취소 또는 에러 발생 시 `fullContent`가 비어있다면 해당 임시 단락(`aiParagraph`)을 DB에서 `remove` 처리하여 정합성 유지.

**6. 영문 장르명의 프롬프트 맵핑 누락 및 타입 안정성 개선**

**문제점:**

- DB에 저장된 영문 장르(`Fantasy`, `Romance` 등)가 한글 키를 사용하는 `genrePrompts`와 매칭되지 않아 프롬프트에 `undefined`가 주입되는 버그.
- `aiService.ts`에서 불필요한 `as any` 타입 캐스팅 및 코드 중복 발생.

**해결 방법:**

- `aiService.ts` 내에 `genreMap`을 추가하여 영문 장르를 한글 키로 안전하게 변환.
- `generateNextParagraph`와 `generateNextParagraphStream`의 중복 로직을 `prepareFinalMessages` 헬퍼 함수로 분리.
- `signal: options.signal as any` 부분에서 `as any`를 제거하고 타입 안정성 확보.

**7. 프론트엔드 Fetch 기반 SSE 토큰 누락 및 개행 파싱 오류 해결**

**문제점:**

- 네이티브 `fetch` API를 사용할 때 Axios 인터셉터를 타지 않아 `Authorization` 토큰이 누락됨.
- `buffer.split("\n\n")` 방식은 운영 환경(Nginx 등)의 `\r\n` 개행 방식과 충돌할 여지가 있음.

**해결 방법:**

- Zustand의 `useAuthStore`에서 `accessToken`을 가져와 `fetch` 요청 헤더에 수동으로 `Bearer` 토큰 주입.
- SSE 이벤트를 `buffer.split(/\r?\n/)` 정규식을 활용해 라인 단위로 안전하게 파싱하도록 개선.

#### 📌 다음 할 일

- [x] 스트리밍 엔드포인트에 `ensureAuth` 미들웨어 추가 검토
  - 현재 `/write` 엔드포인트와 일관성 유지
  - 인증 필수인지 정책 결정 필요
- [ ] 네트워크 끊김 복구 전략 구현 (추후)
  - SSE 자동 재연결 (브라우저 기본 제공)
  - 에러 상태에서 사용자 경험 개선
- [x] 클라이언트 연결 끊김 시 OpenAI 스트림 abort (추후)
  - `req.on('close', ...)` 패턴
  - 리소스 누수 방지
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

- [RESOLVED] CORS 와일드카드 + credentials 충돌 ✅
- [RESOLVED] onChunk에서 ID를 찾지 못하는 문제 ✅
- [RESOLVED] 스트리밍 엔드포인트 인증 정책 결정 필요 ✅ (ensureAuth, checkProjectOwnership 적용 완료)

#### 📊 진행률

스트리밍 기능: ██████████ 100% (설계 + 구현 + 버그 수정 완료)

- Step 1: ✅ 백엔드 구현
- Step 2: ✅ 프론트 타입/API
- Step 3: ✅ Editor.tsx 교체
- Step 4: ✅ ParagraphItem.tsx 분기
- 🔧 에러 해결: CORS + State management

Week 12: ██████████ 100% (Day 3/7)  
전체: ███████████ 85%+ (Week 12/14)

---

### 📅 2026-06-02 (Day 79)

#### 🎯 오늘의 목표

- [x] 백엔드 Sentry Node.js SDK 설치 및 초기화
- [x] 프론트엔드 Sentry React SDK 설치 및 초기화
- [x] 에러 핸들러에 Sentry 에러 캡처 연동
- [x] Vite 빌드에 소스맵 업로드 플러그인 연결

#### ✅ 완료한 작업

**백엔드 Sentry 설정**

- ✅ `@sentry/node ^10.55.0` 패키지 설치 (`backend/package.json`)
- ✅ `backend/src/index.ts` 최상단에 `Sentry.init()` 호출
  - `dsn: process.env.SENTRY_DSN` 환경변수 참조
  - `environment: process.env.NODE_ENV || "development"` 설정
  - `Sentry.setupExpressErrorHandler(app)` 추가 (글로벌 에러 핸들러 앞에 위치)
- ✅ `backend/src/middleware/errorHandler.ts`에 `Sentry.captureException(err)` 추가
  - 기존 `console.error(err)` 유지, Sentry로도 동시에 전송
- ✅ `dotenv/config` import를 조건 없이 항상 실행하도록 변경

**프론트엔드 Sentry 설정**

- ✅ `@sentry/react ^10.55.0` 설치 (런타임 의존성)
- ✅ `@sentry/vite-plugin ^5.3.0` 설치 (devDependency)
- ✅ `frontend/src/main.tsx`에 `Sentry.init()` 추가 (ReactDOM.createRoot() 호출 전)
  - `dsn: import.meta.env.VITE_SENTRY_DSN`
  - `integrations: [Sentry.browserTracingIntegration()]`
  - `tracesSampleRate: 0` (성능 추적 비활성화, 에러만 수집)
- ✅ `frontend/src/App.tsx`에 `<Sentry.ErrorBoundary fallback={<ErrorPage />}>` 추가
  - 전체 앱을 에러 바운더리로 감싸서 React 렌더링 에러도 Sentry에 보고
  - `Error` → `ErrorPage`로 컴포넌트 import alias 수정 (내장 `Error` 객체와 이름 충돌 방지)
- ✅ `frontend/vite.config.ts`에 `sentryVitePlugin` 추가
  - `org`, `project`, `authToken: process.env.SENTRY_AUTH_TOKEN` 설정
  - `build.sourcemap: true` 활성화 (프로덕션 빌드에서 정확한 스택트레이스 제공)

#### 💡 배운 것

**Sentry 초기화 위치의 중요성**

```typescript
// ❌ 잘못된 순서: app 세팅 후 Sentry 초기화
const app = express();
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "..." });

// ✅ 올바른 순서: 파일 최상단에서 먼저 초기화
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "..." }); // 다른 어떤 import보다 먼저
import express from "express";
```

- Sentry는 Node.js 모듈 로딩 과정에 후킹(hooking)하여 instrumentation을 적용
- 다른 모듈이 먼저 로드되면 Sentry가 해당 모듈의 자동 계측을 놓칠 수 있음
- 프론트엔드도 마찬가지로 `createRoot()` 전에 `Sentry.init()` 호출 필수

**`Sentry.setupExpressErrorHandler(app)` vs `errorHandler` 미들웨어**

```typescript
// Express 에러 미들웨어 순서
app.use("/api", router);
Sentry.setupExpressErrorHandler(app); // ← Sentry가 에러를 먼저 캡처
app.use(errorHandler); // ← 그 후 커스텀 에러 핸들러로 응답 전송
```

- `setupExpressErrorHandler`는 Express의 에러 핸들링 미들웨어로 등록됨
- 라우터 다음, 커스텀 에러 핸들러 이전에 위치해야 정상 동작
- 이 메서드 없이 `errorHandler`에서 `Sentry.captureException()`만 호출해도 동작하지만, `setupExpressErrorHandler`를 사용하면 unhandledRejection, uncaughtException도 자동 처리

**`tracesSampleRate: 0` 설정 이유**

- `tracesSampleRate`은 성능 모니터링(트랜잭션 추적) 샘플링 비율
- `1`로 설정하면 모든 요청이 성능 트랜잭션으로 기록 → Sentry 요금 빠르게 소진
- 무료 플랜에서는 에러 모니터링이 주목적이므로 `0`으로 설정해 에러만 수집

**소스맵과 에러 추적**

```
프로덕션 빌드 (번들링 전)          번들링 후 (브라우저에서 실행)
src/components/Editor.tsx:45  →  dist/assets/index-Abc123.js:1
  throw new Error("...")           throw new Error("...")
```

- 브라우저에서 발생한 에러 스택트레이스는 압축된 번들 파일을 가리킴
- `sourcemap: true` + `sentryVitePlugin`으로 빌드 시 소스맵을 Sentry에 업로드
- 이후 Sentry 대시보드에서 원본 파일명, 라인 번호로 정확한 에러 위치 확인 가능

**ErrorBoundary 사용 시점**

```tsx
// React 렌더링 에러는 일반 try-catch로 잡을 수 없음
// ErrorBoundary로만 잡을 수 있다
<Sentry.ErrorBoundary fallback={<ErrorPage />}>
  <RouterProvider router={router} />
</Sentry.ErrorBoundary>
```

- 네트워크 에러나 이벤트 핸들러 에러는 ErrorBoundary가 잡지 않음
- 렌더링 중 발생하는 에러, `useEffect` 내 throw 등만 잡음
- `fallback` prop에 에러 발생 시 보여줄 컴포넌트를 지정

#### 🔧 해결한 문제

**`Error` 컴포넌트 이름 충돌**

**문제점:**

- `import Error from "@/components/common/Error"` 이름이 JS 내장 `Error` 객체와 동일
- TypeScript 및 ESLint에서 잠재적 혼란 발생 가능

**해결 방법:**

```typescript
// ❌ Before
import Error from "@/components/common/Error";
errorElement: <Error />,
fallback={<Error />}

// ✅ After
import ErrorPage from "@/components/common/Error";
errorElement: <ErrorPage />,
fallback={<ErrorPage />}
```

**`dotenv/config` 조건부 import 제거**

**문제점:**

```typescript
// ❌ Before: 프로덕션에서 .env 파일 로드 안 됨
if (process.env.NODE_ENV !== "production") {
  import("dotenv/config");
}
```

- `import()`는 동적 import → 비동기 실행이라 SENTRY_DSN이 `Sentry.init()` 시점에 아직 로드 안 됨
- 실제 배포 환경에서는 환경변수를 시스템에서 주입하므로 dotenv 불필요하지만, 개발 환경 일관성을 위해 항상 로드하는 게 안전

**해결 방법:**

```typescript
// ✅ After: 최상단에서 동기적으로 항상 로드
import "dotenv/config";
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN, ... });
```

#### 📌 내일 할 일

- [x] `SENTRY_DSN`, `VITE_SENTRY_DSN` 환경변수를 `.env` 파일에 추가
- [x] Sentry 대시보드에서 에러 수신 확인 (테스트 에러 발생시켜보기)
- [x] `vite.config.ts`의 `org`, `project` 값을 실제 Sentry 프로젝트 정보로 업데이트
- [ ] **Step 4 진행**: 입력 검증 추가 (Zod 스키마)
- [ ] **Step 5 진행**: 에러 처리 개선

#### 🚨 이슈/질문

- [TODO] `vite.config.ts`의 `org: "your-org"`, `project: "your-project"` 플레이스홀더 → 실제 Sentry 프로젝트 슬러그로 교체 필요
- [TODO] `SENTRY_AUTH_TOKEN` 환경변수 발급 및 `.env`에 추가 (소스맵 업로드 시 필요)
- [질문] 프로덕션 배포 시 소스맵 파일을 번들에 포함시키지 않고 Sentry에만 올리려면 `sourcemap: "hidden"` 옵션 사용 검토 필요

#### 📊 진행률

Sentry 모니터링 셋업: ████████░░ 80% (SDK 초기화 완료, DSN 연결 및 검증 필요)

- ✅ 백엔드: @sentry/node 설치 + init + 에러 핸들러 연동
- ✅ 프론트엔드: @sentry/react 설치 + init + ErrorBoundary 추가
- ✅ 빌드: @sentry/vite-plugin + sourcemap 설정
- ⬜ 환경변수 설정 및 실제 Sentry 프로젝트 연결 확인

Week 12: ████████████ 100%+ (Day 4/7)  
전체: ████████████ 87%+ (Week 12/14)

---
