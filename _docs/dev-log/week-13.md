# Week 13 개발 로그

---

### 📅 2026-06-10 (Day 87)

#### 🎯 오늘의 목표

- [x] LangGraph 기획서(`_docs/langgraph_planning.md`) 기반 Phase 1 구현
- [x] `backend/src/services/langgraph/` 디렉토리 구조 생성
- [x] 상태 정의(`state.ts`) 작성 — Phase 2-9 확장 필드 포함
- [x] 기초 그래프 노드 구현 — `buildContext`, `generateContent`
- [x] 기존 `writeWithAi` 컨트롤러를 LangGraph 파이프라인으로 교체

#### ✅ 완료한 작업

**LangGraph Phase 1 전체 구현**

- ✅ `backend/src/services/langgraph/state.ts` 생성
  - `WritingStateAnnotation` 전체 상태 정의 (Phase 1~9 모든 필드 포함)
  - `VariantResult` 인터페이스 정의 (`id`, `content`, `temperature`, `label`, `qualityScore?`, `loreWarning?`)
  - 공통 `overwrite` reducer 함수로 중복 제거
- ✅ `backend/src/services/langgraph/nodes/buildContext.ts` 생성
  - 기존 `buildContext()` (aiService.ts) 재사용
  - `OpenAI.Chat.ChatCompletionMessageParam[]` → `BaseMessage[]` 변환 로직 포함
  - 시스템 프롬프트(장르별) + 컨텍스트 메시지 + 최종 사용자 메시지 조합
- ✅ `backend/src/services/langgraph/nodes/generateContent.ts` 생성
  - Phase 1 단일 생성 노드 (`ChatOpenAI` 사용)
  - `temperature`, `maxTokens` 상태에서 읽어 유연성 확보
  - 결과를 `variants[0]`에 저장 (Phase 2 fan-out과 동일한 인터페이스)
- ✅ `backend/src/services/langgraph/graph.ts` 생성
  - `START → buildContext → generateContent → END` 단순 선형 그래프
  - Phase 4 품질 루프 추가를 위한 확장 포인트 확보
- ✅ `backend/src/services/langgraph/index.ts` 생성
  - `runWritingGraph()` 래퍼 — 기존 `generateNextParagraph()`와 동일 시그니처
  - `writingGraph`, `WritingState`, `VariantResult` export

**aiService.ts 리팩토링**

- ✅ `GENRE_PROMPTS`, `GENRE_MAP` — 인라인 → 모듈 스코프 상수로 이동
- ✅ `buildSystemPrompt(genre?: string): string` 함수 신규 export
  - langgraph `buildContextNode`에서 import하여 재사용
  - `prepareFinalMessages` 내부 중복 로직 제거

**writingController.ts 수정**

- ✅ `writeWithAi` (비스트리밍 엔드포인트) — `generateNextParagraph` → `runWritingGraph`로 교체
- ✅ 스트리밍 엔드포인트(`writeWithAiStream`)는 Phase 3 API 재설계 전까지 기존 유지

**TypeScript 타입체크 통과**

- ✅ `npx tsc --noEmit` 에러 0개

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

`SingleReducer<T>` 타입 정의 (v1.3.7):

```typescript
type SingleReducer<ValueType, UpdateType = ValueType> =
  | { reducer: BinaryOperator<ValueType, UpdateType>; default?: () => ValueType }
  | { value: BinaryOperator<...>; default?: ... }  // deprecated
  | null;
```

`default` 만 있고 `reducer` 없이 넘기면 TypeScript 에러 발생. `reducer`(또는 deprecated `value`)가 필수다.

**OpenAI 메시지 → LangGraph BaseMessage 변환**

```typescript
// OpenAI SDK 타입: OpenAI.Chat.ChatCompletionMessageParam
// LangGraph 타입: BaseMessage (@langchain/core/messages)

rawMessages.map((msg) => {
  const content = typeof msg.content === "string" ? msg.content : "";
  return msg.role === "assistant"
    ? new AIMessage(content)
    : new HumanMessage(content);
});
```

- `system` role은 별도로 `new SystemMessage(...)` 추가
- `assistant` role → `AIMessage`, 나머지(`user`) → `HumanMessage`

**noUnusedParameters와 reducer 파라미터**

TypeScript `noUnusedParameters: true` 환경에서 reducer의 이전 값 파라미터가 문제가 될 수 있다.
`_` 접두사 파라미터는 컴파일러가 "의도적 미사용"으로 인식해 에러를 건너뜀.

```typescript
// ❌ 에러 가능: prev 미사용
const overwrite = <T>(prev: T, next: T) => next;

// ✅ _ 접두사로 해결
const overwrite = <T>(_: T, next: T) => next;
```

**LangGraph 상태 업데이트 패턴 (Partial 반환)**

각 노드 함수는 `Promise<Partial<WritingState>>`를 반환해 필요한 필드만 업데이트한다.
반환하지 않은 필드는 이전 값 그대로 유지된다.

```typescript
export async function buildContextNode(
  state: WritingState,
): Promise<Partial<WritingState>> {
  // contextMessages만 업데이트, 나머지 필드는 그대로
  return { contextMessages };
}
```

**Phase 1에서 Phase 2로 확장 전략**

Phase 1의 `generateContent` 노드는 `variants[0]`에 단일 결과를 저장.
Phase 2에서는 이 노드를 `generateVariants` 노드로 교체하면 되며, 이후 노드들(`qualityEvaluator`, `loreConsistencyChecker`)은 항상 `state.variants`를 참조하므로 인터페이스 변경 없음.

```
Phase 1: generateContent → variants[0] 저장
Phase 2: generateVariants (fan-out) → variants[0,1,2] 저장
이후 노드들: 변경 없음 (variants 배열을 그대로 처리)
```

#### 🔧 해결한 문제

**LangGraph Annotation 타입 오류**

**에러 메시지:**

```
error TS2345: Argument of type '{ default: () => Project; }' is not assignable
  to parameter of type 'SingleReducer<Project, Project>'.
  Property 'value' is missing in type '{ default: () => Project; }'
```

**원인:**

`Annotation<T>({ default: () => ... })`처럼 `reducer` 없이 `default`만 넘기면 `SingleReducer<T>` 3개의 유니온 타입(`{reducer:...}`, `{value:...}`, `null`) 중 어디에도 해당하지 않아 타입 오류 발생.

**해결:**

```typescript
// ❌ Before
project: Annotation<Project>({ default: () => ({} as Project) }),

// ✅ After
const overwrite = <T>(_: T, next: T) => next;

project: Annotation<Project>({
  reducer: overwrite<Project>,
  default: () => ({} as Project),
}),
```

**writingGraph.invoke() 입력 타입 오류**

**에러 메시지:**

```
error TS2322: Type 'Project' is not assignable to type
  'ValueType | OverwriteValue<Project> | undefined'.
  'ValueType' could be instantiated with an arbitrary type which could be unrelated to 'Project'.
```

**원인:**

`state.ts`의 `Annotation` 정의가 잘못되어 있어 그래프 내부의 타입 추론이 실패한 것. `reducer`를 추가하여 `BaseChannel<T, OverwriteValue<T> | T>` 타입이 올바르게 추론되면 `invoke` 입력 타입도 `OverwriteValue<T> | T`로 정확히 결정됨.

**해결:** 위 Annotation 타입 오류 수정으로 함께 해결됨.

#### 📌 내일 할 일

- [ ] **Phase 2 시작**: 병렬 변형 생성 노드 구현
  - `nodes/generateVariants.ts` 작성 (fan-out 패턴)
  - VARIANT_CONFIGS 정의 (`A-정석형 0.6`, `B-균형형 0.8`, `C-창의형 1.0`)
  - `Promise.allSettled()`로 3개 동시 호출, 부분 실패 격리
  - `qualityFeedback` 상태를 재시도 시 피드백 메시지로 주입하는 로직
- [ ] **Phase 3 준비**: 2단계 API 엔드포인트 설계
  - `POST /writing/:id/write/variants` — 변형 생성
  - `POST /writing/:id/write/select` — 선택 확정 + DB 저장
  - `variantSessionStore.ts` 인메모리 세션 저장소
- [ ] `graph.ts`에서 `generateContent` → `generateVariants` 노드로 교체

#### 🚨 이슈/질문

- [주의] `Annotation<T>()` (no args) 패턴은 `default`가 없어서 invoke 시 항상 해당 필드를 제공해야 함. Phase 1에서는 `reducer + default` 패턴으로 통일.
- [TODO] 스트리밍 엔드포인트(`/write/stream`)는 여전히 `aiService.ts`의 `generateNextParagraphStream`을 사용. Phase 3에서 LangGraph 스트림 모드와 SSE 브릿지 레이어 작성 필요.
- [고려] Phase 2 fan-out에서 3개 LLM 호출이 병렬로 실행되므로 OpenAI API 비용이 3배. 개발/테스트 시 temperature 차이만 두고 단일 호출로 모킹 가능.

#### 📊 진행률

LangGraph 마이그레이션: ███░░░░░░░ 30% (Phase 1 완료)

- ✅ Phase 0: 환경 설정 (`@langchain/langgraph`, `@langchain/openai` 이미 설치됨)
- ✅ Phase 1: 기초 그래프 (기존 API 1:1 재현)
- ⬜ Phase 2: **병렬 변형 생성 (D)** ← 다음 목표
- ⬜ Phase 3: API 재설계 (2단계 엔드포인트)
- ⬜ Phase 4: 품질 반복 루프 (A)
- ⬜ Phase 5: 로어북 일관성 검증 (B)
- ⬜ Phase 6: 기본 품질 필터
- ⬜ Phase 7: 프론트엔드 변형 선택 UI

Week 13: ██░░░░░░░░ 20% (Day 1/7)  
전체: ████████████ 92%+ (Week 13/14)

---
