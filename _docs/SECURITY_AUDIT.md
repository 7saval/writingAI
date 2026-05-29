# WritingAI 보안 감사 보고서

**작성일:** 2026-05-29  
**감사 대상:** WritingAI Backend (Express.js + TypeORM)  
**심각도:** 🔴 **CRITICAL** - 인가 검증 완전 누락

---

## 📋 Executive Summary

현재 WritingAI 백엔드는 **인증(Authentication)은 부분적으로 구현**되어 있으나, **인가(Authorization) 검증이 완전히 누락**된 상태입니다. 이로 인해 다음과 같은 심각한 보안 위험이 존재합니다:

- ✅ 인증: JWT 토큰 검증 구현됨
- ❌ **인가: 사용자 소유권 검증 완전 누락**
- ❌ **미들웨어: 여러 엔드포인트가 `ensureAuth` 미적용**

이는 **다른 사용자의 프로젝트, 단락, 컨텍스트를 임의로 조회/수정/삭제**할 수 있다는 의미입니다.

---

## 🔍 발견된 보안 취약점

### 1. 🔴 CRITICAL: 인증 미들웨어 누락 (누구나 접근 가능)

**영향도:** 극대 | **복구 난이도:** 매우 낮음

#### 문제점

다음 엔드포인트들이 `ensureAuth` 미들웨어가 없어서 **토큰 없이도 접근 가능**합니다:

```
프로젝트 관련:
  - GET  /api/projects/:id              (프로젝트 상세 조회)
  - GET  /api/projects/:id/paragraphs   (프로젝트 단락 조회)
  - PUT  /api/projects/:id              (프로젝트 수정)
  - DELETE /api/projects/:id            (프로젝트 삭제)

컨텍스트 관련:
  - GET  /api/projects/:id/context      (시놉시스, 로어북 조회)
  - PUT  /api/projects/:id/context      (시놉시스, 로어북 수정)

단락 관련:
  - PUT  /api/paragraphs/:id            (단락 수정)
  - DELETE /api/paragraphs/:id          (단락 삭제)
  - POST /api/paragraphs/:id/regenerate (AI 단락 재생성)
```

#### 공격 시나리오

```bash
# 인증 없이 누구나 ID 1인 프로젝트 조회 가능
curl http://localhost:5000/api/projects/1

# 인증 없이 누구나 ID 1인 프로젝트 삭제 가능
curl -X DELETE http://localhost:5000/api/projects/1

# 인증 없이 누구나 ID 1인 프로젝트 수정 가능
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked!"}'
```

#### 근본 원인

**projectRoutes.ts (라인 16-19)**
```typescript
projectRouter.get('/:id', getProjectDetail);              // ❌ ensureAuth 없음
projectRouter.get('/:id/paragraphs', getProjectParagraphs); // ❌ ensureAuth 없음
projectRouter.put('/:id', updateProject);                 // ❌ ensureAuth 없음
projectRouter.delete('/:id', deleteProject);              // ❌ ensureAuth 없음
```

---

### 2. 🔴 CRITICAL: 인가 검증 누락 (다른 사용자 리소스 접근)

**영향도:** 극대 | **복구 난이도:** 낮음

#### 문제점

인증 미들웨어가 있는 엔드포인트에서도 **사용자 소유권을 확인하지 않습니다**.

```typescript
// projectController.ts - updateProject()
export async function updateProject(req: Request, res: Response, next: NextFunction) {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOneBy({ id: Number(req.params.id) });
    
    // ❌ 문제: 현재 사용자(req.user.id)가 이 프로젝트의 소유자인지 확인 안함!
    if (req.body.title !== undefined) project.title = req.body.title;
    await repo.save(project);
}
```

#### 공격 시나리오

```bash
# 사용자 A가 로그인하여 토큰 획득
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"userA@example.com","password":"..."}' 
# 응답: { "accessToken": "token_A" }

# 사용자 A가 자신의 프로젝트는 ID 1
# 사용자 B가 자신의 프로젝트는 ID 2

# 사용자 A가 사용자 B의 프로젝트(ID 2)를 수정할 수 있음!
curl -X PUT http://localhost:5000/api/projects/2 \
  -H "Authorization: Bearer token_A" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked by User A!"}'

# ✅ 성공! 사용자 B의 프로젝트가 수정됨
```

#### 영향받는 컨트롤러들

**projectController.ts:**
- `updateProject()` - 다른 사용자의 프로젝트 수정 가능
- `deleteProject()` - 다른 사용자의 프로젝트 삭제 가능

**contextController.ts:**
- `updateContext()` - 다른 사용자의 시놉시스/로어북 수정 가능
- `getContext()` - 다른 사용자의 시놉시스/로어북 조회 가능

**paragraphController.ts:**
- `updateParagraph()` - 다른 사용자의 단락 수정 가능
- `deleteParagraph()` - 다른 사용자의 단락 삭제 가능
- `regenerateAiParagraph()` - 다른 사용자의 AI 단락 재생성 가능

---

### 3. 🟡 HIGH: 민감한 정보 로그 노출

**영향도:** 높음 | **복구 난이도:** 매우 낮음

#### 문제점

**authController.ts (라인 173)**
```typescript
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 1000 * 60 * 5);
    await repo.save(user);
    
    // ❌ 문제: 인증코드를 콘솔에 출력함!
    console.log(`인증코드: ${code}`);
}
```

**응답도 인증코드 포함:**
```typescript
return res.status(StatusCodes.OK).json({
    message: "인증코드가 이메일로 전송되었습니다.",
    code,  // ❌ 인증코드를 응답에 포함!
});
```

#### 공격 시나리오

- 프로덕션 서버의 로그 파일을 확인하면 모든 사용자의 비밀번호 재설정 코드가 노출됨
- API 응답을 네트워크 스니핑으로 캡처하면 재설정 코드 획득 가능
- 다른 사용자의 이메일로 비밀번호 재설정 요청 후 코드를 가로채서 계정 탈취 가능

---

### 4. 🟡 HIGH: 입력 검증 부재

**영향도:** 높음 | **복구 난이도:** 낮음

#### 문제점

요청 본문의 입력 검증이 없어서 **예상치 못한 데이터가 저장될 수 있습니다**.

```typescript
// projectController.ts - updateProject()
if (req.body.title !== undefined) project.title = req.body.title;
if (req.body.genre !== undefined) project.genre = req.body.genre;
```

- 빈 문자열 저장 가능
- 매우 긴 문자열 저장 가능 (DoS 공격)
- 예상치 못한 타입의 데이터 저장 가능
- XSS 공격 가능 (프론트엔드에서 렌더링할 때)

#### 예시

```bash
# 매우 긴 제목으로 DoS 공격
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"'"$(python3 -c 'print("A"*100000)')"'"}'
```

---

### 5. 🟠 MEDIUM: 토큰 만료 처리 미흡

**영향도:** 중간 | **복구 난이도:** 낮음

#### 문제점

**authController.ts (라인 539-546)**
```typescript
catch (error: any) {
    if (error.name === "TokenExpiredError") {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "리프레시 토큰이 만료되었습니다.",
        });
    }
    // ❌ 다른 모든 에러도 UNAUTHORIZED로 처리
    res.status(StatusCodes.UNAUTHORIZED).json({
        message: "유효하지 않은 리프레시 토큰입니다.",
    });
}
```

- 토큰 만료 시간 로직이 불명확함
- 리프레시 토큰 탈취 시 만료될 때까지 계속 사용 가능

---

### 6. 🟠 MEDIUM: CORS 보안

**영향도:** 중간 | **복구 난이도:** 매우 낮음

#### 확인 필요

`app.ts` 또는 메인 서버 파일에서 CORS 설정을 확인해야 합니다.

```typescript
// ❌ 위험한 설정 예
app.use(cors({ origin: '*' })); // 모든 출처 허용
app.use(cors()); // 기본값: 모든 출처 허용
```

---

## ✅ 해결방안

### 1️⃣ 단계 1: 인증 미들웨어 추가 (우선순위: 최고)

모든 보호해야 할 엔드포인트에 `ensureAuth` 추가

**파일: `backend/src/routes/projectRoutes.ts`**
```typescript
import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware";

export const projectRouter = Router();

projectRouter.post('/', ensureAuth, createProject);
projectRouter.get('/', ensureAuth, getProjects);

// ✅ ensureAuth 추가
projectRouter.get('/:id', ensureAuth, getProjectDetail);
projectRouter.get('/:id/paragraphs', ensureAuth, getProjectParagraphs);
projectRouter.put('/:id', ensureAuth, updateProject);
projectRouter.delete('/:id', ensureAuth, deleteProject);
```

**파일: `backend/src/routes/paragraphRoutes.ts`**
```typescript
import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware";

export const paragraphRouter = Router();

// ✅ ensureAuth 추가
paragraphRouter.put('/:id', ensureAuth, updateParagraph);
paragraphRouter.delete('/:id', ensureAuth, deleteParagraph);
paragraphRouter.post('/:id/regenerate', ensureAuth, regenerateAiParagraph);
```

**파일: `backend/src/routes/contextRoutes.ts`**
```typescript
import { Router } from "express";
import { ensureAuth } from "../middleware/authMiddleware";

export const contextRouter = Router();

// ✅ ensureAuth 추가
contextRouter.get('/:id/context', ensureAuth, getContext);
contextRouter.put('/:id/context', ensureAuth, updateContext);
```

---

### 2️⃣ 단계 2: 인가 검증 추가 (소유권 확인)

모든 리소스 접근 시 현재 사용자가 소유자인지 확인

**패턴: 모든 컨트롤러에 적용**

```typescript
// ❌ 현재 코드
export async function updateProject(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOneBy({ id: Number(req.params.id) });
    if (!project) return res.status(404).json({ message: 'Not found' });
    
    // 소유자 확인 없이 수정
    project.title = req.body.title;
    await repo.save(project);
}

// ✅ 수정된 코드
export async function updateProject(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOne({
        where: { id: Number(req.params.id) },
        relations: ['user']  // 사용자 관계 로드
    });
    
    if (!project) return res.status(404).json({ message: 'Not found' });
    
    // ✅ 소유자 확인!
    if (project.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this project' });
    }
    
    // 이제 안전하게 수정
    project.title = req.body.title;
    await repo.save(project);
}
```

#### 적용할 컨트롤러 메서드

**projectController.ts:**
```typescript
// getProjectDetail() - 프로젝트 접근 권한 확인
if (project.user.id !== req.user!.id) {
    return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Forbidden' 
    });
}

// updateProject() - 프로젝트 소유권 확인
if (project.user.id !== req.user!.id) {
    return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Forbidden' 
    });
}

// deleteProject() - 프로젝트 소유권 확인
if (project.user.id !== req.user!.id) {
    return res.status(StatusCodes.FORBIDDEN).json({ 
        message: 'Forbidden' 
    });
}

// getProjectParagraphs() - 프로젝트 접근 권한 확인
// Project를 로드한 후 소유권 확인 필요
```

**contextController.ts:**
```typescript
// getContext() - 프로젝트 접근 권한 확인
const project = await repo.findOne({
    where: { id: Number(req.params.id) },
    relations: ['user']
});
if (project.user.id !== req.user!.id) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
}

// updateContext() - 프로젝트 소유권 확인
if (project.user.id !== req.user!.id) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
}
```

**paragraphController.ts:**
```typescript
// 모든 메서드에서: Paragraph → Project → User 체인으로 소유권 확인
const paragraph = await repo.findOne({
    where: { id: Number(req.params.id) },
    relations: ['project', 'project.user']
});

if (paragraph.project.user.id !== req.user!.id) {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' });
}
```

---

### 3️⃣ 단계 3: 민감한 정보 노출 방지

**파일: `backend/src/controllers/authController.ts`**

```typescript
// ❌ 현재 코드
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 1000 * 60 * 5);
    await repo.save(user);
    
    console.log(`인증코드: ${code}`);  // ❌ 제거!
    
    return res.status(StatusCodes.OK).json({
        message: "인증코드가 이메일로 전송되었습니다.",
        code,  // ❌ 제거!
    });
}

// ✅ 수정된 코드
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 1000 * 60 * 5);
    await repo.save(user);
    
    // TODO: 실제 이메일 서비스로 코드 전송
    // await emailService.sendResetCode(user.email, code);
    
    // 프론트엔드에는 응답 메시지만 전달 (실제 코드는 절대 노출 금지)
    return res.status(StatusCodes.OK).json({
        message: "인증코드가 이메일로 전송되었습니다."
    });
}
```

---

### 4️⃣ 단계 4: 입력 검증 추가

Zod 또는 joi를 사용한 입력 검증 미들웨어 추가

**선택 1: Zod 사용 (권장)**

```typescript
// backend/src/middleware/validation.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

const UpdateProjectSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    genre: z.string().max(50).optional(),
    description: z.string().max(1000).optional(),
    synopsis: z.string().max(5000).optional(),
    lorebook: z.array(z.any()).optional()
});

export function validateUpdateProject(req: Request, res: Response, next: NextFunction) {
    try {
        const validated = UpdateProjectSchema.parse(req.body);
        req.body = validated;  // 검증된 데이터로 교체
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid input' });
    }
}
```

**라우트에 적용:**
```typescript
projectRouter.put('/:id', ensureAuth, validateUpdateProject, updateProject);
```

---

### 5️⃣ 단계 5: 에러 처리 개선

일관된 에러 응답 패턴 구현

```typescript
// backend/src/middleware/errorHandler.ts
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }
    
    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
}
```

---

### 6️⃣ 단계 6: CORS 보안 강화

**파일: `backend/src/index.ts` 또는 `backend/src/app.ts`**

```typescript
import cors from 'cors';

// ❌ 위험
app.use(cors({ origin: '*' }));

// ✅ 안전
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 구현 우선순위

| 우선순위 | 항목 | 복구 난이도 | 소요 시간 |
|---------|------|-----------|---------|
| 🔴 1순위 | 인증 미들웨어 추가 (Step 1) | 매우 낮음 | 15분 |
| 🔴 2순위 | 인가 검증 추가 (Step 2) | 낮음 | 1-2시간 |
| 🟡 3순위 | 민감한 정보 노출 방지 (Step 3) | 매우 낮음 | 10분 |
| 🟡 4순위 | 입력 검증 추가 (Step 4) | 낮음 | 1시간 |
| 🟠 5순위 | 에러 처리 개선 (Step 5) | 낮음 | 30분 |
| 🟠 6순위 | CORS 보안 (Step 6) | 매우 낮음 | 5분 |

---

## 🧪 테스트 체크리스트

수정 후 다음을 검증하세요:

### 인증 테스트
- [ ] 토큰 없이 보호된 엔드포인트 접근 불가 (401 Unauthorized)
- [ ] 유효한 토큰으로 접근 가능
- [ ] 만료된 토큰으로 접근 불가 (401 Unauthorized)

### 인가 테스트
- [ ] 사용자 A가 자신의 프로젝트 조회 가능
- [ ] 사용자 A가 사용자 B의 프로젝트 조회 불가 (403 Forbidden)
- [ ] 사용자 A가 자신의 프로젝트 수정 가능
- [ ] 사용자 A가 사용자 B의 프로젝트 수정 불가 (403 Forbidden)
- [ ] 사용자 A가 자신의 프로젝트 삭제 가능
- [ ] 사용자 A가 사용자 B의 프로젝트 삭제 불가 (403 Forbidden)

### 입력 검증 테스트
- [ ] 빈 제목으로 프로젝트 수정 불가
- [ ] 매우 긴 제목으로 프로젝트 수정 불가
- [ ] 유효한 입력으로 수정 가능

### 정보 노출 테스트
- [ ] forgotPassword 응답에 인증코드 미포함
- [ ] 서버 로그에 인증코드 미출력

---

## 📚 참고: 보안 Best Practices

### 1. 인증 vs 인가

| 개념 | 설명 | 예시 |
|-----|------|------|
| **인증** | "넌 누니?" | JWT 토큰 검증 |
| **인가** | "너 이거 할 수 있니?" | 사용자가 리소스의 소유자인지 확인 |

### 2. 최소 권한 원칙 (Principle of Least Privilege)
- 각 사용자는 필요한 최소한의 권한만 가져야 함
- 사용자는 자신의 리소스만 접근 가능해야 함

### 3. 종심 방어 (Defense in Depth)
- 여러 보안 계층 추가
- 한 계층이 뚫려도 다른 계층이 방어

### 4. 민감한 정보 취급
- 인증코드, 토큰, 비밀번호는 절대 로그/응답에 노출 금지
- 비밀번호는 항상 해싱하여 저장 (이미 bcrypt 사용 중 ✅)

---

## 🔒 추가 보안 강화 사항 (선택)

장기적으로 고려할 사항:

### 1. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100  // 최대 100개 요청
});

app.use('/api/', limiter);
```

### 2. HTTPS/SSL (프로덕션)
- 모든 데이터를 암호화하여 전송
- `Secure` 쿠키 옵션 활성화

### 3. SQL Injection 방지
- 현재 TypeORM 사용으로 자동 방지됨 ✅

### 4. XSS 방지
- DOMPurify, xss 라이브러리 사용
- Content-Security-Policy 헤더 설정

### 5. 감사 로그 (Audit Logging)
```typescript
// 누가, 언제, 무엇을 했는지 기록
await auditLog.create({
    userId: req.user.id,
    action: 'UPDATE_PROJECT',
    projectId: project.id,
    timestamp: new Date(),
    changes: { title: oldTitle, newTitle: newTitle }
});
```

---

## 📞 질문 및 피드백

이 문서에 대한 질문이나 추가 보안 우려사항이 있으면 알려주세요.

**다음 단계:**
1. 우선순위 1-3 (Step 1-3) 즉시 구현
2. 풀 리퀘스트 생성 후 코드 리뷰 진행
3. 모든 테스트 체크리스트 검증
4. 프로덕션 배포 전 보안 테스트 완료
