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

**Step 2: 인가 검증 추가 완료** 🔐

- ✅ `projectController.ts` 수정 (4개 메서드)
  - `getProjectDetail()`: 프로젝트 소유권 검증 추가
  - `updateProject()`: 사용자 관계 로드 및 소유권 검증
  - `deleteProject()`: 소유권 검증 추가
  - `getProjectParagraphs()`: 프로젝트 소유권 먼저 확인 후 단락 조회
- ✅ `contextController.ts` 수정 (2개 메서드)
  - `getContext()`: 사용자 관계 로드 후 소유권 검증
  - `updateContext()`: 소유권 검증 후 업데이트

- ✅ `paragraphController.ts` 수정 (3개 메서드)
  - `updateParagraph()`: Paragraph → Project → User 체인으로 소유권 검증
  - `deleteParagraph()`: 동일한 소유권 검증 로직 적용
  - `regenerateAiParagraph()`: 단락 재생성 전 소유권 확인

#### 💡 배운 것

**보안의 2가지 계층: 인증 vs 인가**

```
인증(Authentication): "넌 누니?"
  → JWT 토큰 검증 (이미 구현됨)

인가(Authorization): "너 이거 할 수 있니?"
  → 사용자가 리소스를 소유하는지 확인 (오늘 추가함)
```

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

#### 📌 내일 할 일

- [ ] **Step 3 진행**: 민감한 정보 노출 방지
  - forgotPassword에서 인증코드 콘솔 출력 제거
  - API 응답에서 인증코드 제거
- [ ] **Step 4 진행**: 입력 검증 추가
  - Zod 스키마 정의 (UpdateProjectSchema, UpdateContextSchema 등)
  - 검증 미들웨어 생성
  - 라우트에 적용

- [ ] **테스트 계획**
  - 보호된 엔드포인트 인증 테스트
  - 다른 사용자 리소스 접근 시 403 Forbidden 응답 확인
  - 자신의 리소스 접근/수정/삭제 정상 작동 확인

#### 🚨 이슈/질문

- forgotPassword의 응답 메시지 변경에 대한 프론트엔드 영향 확인 필요
  - 현재 응답에 `code`가 포함되어 있는데 제거되면 프론트엔드에서 감지할 수 있는지 확인

#### 📊 진행률

Week 12: ██░░░░░░░░ 20% (Day 1/7)  
전체: ████████░░ 80%+ (Week 12/14)

#### 🎓 오늘의 핵심 배움

> **보안은 여러 계층으로 방어해야 한다 (Defense in Depth)**
>
> 1. 인증: 토큰 검증 ✅
> 2. 인가: 소유권 확인 ✅ (오늘 추가)
> 3. 입력 검증: 다음 (Step 4)
> 4. 로그 보안: 다음 (Step 3)

---
