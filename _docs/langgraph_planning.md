# LangGraph 마이그레이션 기획서

> 포트폴리오 목적의 WritingAI → LangGraph 전환 계획
>
> **구현 기능 목록**
> - **D. 병렬 변형 생성** ← 핵심 (중점 기능)
> - **A. 품질 반복 루프** ← 필수
> - **B. 로어북 일관성 검증** ← 필수
> - E. 멀티 에이전트 협업 ← 선택

---

## 1. 현재 아키텍처 분석

### 1-1. 현재 AI 흐름

```
사용자 단락 제출
      ↓
buildContext()       ← 시놉시스 + 로어북 + 최근 10개 단락 조합
      ↓
prepareFinalMessages()  ← 시스템 프롬프트(장르별) + 컨텍스트 메시지
      ↓
openai.chat.completions.create()  ← GPT-4o-mini 단일 호출
      ↓
DB 저장 → 응답 반환
```

**핵심 특징:**
- `backend/src/services/aiService.ts` 단일 파일(235줄)에 모든 AI 로직 집중
- 단일 스텝, 무상태(stateless), 직선형 파이프라인
- 분기 없음, 반복 없음, 상태 관리 없음

### 1-2. 현재 구조의 한계

| 한계 | 구체적 문제 |
|------|------------|
| 품질 검증 없음 | 생성된 단락 품질에 관계없이 무조건 저장 |
| 단일 결과만 제공 | 사용자가 AI 제안 중 선택할 수 없음 |
| 로어북 일관성 미검증 | 설정집과 충돌하는 내용이 그대로 출력될 수 있음 |
| 컨텍스트 고정 | 단락이 많아질수록 앞 내용이 잘려 장편 소설 불가 |
| 재시도 로직 없음 | API 오류나 품질 미달 시 단순 실패 처리 |

---

## 2. LangGraph 마이그레이션 타당성 분석

### 2-1. LangGraph란?

LangGraph는 LLM 워크플로우를 **상태 머신(State Machine)** 형태의 방향성 그래프(DAG + 사이클 허용)로 정의하는 프레임워크입니다.

- **노드(Node)**: 각 처리 단계 (컨텍스트 빌드, LLM 호출, 검증 등)
- **엣지(Edge)**: 노드 간 데이터 흐름
- **조건부 엣지(Conditional Edge)**: 결과에 따라 분기하는 로직
- **사이클(Cycle)**: 조건 충족 시까지 반복 실행 — 품질 루프의 핵심
- **상태(State)**: 그래프 전체에서 공유되는 데이터 구조

### 2-2. 도입 타당성 판단

**현재 기능만 유지 → 도입 불필요**
> 단순한 단일 LLM 호출에 LangGraph를 추가하면 복잡도만 증가합니다.

**기능 확장 목적 → 도입 매우 적합**
> LangGraph는 병렬 처리, 조건부 분기, **반복 루프**가 등장하는 순간 가치가 폭발적으로 올라갑니다. 이번에 추가하는 4가지 기능이 정확히 이 경우입니다.
>
> - **D. 병렬 변형 생성**: 3개의 LLM 호출을 동시에 실행하는 fan-out 패턴이 필요합니다. `Promise.all`로 흉내 낼 수 있지만, 각 변형의 상태 추적, 부분 실패 격리, 이후 검증 노드와의 연결을 그래프 구조 없이 깔끔하게 표현하기 어렵습니다.
> - **A. 품질 반복 루프**: 생성 → 평가 → 조건부 재생성의 **사이클(Cycle)** 이 필요합니다. 이는 일반 DAG로는 표현 불가능한 구조로, LangGraph가 사이클을 허용하는 그래프를 지원하기 때문에 자연스럽게 모델링됩니다.
> - **B. 로어북 일관성 검증**: 변형 생성 이후 LLM 기반 검증 노드를 독립적으로 붙이는 구조가 필요합니다. 기존 직선형 파이프라인에서는 이 단계를 추가할 명확한 위치가 없지만, 그래프에서는 엣지 하나로 연결됩니다.
> - **E. 멀티 에이전트 협업**: 작가 에이전트와 편집 에이전트가 서로 다른 역할로 메시지를 주고받는 구조가 필요합니다. 각 에이전트를 독립 노드로 정의하고 상태를 통해 대화를 이어가는 방식은 LangGraph의 설계 철학과 정확히 일치합니다.

**포트폴리오 목적 → 도입 강력 권장**
> LangGraph는 2024-2025년 기준 AI 앱 개발의 핵심 기술 스택입니다. 이를 실제 프로덕트에 적용한 경험은 강력한 차별화 포인트가 됩니다.

### 2-3. 도입 비용 및 위험

| 항목 | 내용 | 대응 방안 |
|------|------|---------|
| JS 생태계 성숙도 | Python 대비 문서/커뮤니티 얕음 | `@langchain/langgraph` 공식 문서 + Python 문서 병행 참조 |
| 스트리밍 통합 | 현재 직접 SSE 구현과 충돌 가능 | LangGraph 스트림 모드와 Express SSE 브릿지 레이어 작성 |
| 의존성 증가 | `@langchain/langgraph`, `@langchain/openai` 등 추가 | 기존 `openai` SDK와 병행 사용 가능, 점진적 교체 |
| 디버깅 복잡도 | 그래프 흐름 파악이 어려울 수 있음 | LangSmith 무료 티어 연동 권장 |

---

## 3. 구현 기능 상세

### D. 병렬 변형 생성 (Parallel Variant Generation) ← 핵심

사용자가 단락을 작성하면 AI가 **동시에 3개의 변형 단락**을 생성하고, 사용자가 마음에 드는 버전을 선택합니다.

```
컨텍스트 빌드 완료
   ┌──────┼──────┐
   ↓      ↓      ↓      ← 병렬(동시) 실행
변형 A  변형 B  변형 C
(0.6)  (0.8)  (1.0)
   └──────┼──────┘
          ↓
   사용자 선택지 제시
```

| 변형 | Temperature | 특성 |
|------|-------------|------|
| **A - 정석형** | 0.6 | 문맥에 충실, 예측 가능한 전개 |
| **B - 균형형** | 0.8 | 창의성과 일관성의 균형 (기본값) |
| **C - 창의형** | 1.0 | 예상치 못한 반전, 독창적 표현 |

---

### A. 품질 반복 루프 (Quality Retry Loop)

각 변형에 대해 LLM 기반 품질 평가를 수행하고, 기준 미달 시 피드백과 함께 **재생성**합니다. LangGraph의 사이클(Cycle) 기능을 직접적으로 활용하는 핵심 패턴입니다.

```
변형 생성
     ↓
[qualityEvaluator]  ← LLM이 0-10점으로 품질 평가
     ├─ 점수 ≥ 7: 통과 → 다음 단계
     └─ 점수 < 7: 실패 → 피드백 메시지 추가 후 재생성 (최대 2회)
```

**평가 기준:**
- 이전 문맥과의 자연스러운 연결성
- 장르 톤 일치 여부
- 최소 길이 및 완성도

---

### B. 로어북 일관성 검증 (Lore Consistency Check)

생성된 단락이 프로젝트의 설정집(로어북)과 충돌하는지 LLM이 검증합니다.

```
품질 통과 변형들
     ↓
[loreConsistencyChecker]  ← 로어북 + 생성 단락을 LLM에 제출
     ├─ 일관성 OK: 통과
     └─ 충돌 감지: 충돌 항목 표시 + 해당 변형에 경고 라벨 부착
```

**검증 방식:** 충돌 시 해당 변형을 제거하는 것이 아니라 **경고 라벨**을 붙여 사용자가 인지하고 선택할 수 있도록 합니다. (사용자 에이전시 유지)

---

### E. 멀티 에이전트 협업 (선택)

독립적인 역할을 가진 두 에이전트가 협업하여 단락 품질을 높입니다.

```
[작가 에이전트]  ← 창의적 단락 초안 생성
      ↓
[편집 에이전트]  ← 문체 교정, 일관성 피드백 제공
      ↓
[작가 에이전트]  ← 피드백 반영해 최종본 생성
      ↓
    최종 단락
```

두 에이전트는 서로 다른 시스템 프롬프트와 역할을 가지며, LangGraph의 멀티노드 구조로 자연스럽게 표현됩니다.

---

## 4. 전체 목표 아키텍처

```
사용자 단락 제출
      ↓
[checkContextLength]
      ├─ 20개 이하 → [buildContext]
      └─ 20개 초과 → [summarizeContext] → [buildContext]
      ↓
[buildContext]  ← 시놉시스 + 로어북(태그 필터) + 최근 단락
      ↓
┌─────────────────────────────────────┐
│  [generateVariants]  ← D. 핵심      │
│    ├─ [generateVariantA] (temp=0.6) │
│    ├─ [generateVariantB] (temp=0.8) │
│    └─ [generateVariantC] (temp=1.0) │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│  [qualityEvaluator]  ← A. 품질 루프     │
│    ├─ 통과: 다음 단계                   │
│    └─ 실패: 피드백 추가 → 해당 변형 재생성 (≤2회) │
└─────────────────────────────────────────┘
      ↓
[basicQualityFilter]  ← 규칙 기반 필터 (길이, 언어 등)
      ↓
┌──────────────────────────────────────────────┐
│  [loreConsistencyChecker]  ← B. 로어북 검증  │
│    ├─ OK: 정상 라벨                          │
│    └─ 충돌: 경고 라벨 부착 (제거 아님)       │
└──────────────────────────────────────────────┘
      ↓
[presentToUser]  ← 선택지를 클라이언트에 반환
      ↓
[사용자 선택 대기]  ← 별도 API 엔드포인트
      ↓
[saveSelectedParagraph]  ← 선택된 변형만 DB 저장
      ↓
응답 완료

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (선택 기능) ─ ─ ─

E. 멀티 에이전트 옵션 적용 시 [generateVariants] 내부가 아래로 교체:

│  [writerAgent]  ← 초안 생성
│       ↓
│  [editorAgent]  ← 문체 교정 + 피드백
│       ↓
│  [writerAgent]  ← 피드백 반영 최종본
```

---

## 5. 단계별 구현 계획

### Phase 0: 환경 설정 (1-2일)

**설치**
```bash
cd backend
npm install @langchain/langgraph @langchain/openai @langchain/core
```

**LangSmith 설정 (디버깅용, 권장)**
```env
# backend/.env에 추가
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_PROJECT=writingai-langgraph
```

**디렉토리 구조**
```
backend/src/
├── services/
│   ├── aiService.ts                    ← 기존 유지 (fallback)
│   ├── variantSessionStore.ts          ← 신규: 임시 세션 저장
│   └── langgraph/                      ← 신규 추가
│       ├── state.ts                    ← WritingState 타입 정의
│       ├── nodes/
│       │   ├── buildContext.ts
│       │   ├── generateVariants.ts     ← D. 핵심 노드
│       │   ├── qualityEvaluator.ts     ← A. 품질 평가 + 재시도 로직
│       │   ├── basicQualityFilter.ts   ← 규칙 기반 필터
│       │   ├── loreConsistencyChecker.ts ← B. 로어북 검증
│       │   ├── saveParagraph.ts
│       │   └── multiAgent/             ← E. 선택
│       │       ├── writerAgent.ts
│       │       └── editorAgent.ts
│       ├── graph.ts                    ← 그래프 조립
│       └── index.ts                    ← export
```

---

### Phase 1: 상태 정의 및 기초 그래프 (3-4일)

**목표**: 기존 `aiService.ts` 동작을 LangGraph로 1:1 재현 (기능 변화 없음)

**`state.ts` - 공유 상태 타입**
```typescript
import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Project } from "../../entity/Projects";
import { Paragraph } from "../../entity/Paragraphs";

export const WritingStateAnnotation = Annotation.Root({
  // 입력
  project: Annotation<Project>,
  paragraphs: Annotation<Paragraph[]>,
  userInput: Annotation<string>,
  customPrompt: Annotation<string | undefined>,

  // 컨텍스트 빌드 결과
  contextMessages: Annotation<BaseMessage[]>,

  // D. 변형 생성 결과
  variants: Annotation<VariantResult[]>,
  selectedVariant: Annotation<VariantResult | undefined>,

  // A. 품질 루프 제어
  retryCount: Annotation<Record<string, number>>,  // variantId → 재시도 횟수
  qualityFeedback: Annotation<Record<string, string>>, // variantId → 피드백 메시지

  // B. 로어북 검증 결과
  loreWarnings: Annotation<Record<string, string>>, // variantId → 경고 메시지

  // 메타
  temperature: Annotation<number>,
  maxTokens: Annotation<number>,
  error: Annotation<string | undefined>,
});

export interface VariantResult {
  id: string;           // "A" | "B" | "C"
  content: string;
  temperature: number;
  label: string;        // "정석형" | "균형형" | "창의형"
  qualityScore?: number;
  loreWarning?: string;
}

export type WritingState = typeof WritingStateAnnotation.State;
```

**`nodes/buildContext.ts`**
```typescript
import { WritingState } from "../state";
import { buildContext } from "../../aiService"; // 기존 함수 재사용

export async function buildContextNode(state: WritingState): Promise<Partial<WritingState>> {
  const messages = await buildContext(state.project, state.paragraphs);
  return { contextMessages: messages };
}
```

**체크포인트**: Phase 1 완료 시 기존 API와 동일하게 동작 확인

---

### Phase 2: 병렬 변형 생성 노드 (4-5일) ← 핵심 D

**목표**: LangGraph의 병렬 실행(fan-out)으로 3개 변형 동시 생성

**`nodes/generateVariants.ts`**
```typescript
import { ChatOpenAI } from "@langchain/openai";
import { WritingState, VariantResult } from "../state";

const VARIANT_CONFIGS = [
  { id: "A", temperature: 0.6, label: "정석형" },
  { id: "B", temperature: 0.8, label: "균형형" },
  { id: "C", temperature: 1.0, label: "창의형" },
];

async function generateSingleVariant(
  state: WritingState,
  config: typeof VARIANT_CONFIGS[number],
  feedbackMessage?: string
): Promise<VariantResult> {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: config.temperature,
    maxTokens: state.maxTokens ?? 500,
  });

  // A. 품질 루프에서 넘어온 피드백이 있으면 메시지에 추가
  const messages = feedbackMessage
    ? [...state.contextMessages, { role: "user", content: `이전 생성 피드백: ${feedbackMessage}\n위 피드백을 반영해 다시 작성해 주세요.` }]
    : state.contextMessages;

  const response = await model.invoke(messages);

  return {
    id: config.id,
    content: response.content as string,
    temperature: config.temperature,
    label: config.label,
  };
}

export async function generateVariantsNode(
  state: WritingState
): Promise<Partial<WritingState>> {
  const results = await Promise.allSettled(
    VARIANT_CONFIGS.map((config) =>
      generateSingleVariant(
        state,
        config,
        state.qualityFeedback?.[config.id] // 재시도 시 피드백 주입
      )
    )
  );

  const successfulVariants = results
    .filter((r): r is PromiseFulfilledResult<VariantResult> => r.status === "fulfilled")
    .map((r) => r.value);

  if (successfulVariants.length === 0) {
    return { error: "모든 변형 생성에 실패했습니다." };
  }

  return { variants: successfulVariants };
}
```

---

### Phase 3: API 엔드포인트 재설계 (3-4일)

변형 생성은 기존의 단일 응답 API 구조를 바꿉니다. **2단계 API**로 분리합니다.

**신규 API 흐름**
```
POST /writing/:id/write/variants   ← 변형 생성 요청
      ↓ { variants: [...], sessionId }

POST /writing/:id/write/select     ← 사용자 선택 확정
      ↓ { variantId, sessionId }
      ↓ DB 저장 + 응답
```

**임시 세션 저장 전략**

| 방법 | 장점 | 단점 |
|------|------|------|
| **인메모리 Map** | 구현 단순, 의존성 없음 | 서버 재시작 시 소멸 |
| **Redis** | 빠름, TTL 설정, 다중 인스턴스 지원 | 별도 인프라 필요 |
| **LangGraph Checkpointer** | 그래프 상태 자동 영속화 | 설정 복잡도 있음 |

> 포트폴리오 단계: **인메모리 Map + TTL 만료**로 시작

```typescript
// backend/src/services/variantSessionStore.ts
interface VariantSession {
  variants: VariantResult[];
  projectId: number;
  userParagraphContent: string;
  expiresAt: number;
}

const sessionStore = new Map<string, VariantSession>();
const SESSION_TTL_MS = 5 * 60 * 1000; // 5분

export function saveVariantSession(sessionId: string, data: Omit<VariantSession, "expiresAt">) {
  sessionStore.set(sessionId, { ...data, expiresAt: Date.now() + SESSION_TTL_MS });
}

export function getVariantSession(sessionId: string): VariantSession | undefined {
  const session = sessionStore.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    sessionStore.delete(sessionId);
    return undefined;
  }
  return session;
}
```

---

### Phase 4: 품질 반복 루프 (3-4일) ← A

**목표**: LangGraph의 사이클(Cycle)을 활용해 품질 미달 변형을 자동 재생성

LangGraph가 단순 DAG와 다른 핵심 이유가 바로 이 사이클 지원입니다.

**`nodes/qualityEvaluator.ts`**
```typescript
import { ChatOpenAI } from "@langchain/openai";
import { WritingState, VariantResult } from "../state";

const QUALITY_THRESHOLD = 7;
const MAX_RETRY = 2;

interface QualityResult {
  variantId: string;
  score: number;
  feedback: string;
  passed: boolean;
}

async function evaluateSingleVariant(
  variant: VariantResult,
  contextSummary: string,
  genre: string
): Promise<QualityResult> {
  const evaluator = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const prompt = `다음 소설 단락을 0-10점으로 평가해 주세요.

장르: ${genre}
이전 문맥 요약: ${contextSummary}

평가할 단락:
${variant.content}

평가 기준:
1. 이전 문맥과의 자연스러운 연결성
2. 장르 톤 일치 여부
3. 완성도 및 문장 품질

JSON 형식으로만 응답: {"score": 숫자, "feedback": "개선 방향"}`;

  const response = await evaluator.invoke([{ role: "user", content: prompt }]);
  const result = JSON.parse(response.content as string);

  return {
    variantId: variant.id,
    score: result.score,
    feedback: result.feedback,
    passed: result.score >= QUALITY_THRESHOLD,
  };
}

export async function qualityEvaluatorNode(
  state: WritingState
): Promise<Partial<WritingState>> {
  const contextSummary = state.paragraphs.slice(-3).map((p) => p.content).join(" ");
  const genre = state.project.genre;

  const evaluations = await Promise.all(
    state.variants.map((v) => evaluateSingleVariant(v, contextSummary, genre))
  );

  const updatedVariants = state.variants.map((v) => {
    const evaluation = evaluations.find((e) => e.variantId === v.id)!;
    return { ...v, qualityScore: evaluation.score };
  });

  // 실패한 변형에 대해 피드백 저장 (재시도 시 generateVariantsNode에서 활용)
  const newFeedback: Record<string, string> = { ...state.qualityFeedback };
  const newRetryCount: Record<string, number> = { ...state.retryCount };

  for (const evaluation of evaluations) {
    if (!evaluation.passed) {
      newFeedback[evaluation.variantId] = evaluation.feedback;
      newRetryCount[evaluation.variantId] = (newRetryCount[evaluation.variantId] ?? 0) + 1;
    }
  }

  return {
    variants: updatedVariants,
    qualityFeedback: newFeedback,
    retryCount: newRetryCount,
  };
}

// 그래프에서 사용하는 조건부 엣지 함수
export function shouldRetryGeneration(state: WritingState): "retry" | "proceed" {
  const failedVariants = state.variants.filter(
    (v) => (v.qualityScore ?? 0) < QUALITY_THRESHOLD
  );

  // 실패한 변형이 있고, 재시도 횟수가 MAX_RETRY 미만이면 재시도
  const canRetry = failedVariants.some(
    (v) => (state.retryCount?.[v.id] ?? 0) < MAX_RETRY
  );

  return failedVariants.length > 0 && canRetry ? "retry" : "proceed";
}
```

**`graph.ts` - 사이클 포함 그래프**
```typescript
import { StateGraph } from "@langchain/langgraph";
import { WritingStateAnnotation } from "./state";
import { qualityEvaluatorNode, shouldRetryGeneration } from "./nodes/qualityEvaluator";

const graph = new StateGraph(WritingStateAnnotation)
  .addNode("buildContext", buildContextNode)
  .addNode("generateVariants", generateVariantsNode)
  .addNode("qualityEvaluator", qualityEvaluatorNode)
  .addNode("basicQualityFilter", basicQualityFilterNode)
  .addNode("loreConsistencyChecker", loreConsistencyCheckerNode)
  .addEdge("__start__", "buildContext")
  .addEdge("buildContext", "generateVariants")
  .addEdge("generateVariants", "qualityEvaluator")
  // ↓ 핵심: 사이클 - 품질 미달 시 재생성으로 돌아감
  .addConditionalEdges("qualityEvaluator", shouldRetryGeneration, {
    retry: "generateVariants",   // ← 사이클 형성
    proceed: "basicQualityFilter",
  })
  .addEdge("basicQualityFilter", "loreConsistencyChecker")
  .addEdge("loreConsistencyChecker", "__end__");
```

---

### Phase 5: 로어북 일관성 검증 (2-3일) ← B

**목표**: 로어북과 충돌하는 변형에 경고를 부착해 사용자가 인지하고 선택 가능하게 함

**`nodes/loreConsistencyChecker.ts`**
```typescript
import { ChatOpenAI } from "@langchain/openai";
import { WritingState } from "../state";
import { LoreNote } from "../../entity/Projects";

async function checkSingleVariant(
  variantContent: string,
  loreNotes: LoreNote[]
): Promise<string | null> {
  // 로어북이 없으면 검증 생략
  const relevantNotes = loreNotes.filter((n) => n.includeInPrompt);
  if (relevantNotes.length === 0) return null;

  const checker = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const loreText = relevantNotes
    .map((n) => `[${n.category}] ${n.title}: ${n.content}`)
    .join("\n");

  const prompt = `다음 소설 단락이 설정집과 충돌하는 내용이 있는지 확인해 주세요.

설정집:
${loreText}

작성된 단락:
${variantContent}

충돌이 없으면 "없음"만 응답하고, 충돌이 있으면 구체적인 충돌 내용을 한 문장으로 설명해 주세요.`;

  const response = await checker.invoke([{ role: "user", content: prompt }]);
  const result = (response.content as string).trim();

  return result === "없음" ? null : result;
}

export async function loreConsistencyCheckerNode(
  state: WritingState
): Promise<Partial<WritingState>> {
  const loreNotes = state.project.lorebook ?? [];

  const checkResults = await Promise.all(
    state.variants.map(async (variant) => {
      const warning = await checkSingleVariant(variant.content, loreNotes);
      return { id: variant.id, warning };
    })
  );

  const newLoreWarnings: Record<string, string> = {};
  const updatedVariants = state.variants.map((variant) => {
    const result = checkResults.find((r) => r.id === variant.id)!;
    if (result.warning) {
      newLoreWarnings[variant.id] = result.warning;
      return { ...variant, loreWarning: result.warning };
    }
    return variant;
  });

  return {
    variants: updatedVariants,
    loreWarnings: newLoreWarnings,
  };
}
```

---

### Phase 6: 기본 품질 필터 (1-2일)

규칙 기반(rule-based) 필터로 LLM 호출 없이 명백한 불량 결과를 걸러냅니다.

**`nodes/basicQualityFilter.ts`**
```typescript
import { WritingState, VariantResult } from "../state";

function isValidVariant(variant: VariantResult): boolean {
  const content = variant.content.trim();
  if (content.length < 50) return false;
  if (content === "" || content === "undefined") return false;

  // 한국어 비율 체크 (30% 미만이면 필터)
  const koreanChars = (content.match(/[가-힣]/g) || []).length;
  const totalChars = content.replace(/\s/g, "").length;
  if (totalChars > 0 && koreanChars / totalChars < 0.3) return false;

  return true;
}

export async function basicQualityFilterNode(
  state: WritingState
): Promise<Partial<WritingState>> {
  const validVariants = state.variants.filter(isValidVariant);
  if (validVariants.length === 0) {
    return { error: "생성된 변형이 품질 기준을 통과하지 못했습니다." };
  }
  return { variants: validVariants };
}
```

---

### Phase 7: 프론트엔드 - 변형 선택 UI (4-5일)

**컴포넌트 구조**
```
WritingSession
└── VariantSelector (신규)
    ├── VariantCard × N
    │   ├── 변형 라벨 (정석형/균형형/창의형)
    │   ├── 품질 점수 배지 (선택 표시)
    │   ├── 로어북 경고 배너 (있을 시)
    │   ├── 단락 미리보기
    │   └── 선택 버튼
    └── 로딩 상태 (스켈레톤 카드 × 3)
```

**`VariantSelector.tsx` 핵심 구조**
```tsx
interface VariantSelectorProps {
  variants: VariantResult[];
  onSelect: (variantId: string) => void;
  isLoading: boolean;
}

export function VariantSelector({ variants, onSelect, isLoading }: VariantSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => <VariantCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        AI가 {variants.length}가지 버전을 작성했습니다. 마음에 드는 버전을 선택해 주세요.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {variants.map((variant) => (
          <VariantCard key={variant.id} variant={variant} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function VariantCard({ variant, onSelect }: { variant: VariantResult; onSelect: (id: string) => void }) {
  return (
    <div className="rounded-lg border p-4 space-y-3 hover:border-primary transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{variant.label}</span>
        {variant.qualityScore && (
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
            품질 {variant.qualityScore}/10
          </span>
        )}
      </div>
      {variant.loreWarning && (
        <div className="text-xs text-amber-600 bg-amber-50 rounded p-2">
          ⚠ 설정 주의: {variant.loreWarning}
        </div>
      )}
      <p className="text-sm leading-relaxed line-clamp-4">{variant.content}</p>
      <button
        onClick={() => onSelect(variant.id)}
        className="w-full text-sm py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        이 버전 선택
      </button>
    </div>
  );
}
```

---

### Phase 8: 컨텍스트 요약 노드 (선택, 2일)

단락이 20개를 초과하면 자동으로 앞부분을 요약해 컨텍스트 길이를 제어합니다.

```typescript
.addConditionalEdges("__start__", (state) => {
  return state.paragraphs.length > 20 ? "summarizeContext" : "buildContext";
});
```

---

### Phase 9: 멀티 에이전트 협업 (선택, 3-4일) ← E

**목표**: 작가 에이전트와 편집 에이전트가 협업해 변형 품질을 향상

Phase 4(품질 루프)의 "재생성" 전략을 고도화합니다. 단순 재생성 대신, 편집 에이전트의 피드백을 반영한 개선 루프를 형성합니다.

**`nodes/multiAgent/writerAgent.ts`**
```typescript
export async function writerAgentNode(state: WritingState): Promise<Partial<WritingState>> {
  const writer = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.8,
    systemMessage: `당신은 창의적인 소설 작가입니다. 
    주어진 맥락을 바탕으로 감성적이고 생동감 있는 단락을 작성합니다.`,
  });
  // ... 단락 생성 로직
}
```

**`nodes/multiAgent/editorAgent.ts`**
```typescript
export async function editorAgentNode(state: WritingState): Promise<Partial<WritingState>> {
  const editor = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    systemMessage: `당신은 꼼꼼한 문학 편집자입니다.
    제출된 단락의 문체, 흐름, 설정 일관성을 검토하고 구체적인 개선 방향을 제시합니다.`,
  });
  // ... 피드백 생성 로직
}
```

**그래프 연결 (선택 기능 활성화 시)**
```typescript
.addNode("writerAgent", writerAgentNode)
.addNode("editorAgent", editorAgentNode)
.addEdge("buildContext", "writerAgent")
.addEdge("writerAgent", "editorAgent")
.addConditionalEdges("editorAgent", shouldRevise, {
  revise: "writerAgent",   // 수정 필요 시 사이클
  done: "basicQualityFilter",
})
```

---

## 6. 전체 일정

| Phase | 내용 | 기간 | 구분 |
|-------|------|------|------|
| Phase 0 | 환경 설정, 디렉토리 구조 | 1-2일 | 필수 |
| Phase 1 | 기초 그래프 (기존 기능 이식) | 3-4일 | 필수 |
| Phase 2 | **병렬 변형 생성 노드 (D)** | 4-5일 | **핵심** |
| Phase 3 | API 재설계 (2단계 엔드포인트) | 3-4일 | 필수 |
| Phase 4 | **품질 반복 루프 (A)** | 3-4일 | 필수 |
| Phase 5 | **로어북 일관성 검증 (B)** | 2-3일 | 필수 |
| Phase 6 | 기본 품질 필터 (규칙 기반) | 1-2일 | 필수 |
| Phase 7 | 프론트엔드 변형 선택 UI | 4-5일 | 필수 |
| Phase 8 | 컨텍스트 요약 노드 | 2일 | 선택 |
| Phase 9 | **멀티 에이전트 협업 (E)** | 3-4일 | 선택 |
| **필수 합계** | Phase 0-7 | **21-29일** | |
| **전체 합계** | Phase 0-9 | **26-35일** | |

---

## 7. 포트폴리오 관점에서의 어필 포인트

### 7-1. 기술적 차별화

| 기술 패턴 | 적용 위치 | 어필 내용 |
|-----------|-----------|---------|
| **LangGraph fan-out** | Phase 2 (D) | 병렬 LLM 호출을 그래프 구조로 관리, 오류 격리 명확 |
| **LangGraph cycle** | Phase 4 (A) | 단순 루프가 아닌 상태 기반 조건부 반복, 무한루프 방지 포함 |
| **LLM-as-Judge 패턴** | Phase 4 (A) | LLM이 LLM 결과를 평가하는 self-evaluation 구조 |
| **Structured Output** | Phase 5 (B) | LLM 응답을 JSON으로 파싱하는 신뢰성 있는 출력 처리 |
| **Multi-agent** | Phase 9 (E) | 역할 분리된 에이전트 협업, 각 에이전트의 책임 명확화 |
| **LangSmith** | 전체 | 프로덕션 수준 AI 워크플로우 관측성(Observability) 구현 |

### 7-2. 제품적 차별화

- 단순 AI 자동 완성이 아닌 **사용자 에이전시(선택권)** 를 강조한 UX
- 품질 보장 루프 → "AI가 자체 검토한 결과만 제공"이라는 신뢰성 어필
- 로어북 경고 라벨 → "설정 충돌을 알면서도 선택할 수 있는" 작가 중심 UX
- 장르별 프롬프트 × 3가지 Temperature → 실질적으로 **9가지 톤의 글쓰기 스타일** 제공

### 7-3. 확장 가능성 어필

그래프 노드 추가만으로 다음 기능 확장이 가능함을 강조:

```
현재 그래프 + [독자 반응 예측 노드]   → 독자 흥미도 예측 기능
현재 그래프 + [번역 에이전트 노드]     → 다국어 소설 지원
현재 그래프 + [플롯 제안 노드]         → 다음 이야기 전개 방향 추천
```

---

## 8. 관련 문서

- [기존 기획서](./planning.md)
- [상세 구현 가이드](./planning_detail.md)
- [API 명세서](./api_specification.md)
- [보안 감사](./SECURITY_AUDIT.md)
