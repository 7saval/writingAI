# Week 13 개발 로그

---

### 📅 2026-06-10 (Day 87)

#### 🎯 오늘의 목표

- [x] LangGraph 기획서(`_docs/langgraph_planning.md`) 기반 Phase 1 구현
- [x] `backend/src/services/langgraph/` 디렉토리 구조 생성
- [x] 상태 정의(`state.ts`) 작성 — Phase 2-9 확장 필드 포함
- [x] 기초 그래프 노드 구현 — `buildContext`, `generateContent`
- [x] 기존 `writeWithAi` 컨트롤러를 LangGraph 파이프라인으로 교체
- [x] Phase 2: 병렬 변형 생성 (A/B/C 3가지 temperature)
- [x] Phase 3: 2단계 API (`/variants` 생성 → `/select` 확정)
- [x] Phase 4: LLM-as-Judge 품질 재시도 루프 (최대 2회)
- [x] Phase 5: 로어북 일관성 검증
- [x] Phase 6: 기본 품질 필터 (길이, undefined, 한국어 비율)
- [x] Phase 7: 프론트엔드 변형 선택 UI + SSE 실시간 스트리밍
- [x] 버그 수정 3건

#### ✅ 완료한 작업

**LangGraph Phase 1 전체 구현**

- ✅ `backend/src/services/langgraph/state.ts` 생성
  - `WritingStateAnnotation` 전체 상태 정의 (Phase 1~9 모든 필드 포함)
  - `VariantResult` 인터페이스 정의 (`id`, `content`, `temperature`, `label`, `qualityScore?`, `loreWarning?`, `qualityPassed?`)
  - 공통 `overwrite` reducer 함수로 중복 제거
- ✅ `backend/src/services/langgraph/nodes/buildContext.ts` 생성
  - 기존 `buildContext()` (aiService.ts) 재사용
  - `OpenAI.Chat.ChatCompletionMessageParam[]` → `BaseMessage[]` 변환 로직 포함
  - 시스템 프롬프트(장르별) + 컨텍스트 메시지 + 최종 사용자 메시지 조합
- ✅ `backend/src/services/langgraph/graph.ts` 생성 (Phase 1 → Phase 4에서 전면 교체)
  - Phase 1: `START → buildContext → generateContent → END`
  - Phase 4 완료 후: 조건부 엣지 포함 전체 파이프라인
- ✅ `backend/src/services/langgraph/index.ts`
  - `runWritingGraph()` 래퍼 (기존 API 호환)
  - `runVariantsGraph()` 신규 추가 — `VariantResult[]` 반환

**aiService.ts 리팩토링**

- ✅ `GENRE_PROMPTS`, `GENRE_MAP` — 인라인 → 모듈 스코프 상수로 이동
- ✅ `buildSystemPrompt(genre?: string): string` 함수 신규 export
  - langgraph `buildContextNode`에서 import하여 재사용

**Phase 2: 병렬 변형 생성**

- ✅ `backend/src/services/langgraph/nodes/generateVariants.ts` 생성
  - `VARIANT_CONFIGS`: A=0.6 정석형, B=0.8 균형형, C=1.0 창의형
  - `Promise.allSettled()`로 3개 병렬 생성, 부분 실패 격리
  - 재시도 시 `qualityPassed: true` 변형 보존, 실패 변형만 재생성
  - `qualityFeedback[id]` → 재시도 시 HumanMessage로 주입

**Phase 3: 2단계 API**

- ✅ `backend/src/services/variantSessionStore.ts` 생성
  - 인메모리 Map + 5분 TTL + `crypto.randomUUID()`
  - `createVariantSession()`, `getVariantSession()`, `deleteVariantSession()`
- ✅ `POST /writing/:id/write/variants` — 변형 생성 + 세션 반환
- ✅ `POST /writing/:id/write/select` — 변형 선택 → AI 단락 DB 저장

**Phase 4: 품질 재시도 루프**

- ✅ `backend/src/services/langgraph/nodes/qualityEvaluator.ts` 생성
  - LLM-as-Judge: 0-10점 평가, QUALITY_THRESHOLD=7
  - `evaluateSingleVariant()` 단독 export (컨트롤러에서도 사용)
  - `shouldRetryGeneration()` — `"retry" | "proceed"` 반환
  - JSON regex 파싱 실패 시 threshold 점수로 폴백 (통과 처리)
- ✅ `graph.ts`에 `addConditionalEdges("qualityEvaluator", shouldRetryGeneration, ...)` 추가
  - 최대 2회 재시도 후 강제 진행

**Phase 5: 로어북 일관성 검증**

- ✅ `backend/src/services/langgraph/nodes/loreConsistencyChecker.ts` 생성
  - `includeInPrompt: true` 노트만 필터링
  - 관련 노트 없으면 null 반환 (LLM 호출 생략)
  - `checkSingleVariant()` 단독 export

**Phase 6: 기본 품질 필터**

- ✅ `backend/src/services/langgraph/nodes/basicQualityFilter.ts` 생성
  - 길이 50자 미만 제거
  - `"undefined"` 문자열 포함 제거
  - 한국어 문자 비율 30% 미만 제거

**Phase 7: 프론트엔드 변형 선택 UI + SSE 스트리밍**

- ✅ `frontend/src/components/VariantSelector.tsx` 생성
  - `VariantSelectorSkeleton` — 3개 pulse 스켈레톤 카드
  - `VariantCard` — 라벨 배지(색상 구분), 품질 점수, 로어 경고 배너, 전체 내용 출력 (line-clamp 제거), 스트리밍 커서
  - 커서 애니메이션: `animate-[blink_0.8s_step-end_infinite]`
  - 스트리밍 중 / 평가 중 / 선택 중 상태별 버튼 비활성화
- ✅ `frontend/tailwind.config.js` — blink 키프레임 + 애니메이션 등록
- ✅ `frontend/src/components/Editor.tsx` 전면 교체
  - `INITIAL_VARIANTS`: 3개 빈 카드로 즉시 초기화 (제출 직후)
  - SSE 이벤트별 상태 업데이트: `onChunk` → 카드 내용 누적, `onVariantDone` → streamingIds 제거, `onDone` → 세션 저장
  - 버튼 레이블: 스트리밍 중 → "AI 작성 중...", 평가 중 → "품질 평가 중...", 완료 → "버전을 선택해 주세요"

**SSE 스트리밍 구현**

- ✅ `POST /writing/:id/write/variants/stream` SSE 엔드포인트 추가
  - 3개 `ChatOpenAI.stream()` 병렬 실행
  - `chunk` 이벤트: 변형 ID + 텍스트 조각
  - `variant_done` → `evaluating` → `done` (sessionId + 최종 variants) 순서
- ✅ `frontend/src/lib/sseClient.ts` 생성 — fetch + ReadableStream 파싱 공통화
- ✅ `frontend/src/api/writing.api.ts` — `generateVariantsStream()`, `selectVariant()` 추가

**훅 레이어 정리**

- ✅ `frontend/src/hooks/useWriting.ts` 전면 교체
  - `useGenerateVariantsStream()` — `currentStage` 주입, `useCallback` 래핑
  - `useGenerateVariantsMutation()` — non-streaming fallback
  - `useSelectVariantMutation()` — 선택 확정

**코드 중복 제거**

- ✅ `backend/src/utils/sseHelpers.ts` — `initSseResponse()` 공통화
  - 백엔드 SSE 헤더 설정 + `send()` 클로저 반환
- ✅ `frontend/src/lib/sseClient.ts` — `fetchSsePost()` 공통화
  - auth 헤더, fetch, reader, 파싱 루프 통합

#### 💡 배운 것

**LangGraph JS v1.3.7 Annotation API 구조**

LangGraph JS에서 상태를 정의하는 두 가지 패턴:

```typescript
// Pattern 1: 단순 LastValue (no default, 항상 invoke 시 제공)
const StateAnnotation = Annotation.Root({
  field: Annotation<string>, // 인자 없이 참조 → () => LastValue<string> 팩토리
});

// Pattern 2: 커스텀 reducer + default (내부 상태에 적합)
const StateAnnotation = Annotation.Root({
  field: Annotation<string[]>({
    reducer: (_, next: string[]) => next, // 덮어쓰기
    default: () => [],
  }),
});
```

`default` 만 있고 `reducer` 없이 넘기면 TypeScript 에러 발생. `reducer`(또는 deprecated `value`)가 필수다.

**LangGraph 조건부 엣지 (addConditionalEdges)**

```typescript
// 품질 재시도 루프: qualityEvaluator → retry 또는 proceed
graph.addConditionalEdges("qualityEvaluator", shouldRetryGeneration, {
  retry: "generateVariants",
  proceed: "basicQualityFilter",
});

// shouldRetryGeneration은 state를 받아 문자열 키 반환
function shouldRetryGeneration(state: WritingState): "retry" | "proceed" {
  const failedVariants = state.variants.filter((v) => !v.qualityPassed);
  const canRetry = failedVariants.some(
    (v) => (state.retryCount?.[v.id] ?? 0) < MAX_RETRY,
  );
  return failedVariants.length > 0 && canRetry ? "retry" : "proceed";
}
```

순환 그래프는 `StateGraph`가 기본 지원한다. `addConditionalEdges`의 세 번째 인자가 각 반환값을 노드 이름에 매핑하는 객체다.

**LLM-as-Judge 패턴**

```typescript
// 평가 프롬프트 끝에 JSON 형식 응답 요구
const prompt = `...
JSON 형식으로만 응답: {"score": 숫자, "feedback": "개선 방향"}`;

// 파싱 실패 시 폴백으로 통과 처리 (서비스 장애 방지)
const jsonMatch = text.match(/\{[^}]+\}/);
if (jsonMatch) { ... } // 파싱 성공
else { score = QUALITY_THRESHOLD; } // 파싱 실패 → threshold로 폴백
```

JSON 파싱 실패 시 통과 처리(점수=threshold)가 안전하다. LLM 판단 실패로 정상 컨텐츠가 버려지는 것이 더 나쁜 결과이기 때문.

**SSE 스트리밍 패턴 (백엔드)**

```typescript
// 1. 헤더 설정 + send 헬퍼 반환
export function initSseResponse(res: Response): (data: object) => void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  return (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// 2. ChatOpenAI.stream()으로 청크별 전송
for await (const chunk of await model.stream(messages)) {
  const text = typeof chunk.content === "string" ? chunk.content : "";
  if (text) send({ type: "chunk", variantId: config.id, content: text });
}
```

**SSE 스트리밍 패턴 (프론트엔드)**

```typescript
// fetch + ReadableStream 직접 파싱 (EventSource는 POST 불가)
export async function fetchSsePost(path, body, onEvent) {
  const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        onEvent(event);
      }
    }
  }
}
```

`EventSource` API는 GET 전용이라 POST SSE에는 fetch + ReadableStream을 직접 써야 한다. `\n\n` 구분자로 이벤트를 분리하고 buffer로 불완전 청크를 처리한다.

**OpenAI 메시지 → LangGraph BaseMessage 변환**

```typescript
rawMessages.map((msg) => {
  const content = typeof msg.content === "string" ? msg.content : "";
  return msg.role === "assistant"
    ? new AIMessage(content)
    : new HumanMessage(content);
});
```

- `system` role은 별도로 `new SystemMessage(...)` 추가
- `assistant` role → `AIMessage`, 나머지(`user`) → `HumanMessage`

**React key prop으로 컴포넌트 강제 리마운트**

```tsx
// WritingSession.tsx
<Editor key={projectId} />
```

React는 동일 컴포넌트 타입이면 상태를 유지한다. URL params가 바뀌어도 컴포넌트가 살아있으면 내부 state는 유지된다. `key`를 route param으로 지정하면 param이 바뀔 때 컴포넌트를 완전히 언마운트/리마운트해 초기 상태로 돌아간다.

**noUnusedParameters와 reducer 파라미터**

```typescript
// ❌ 에러 가능: prev 미사용
const overwrite = <T>(prev: T, next: T) => next;

// ✅ _ 접두사로 해결
const overwrite = <T>(_: T, next: T) => next;
```

#### 🔧 해결한 문제

**LangGraph Annotation 타입 오류**

**에러 메시지:**

```
error TS2345: Argument of type '{ default: () => Project; }' is not assignable
  to parameter of type 'SingleReducer<Project, Project>'.
  Property 'value' is missing in type '{ default: () => Project; }'
```

**원인:** `Annotation<T>({ default: () => ... })`처럼 `reducer` 없이 `default`만 넘기면 `SingleReducer<T>` 3개의 유니온 타입 중 어디에도 해당하지 않아 타입 오류 발생.

**해결:**

```typescript
const overwrite = <T>(_: T, next: T) => next;
project: Annotation<Project>({ reducer: overwrite<Project>, default: () => ({} as Project) }),
```

**프로젝트 전환 시 Editor 내용 미초기화**

**증상:** `/projects/5/paragraphs` → 새 프로젝트 생성 시 URL은 바뀌지만 Editor 내용이 초기화되지 않음.

**원인:** React는 같은 컴포넌트 타입이면 URL이 바뀌어도 인스턴스를 재사용하므로 내부 `useState` 값이 유지됨.

**해결:** `WritingSession.tsx`에서 `<Editor key={projectId} />` 추가. `projectId`가 바뀔 때 강제 리마운트.

**변형 카드 내용 잘림**

**증상:** 생성된 3개 변형 답변이 일부만 표시됨.

**원인:** `VariantCard`에 Tailwind `line-clamp-5` 적용되어 있었음.

**해결:** `line-clamp-5` 제거, `whitespace-pre-wrap` + 높이 제한 없음으로 변경.

**API 호출 컴포넌트 직접 의존 문제**

**증상:** Editor.tsx가 writing.api.ts의 `generateVariants`, `selectVariant`를 직접 import.

**원인:** 다른 로직(단락 작성)은 모두 hooks를 통하는데 변형 관련만 직접 호출.

**해결:** `useWriting.ts`에 `useGenerateVariantsMutation`, `useGenerateVariantsStream`, `useSelectVariantMutation` 훅 추가. Editor는 훅만 참조.

#### 📌 내일 할 일

- [ ] Phase 7 UI 실제 테스트 — 백엔드 서버 + 프론트 연동 E2E 확인
- [ ] Phase 8 검토: 사용자 프롬프트 편집기 개선 (기획서 참조)
- [ ] Phase 9 검토: 글쓰기 단계(stage) 선택 기능 개선
- [ ] 세션 만료(5분) 처리 — 프론트엔드에서 만료 시 에러 메시지 표시

#### 🚨 이슈/질문

- [주의] `variantSessionStore`는 인메모리이므로 서버 재시작 시 세션 소실. 추후 Redis 등으로 교체 고려.
- [주의] SSE 스트리밍 도중 브라우저 탭을 닫으면 서버에서 `req.on("close")` 감지 → 미저장 단락 삭제. variants 스트리밍 컨트롤러에는 동일 처리가 없어 미완성 세션이 TTL까지 남을 수 있음.
- [고려] Phase 2 fan-out에서 3개 LLM 호출 + quality eval 3개 + lore check 3개 = 최대 9회 API 호출. 비용 최적화 필요 시 lore check를 클라이언트가 요청할 때만 수행하도록 옵션화 가능.
- [확인 필요] `qualityPassed` 필드가 `state.ts`의 `VariantResult`에 추가되었으나 프론트엔드 `types/database.ts`의 `VariantResult`에도 반영 필요. (현재 optional이라 런타임 오류는 없지만 타입 불일치.)

#### 📊 진행률

LangGraph 마이그레이션: ████████░░ 80% (Phase 1-7 완료)

- ✅ Phase 0: 환경 설정
- ✅ Phase 1: 기초 그래프 (기존 API 1:1 재현)
- ✅ Phase 2: 병렬 변형 생성 (fan-out, 3x temperature)
- ✅ Phase 3: API 재설계 (2단계 엔드포인트 + 세션 저장소)
- ✅ Phase 4: 품질 반복 루프 (LLM-as-Judge + addConditionalEdges)
- ✅ Phase 5: 로어북 일관성 검증
- ✅ Phase 6: 기본 품질 필터
- ✅ Phase 7: 프론트엔드 변형 선택 UI + SSE 스트리밍
- ⬜ Phase 8: 사용자 지시사항 고도화
- ⬜ Phase 9: 글쓰기 단계 시스템 고도화

Week 13: ████████░░ 80% (Day 1/7)  
전체: ██████████████ 95%+ (Week 13/14)

---
