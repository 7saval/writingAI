### 📅 2026-03-05 (Day 28)

#### 🎯 오늘의 목표

- [x] 글쓰기 애니메이션
- [x] 커스텀 alert나 confirm창 구현
- [x] 에디터 레이아웃 가독성 있게 구현

#### ✅ 완료한 작업

- ✅ 글쓰기 애니메이션
- ✅ 에디터 레이아웃 하단 스크롤 고정 및 입력 영역 위치 하단 고정
- ✅ 커스텀 alert, confirm 창 구현

#### 🔧 해결한 문제

**단락 생성 시 스크롤 자동 하단 고정 (채팅 UX)**

- **문제**: 새 단락이 추가되면 목록이 늘어나지만 스크롤이 그대로 머물러, 최신 단락을 보려면 사용자가 직접 내려야 했음
- **원인**: 단락 목록 컨테이너가 `overflow-y-auto`로 스크롤이 가능하지만, 새 콘텐츠가 추가될 때 자동으로 스크롤 위치를 갱신하는 로직이 없었음
- **해결**: `useRef`로 스크롤 컨테이너 DOM을 직접 참조하고, `useEffect`로 `paragraphs` 상태가 변경될 때마다 `scrollTop = scrollHeight`를 실행해 항상 최하단으로 이동하도록 구현

```tsx
const scrollContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }
}, [paragraphs]);

// JSX
<div ref={scrollContainerRef} className="flex-1 overflow-y-auto ...">
```

- **`useState`가 아닌 `useRef`를 쓴 이유**: 스크롤 컨테이너 DOM에 직접 접근해서 `scrollTop`을 조작해야 했기 때문. React 상태(`useState`)는 UI 렌더링 데이터를 다루는 반면, DOM 노드 자체를 참조하거나 조작할 때는 `useRef`가 적합. 또한 `useRef`는 값이 바뀌어도 리렌더링을 발생시키지 않아 성능상 이점도 있음 단락 생성 시 스크롤바 하단 고정

**글쓰기 UX 개선: 자연스러운 채팅형 인터페이스와 생동감 부여**

- 🎯 **요구사항 파악 (What & Why)**
  - 글쓰기 서비스의 특성상 사용자가 입력 후 서버로부터 AI의 결과가 오기까지 일정 대기 시간 존재.
  - 이 대기 시간 동안 화면에 아무 피드백이 없으면 사용자 경험(UX)이 단절되고 답답함을 느낌.
  - 단순 텍스트 표시가 아닌 "챗봇이 내 이야기에 이어서 살을 붙여준다"는 **참여형 서비스 경험**을 주고 싶었음.

- 🤔 **문제 정의와 접근법 (Problem Solving)**
  - 기존: 입력 후 '로딩 중' 텍스트만 띄우거나 빙글빙글 도는 스피너(spinner)만 띄워 지루한 대기 시간 발생.
  - 접근법 1: 내가 쓴 글이라도 화면에 바로(즉시) 렌더링되게 하자 **(낙관적 업데이트 / Optimistic UI)**
  - 접근법 2: AI가 생각 중이라는 것을 직관적으로 보여주자 **(로딩 스켈레톤 / Bouncing Dots)**
  - 접근법 3: AI가 작성한 글자들을 한 번에 보여주지 말고, 진짜 타자를 치는 듯하게 만들자 **(타이핑 애니메이션)**

- 💡 **기술적 도입 및 의사결정 (How)**

  **1. 낙관적 업데이트(Optimistic Update) 구현**
  - 원리: 서버와의 통신 성공을 낙관(Optimistic)하여, 사용자의 입력을 일단 상태 배열(`paragraphs`)에 선반영해 렌더링.
  - 구현: `handleSubmit` 시점에 `Date.now()`의 음수 값을 사용하여 고유한 '임시 ID'를 생성. 이를 기준으로 유저 단락과 빈 AI 단락을 즉시 생성해 화면에 그림. 이후 비동기 API 통신 응답 객체 데이터로 상태를 치환(Replace).
  - 에러 롤백 처리: 만약 네트워크 에러 등으로 통신에 실패하면 선반영되었던 상태 내부의 임시 ID 객체를 제거하여 롤백(Rollback)하는 예외 로직을 추가함.

  **2. 타입과 상태의 분리: UI 메타데이터 추가**
  - 프론트엔드에서 데이터를 그릴 때 로딩 상태인지 타이핑 중인 상태인지 알기 위해 `isTyping`, `isLoading` 같은 일회성 UI 상태를 `Paragraph` 타입(또는 상태 관리 객체)에 추가 확장함.

  **3. `useEffect`와 `setInterval`을 이용한 타이핑 시스템**
  - 방식: AI의 전체 응답 문자열을 상태(`displayedContent`)에 저장하되, 쪼개서 보여줌.
  - 최적화: `useEffect` 내부에서 `setInterval` 타이머를 30ms 등 일정 간격마다 호출, `substring`이나 `slice`로 한 글자씩 잘라서 화면 상태에 업데이트. 완료되면 `clearInterval`로 메모리 누수 방지(Cleanup).
  - 이슈 제어: 기존에 이미 저장되어 불러온 단락들까지 다시 타이핑되는 어색함을 방지하기 위해 단락 생성 직후에만 `isTyping: true`를 세팅해 신규 텍스트에 한정하여 렌더링하도록 강제함.

  이 과정을 통해 전송 버튼을 누르는 즉시 나의 글이 표시되고, AI가 통통 튀며 글을 고민한 뒤 답변을 한 글자씩 써내려가는 듯한 생동감 있는 몰입형 채팅 UX를 완성할 수 있었음.

**커스텀 alert, confirm 창 구현**

- **문제**: 기존 프로젝트에서는 브라우저 기본 `window.alert`와 `window.confirm`을 곳곳에서 사용 중이었음. 브라우저 기본 창은 디자인 커스터마이징이 극히 제한적이라 서비스의 전체적인 UI 일관성을 크게 해치는 원인이 됨.
- **접근법**: 디자인 일관성을 위해 Shadcn UI의 `AlertDialog` 컴포넌트를 기반으로 커스텀 `ShowAlert`, `ShowConfirm` 컴포넌트를 직접 구현함.
- **Zustand를 이용한 전역 스토어 구축 이유**:
  1. **명령형 호출 (Promise 기반)**: React의 기본적인 선언형 방식(각 컴포넌트마다 상태를 선언하고 `isOpen`, `onClose` 등을 props로 전달)을 모달에 사용하면, 함수나 API 호출 중간에 동기식으로 흐름을 제어하기 매우 까다로움(예: `if (!confirm("...")) return;`). 기존 코드가 대부분 분기 처리로 구성되어 있었기 때문에, 언제 어디서든 상태 변경 복잡성 없이 `await showConfirm("...")` 형태로 모달 띄우고 사용자의 동작을 기다릴 수 있는 **명령형(Imperative)** 호출 방식이 필요했음.
  2. **어디서든 띄울 수 있는 전역 상태**: 커스텀 모달 컴포넌트는 화면 최상단 쪽에 한 번만 마운트해두고, 앱 내부의 어느 컴포넌트나 일반 유틸리티 함수(API 레이어 등) 공간에서도 자유롭게 호출되어야 함. 상태와 액션 함수를 외부로 간단히 빼서 쓰기 쉬운 **Zustand**를 전역 스토어로 채택함.
- **구현 방식**:
  - `useDialogStore` 내부에 `alertState`와 `confirmState` 객체를 정의. 열림 여부(`isOpen`), 텍스트 내용(`description`, `title`), 버튼 동작 시 Promise를 해결(resolve)시킬 콜백 함수(`onConfirm`, `onCancel`)를 관리함.
  - 외부로 노출할 액션인 `showAlert`, `showConfirm` 메서드를 정의. 이 메서드가 호출되면 **새로운 Promise를 반환**하며 동시에 모달 상태의 `isOpen`을 `true`로 셋업하고 파라미터 텍스트를 구성함.
  - 사용자가 확인 또는 취소를 누르면, 스토어에 심어둔 `onConfirm`, `onCancel` 콜백이 실행되면서 프로미스의 `resolve(true)`, `resolve(false)` 등을 반환하고 모달창을 닫도록 구현함. 이를 통해 기존 `alert/confirm` 로직을 별다른 상태 변수 추적 없이 비동기 제어로 완벽히 커버함.

#### 🚨 이슈/트러블슈팅/질문

#### 📌 디벨롭 사항

- [x] 글쓰기 애니메이션
- [x] 커스텀 alert나 confirm창 구현
- [ ] 리액트 쿼리 사용
- [ ] 태그한 키워드에 대해서만 AI 학습 범위 주도록 구현
- [ ] 사용자정의 프롬프트 구현
- [x] 사용자 인증 시스템 구현
- [ ] 백엔드 에러 핸들링 개선
- [ ] 작성 글 내보내기
- [x] 배포하기
- [ ] 크롬 익스텐션 / 일렉트론 앱
- [ ] 모바일 반응형 및 웹 앱 적용
- [ ] 다크테마

#### 💡 개념 정리

**`useRef`란?**

`useRef`는 React에서 제공하는 훅으로, 두 가지 주요 용도로 사용된다.

1. **DOM 노드 직접 참조**: JSX 요소에 `ref={someRef}` 속성을 붙이면, `someRef.current`로 해당 실제 DOM 요소에 접근할 수 있다.
   스크롤 위치 제어, input 포커스, 캔버스 조작 등 React 렌더링 사이클 밖에서 DOM을 직접 조작해야 할 때 사용한다.

2. **리렌더링 없이 값 유지**: `useRef`가 반환하는 객체 (`{ current: ... }`)는 컴포넌트가 리렌더링되어도 초기화되지 않는다.
   또한 `current` 값을 바꿔도 리렌더링이 발생하지 않으므로, UI에 반영될 필요 없는 값(타이머 ID, 이전 값 추적 등)을 저장할 때 적합하다.

**`useRef` vs `useState` 비교**

|                     | `useState`         | `useRef`                     |
| ------------------- | ------------------ | ---------------------------- |
| 값 변경 시 리렌더링 | ✅ 발생            | ❌ 발생 안 함                |
| 주요 용도           | UI에 표시되는 상태 | DOM 접근 / 렌더링 외 값 유지 |
| 초기화 시점         | 리렌더링마다 유지  | 리렌더링마다 유지            |

**이번 사례 요약**: `paragraphs` 배열은 화면에 렌더링되어야 하므로 `useState` 사용. 스크롤 컨테이너 DOM은 화면에 표시할 데이터가 아니라 직접 조작 대상이므로 `useRef` 사용.

---

**`scrollTop` / `scrollHeight` 란?**

스크롤 가능한 DOM 요소가 가지는 읽기/쓰기 가능한 속성들이다.

| 속성           | 타입      | 설명                                                        |
| -------------- | --------- | ----------------------------------------------------------- |
| `scrollHeight` | 읽기 전용 | 요소의 **전체 콘텐츠 높이** (스크롤로 숨겨진 영역 포함)     |
| `scrollTop`    | 읽기/쓰기 | 요소가 **현재 얼마나 스크롤됐는지** (위쪽에서 잘린 픽셀 수) |
| `clientHeight` | 읽기 전용 | 요소의 **눈에 보이는 높이** (패딩 포함, 스크롤바 제외)      |

```
┌──────────────┐  ← scrollTop: 0 (맨 위)
│  보이는 영역  │
│  clientHeight│
└──────────────┘
│  숨겨진 영역  │
│              │
└──────────────┘  ← scrollHeight (전체 높이)
```

**스크롤을 맨 아래로 이동시키는 원리**

```ts
element.scrollTop = element.scrollHeight;
```

- `scrollTop`을 `scrollHeight`와 같게 설정하면, "전체 콘텐츠 높이만큼 위에서 스크롤된 상태" = 맨 아래가 된다.
- 내용이 추가될 때마다 `scrollHeight`가 증가하므로, 새 단락이 생길 때마다 이 구문을 실행하면 항상 최신 단락이 보인다.

---

**setInterval과 clearInterval 개념 정리**

1. **`setInterval(callback, delay)`**
   - **`callback`**: 주기마다 실행할 **함수**입니다. (예: 한 글자씩 화면에 붙이는 로직)
   - **`delay`**: 실행 간격인 **밀리초(ms)** 단위의 시간입니다. (1000ms = 1초)
   - **반환값**: 실행 중인 타이머를 식별할 수 있는 고유한 **ID(숫자)**를 반환합니다. 이 ID는 나중에 중단할 때 필요합니다.

2. **`clearInterval(id)`**
   - **`id`**: 작업을 중단할 `setInterval`이 반환했던 **ID**를 인자로 받습니다.
   - 이 함수를 호출하면 해당 ID의 반복 실행이 즉시 멈춥니다.

**💡 사용 예시 (타이핑 애니메이션)**

```javascript
// 30ms마다 execution 함수를 반복 실행하고, 반환된 ID를 변수에 저장
const timerId = setInterval(() => {
  console.log("글자를 추가합니다.");
}, 30);

// 더 이상 반복할 필요가 없으면(예: 글자가 다 써졌을 때) 중단
clearInterval(timerId);
```

- **주의사항**: `setInterval`을 멈추지 않으면 컴포넌트가 화면에서 사라져도 브라우저 메모리 어딘가에서 계속 실행되어 성능 저하(메모리 누수)를 일으킬 수 있습니다. 특히 React에서는 `useEffect`의 **Cleanup 함수**(`return () => clearInterval(id)`)에서 반드시 정리해주는 것이 중요합니다.

#### 📝 피드백 내용

- 글쓰기 애니메이션 ✅
  - 스트림 형식 / 잘라서 눈속임

- database.ts
  - 타입 형식 : 카멜 - 스네이크 맞추기

- ai 생성 시 스크롤 맨 밑으로 이동하도록 구현 ✅

#### 📊 진행률

Week 7: ████████████░░ 92%

---

### 📅 2026-03-06 (Day 29)

#### 🎯 오늘의 목표

- [x] 리액트 쿼리 사용
- [x] 태그한 키워드에 대해서만 AI 학습 범위 주도록 구현
- [ ] 사용자정의 프롬프트 구현
- [ ] 작성 글 내보내기
- [ ] 크롬 익스텐션 / 일렉트론 앱
- [ ] 모바일 반응형 및 웹 앱 적용
- [ ] 다크테마

#### ✅ 완료한 작업

- ✅ 모든 API에 React Query 커스텀 훅 적용 (도메인별 파일로 통합)
- ✅ 컴포넌트 전체에서 API 직접 호출 제거, 훅 사용으로 전환
- ✅ 타이핑 애니메이션 공통 훅(`useTypingAnimation`) 추출 및 AI 재생성에도 적용
- ✅ 태그한 키워드에 대해서만 AI 학습 범위 주도록 구현 (토큰 최적화)
- ✅ 설정집 저장 시 모달 자동 닫기 로직 구현

#### 🔧 해결한 문제

**React Query 커스텀 훅 도입 및 코드베이스 마이그레이션**

- 🎯 **문제 정의**: 프로젝트 각 페이지와 컴포넌트에서 API 함수를 직접 `import`해 `useState` + `try/catch`로 직접 호출하는 방식이었음. 로딩 상태, 에러 처리, 캐시 무효화 등 반복되는 패턴이 분산되어 있어 유지보수가 어려웠음.

- � **해결 방향**: 모든 API를 React Query 기반의 커스텀 훅으로 래핑(wrapping)하고, 도메인별로 파일을 분리하여 관심사 분리(Separation of Concerns)를 강화.

- 🏗 **네이밍 규칙 의사결정**
  - 조회(GET): `use[Domain]Query` (예: `useProjectsQuery`)
  - 변경(POST/PUT/DELETE): `use[Action][Domain]Mutation` (예: `useCreateProjectMutation`)
  - `fetch` vs `get` 접두사 논쟁 중 `Query` 접미사를 붙이는 규칙을 선택한 이유: React Query 자체가 내부적으로 캐시를 관리하여 네트워크 요청뿐 아니라 캐시 데이터도 반환하기 때문에, 단순 네트워크 요청임을 암시하는 `fetch`보다 "데이터를 조회한다"는 의도가 명확한 `Query` 접미사가 더 적합하다고 판단.

- 📁 **도메인별 파일 구조**

  ```
  hooks/
  ├── useAuth.ts         ← 인증 관련 (기존 파일 3개 → 1개로 통합)
  ├── useProjects.ts     ← 프로젝트 CRUD
  ├── useParagraphs.ts   ← 단락 CRUD + AI 재생성
  └── useWriting.ts      ← AI 글쓰기(단락 작성)
  ```

  기존에 `useAuthMutations.ts`, `useAuthQuery.ts`, `useAuth.ts`로 흩어져 있던 인증 훅을 `useAuth.ts` 하나로 통합하고, 나머지 도메인도 동일한 방식으로 정리.

- ✅ **캐시 무효화(invalidateQueries)**: Mutation 성공 시 관련된 Query 캐시를 자동으로 무효화. 예를 들어 프로젝트 삭제(Mutation) 성공 시 `projects list` 캐시가 무효화되어 목록이 자동으로 리패치됨. 기존에는 삭제 후 수동으로 `fetchProjects()`를 다시 호출해야 했음.

---

**타이핑 애니메이션 공통 훅 분리 (`useTypingAnimation`)**

- 🎯 **문제 정의**: AI 최초 작성 시에는 타이핑 애니메이션이 적용되었지만, 🔄 AI 재생성 시에는 결과가 즉시 교체(Replace)되어 애니메이션이 없었음. 기존 애니메이션 로직은 `ParagraphItem` 컴포넌트 내부에 `useState` + `useEffect`로 인라인(inline)으로 작성되어 있었음.

- 🤔 **접근 방법 비교**
  - **방법 1 (내부 직접 제어)**: `handleRegenerate`에서 응답을 받은 뒤 바로 `setIsTyping(true)`를 호출. 수정 범위가 2~3줄로 최소화되지만, 기존 초기 작성과 재생성이 다른 방식으로 트리거되어 코드 중복과 불일치가 생김.
  - **방법 2 (공통 훅 분리)**: 타이핑 애니메이션 로직을 `useTypingAnimation` 훅으로 추출. 재사용성과 유지보수성이 높아지지만 초기 리팩토링 비용이 있음.
  - **선택**: 방법 2. 현재는 사용처가 하나지만, 애니메이션 속도 변경이나 다른 컴포넌트 재사용 시 수정 포인트가 하나가 되어 장기적으로 유리.

- 💡 **훅 설계 포인트**
  - `playTyping(newContent)` 함수를 외부로 노출해, 새 텍스트로 타이핑 애니메이션을 언제든지 트리거할 수 있게 설계.
  - `speed` 파라미터로 타이핑 속도를 런타임에 주입 가능 (기본 30ms/글자).
  - `useEffect` 클린업 함수(`return () => clearInterval`)로 컴포넌트 언마운트 시 메모리 누수 방지.

  ```ts
  // 훅 사용 예시
  const { displayedContent, isTyping, playTyping } = useTypingAnimation(
    paragraph.content,
    paragraph.isTyping || false, // 마운트 시 즉시 시작 여부
  );

  // AI 재생성 완료 시
  const res = await regenerateAiParagraphAsync({ paragraphId: paragraph.id });
  playTyping(res.content); // ← 이 한 줄로 타이핑 애니메이션 트리거
  ```

- 📁 **훅 vs 유틸 폴더 결정**: `useTypingAnimation`은 내부적으로 `useState`와 `useEffect`를 사용하는 React 훅이므로 `hooks/` 폴더에 배치. `utils/`는 React에 의존하지 않는 순수 자바스크립트 함수 전용.

---

**태그한 키워드에 대해서만 AI 학습 범위 주도록 구현**

- [상황]: AI는 프롬프트에 포함된 모든 텍스트를 읽고 토큰을 소모합니다. 설정집(Lorebook)에 100개의 설정이 있어도 현재 장면에 필요한 건 1~2개뿐일 때가 많은데, 전체 설정을 다 보내면 **토큰 낭비**가 심하고 AI가 엉뚱한 설정을 섞어 쓰는 **노이즈 문제**가 발생했습니다.
- [진행]:
  1. **태그 기반의 매칭 시스템 설계**: 설정집의 각 항목에 '태그'를 달 수 있게 하고, 이 태그가 본문에 언급되었을 때만 AI에게 전달하도록 로직을 설계했습니다.
  2. **컨텍스트 분석 로직 구현 (Backend)**: 시놉시스, 배경 설정, 그리고 지금까지 쓴 단락들을 모두 합쳐 하나의 '거대한 텍스트'로 만듭니다. 이 텍스트 안에 설정집 태그가 포함되어 있는지 `includes()`로 검사합니다.
  3. **동적 프롬프트 생성**: 매칭된 태그가 있는 설정들만 필터링하여 `[Lorebook]` 섹션에 채워 넣습니다.
- [성과]:
  - **토큰 경제성 확보**: 설정집이 아무리 커져도 현재 장면에 필요한 만큼만 토큰을 사용하므로 비용을 획기적으로 줄였습니다.
  - **맥락 집중도 향상**: AI에게 "지금은 이 설정들만 참고해"라고 명확히 가이드를 주는 셈이라, 캐릭터 붕괴나 설정 오류 확률이 줄어들었습니다.

```ts
// [예시 코드] Backend의 aiService.ts 로직
// 본문 전체 텍스트 수집 (시놉시스 + 배경 + 최근 단락)
const fullContent = `${project.synopsis || ""} ${project.description || ""} ${paragraphs.map((p) => p.content).join(" ")}`;

// 설정집에 등록된 모든 태그 추출
const allTags = Array.from(
  new Set(notes.flatMap((note) => note.tags || [])),
) as string[];

// 본문에 언급된 태그만 쏙쏙 골라내기
const mentionedTags = allTags.filter((tag) => fullContent.includes(tag));

// 필터링된 태그가 있을 때만 해당 항목들을 프롬프트에 포함
context += `[Lorebook]\n${formatLore(notes, mentionedTags.length > 0 ? mentionedTags : undefined)}\n\n`;
```

---

**설정집 저장 시 모달 자동 닫기 (UX 개선)**

- [상황]: 설정집을 수정하고 '저장' 버튼을 누르면 알림창(`showAlert`)만 뜨고 모달은 그대로 남아있어, 사용자가 매번 '취소'나 'X'를 눌러 닫아야 하는 번거로움이 있었습니다.
- [진행]: `useLorebook` 훅에 `onSuccess` 콜백 아규먼트를 추가하고, 저장이 성공적으로 완료된 시점에 이 콜백을 실행하도록 수정했습니다.
- [성과]: 저장 완료 시 자동으로 모달이 닫히게 되어 훨씬 매끄러운 사용이 가능해졌습니다.

#### 🚨 이슈/트러블슈팅/질문

-

#### 📌 디벨롭 사항

- [x] 리액트 쿼리 사용
- [x] 태그한 키워드에 대해서만 AI 학습 범위 주도록 구현
- [x] 설정집 저장 시 모달 자동 닫기 (UX 개선)
- [ ] 사용자정의 프롬프트 구현
- [ ] 백엔드 에러 핸들링 개선
- [ ] 작성 글 내보내기
- [ ] 크롬 익스텐션 / 일렉트론 앱
- [ ] 모바일 반응형 및 웹 앱 적용
- [ ] 다크테마

#### 💡 개념 정리

**`utils/` vs `hooks/` 폴더, 무엇이 다른가?**

| 구분         | `hooks/`                                   | `utils/`                        |
| ------------ | ------------------------------------------ | ------------------------------- |
| 역할         | React 훅 (`useState`, `useEffect` 등 사용) | 순수 JS/TS 함수                 |
| 접두사       | `use` 필수 (React 훅 컨벤션)               | 자유                            |
| React 의존성 | 있음                                       | 없음                            |
| 예시         | `useTypingAnimation`, `useDebounce`        | `formatDate`, `cn`, `calcPrice` |

**React Query의 캐시 무효화(`invalidateQueries`)란?**

React Query는 서버에서 가져온 데이터를 내부 캐시에 저장(캐싱)한다. Mutation(데이터 변경)이 성공했을 때, 관련 Query의 캐시를 "오래됨(stale)" 처리하면 다음 번에 해당 데이터를 조회할 때 서버에서 새로 불러온다. `invalidateQueries`가 바로 그 역할이다.

```ts
onSuccess: () => {
  // 'projects list' 캐시를 무효화 → 자동으로 목록 리패치
  queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
};
```

기존에는 삭제 API 호출 후 수동으로 `fetchProjects()`를 다시 호출했지만, Mutation의 `onSuccess`에 `invalidateQueries`를 걸어두면 React Query가 자동으로 처리해준다.

**커스텀 훅의 단일 책임 원칙**

하나의 커스텀 훅은 하나의 관심사(역할)만 담당하도록 설계하는 것이 좋다. 이번에 `useTypingAnimation`을 분리한 이유가 바로 이것이다. 타이핑 애니메이션 "실행"과 그 결과를 "표시"하는 관심사를 `ParagraphItem`에서 분리함으로써, 훅은 재사용이 가능하고 컴포넌트는 더 단순해졌다.

#### 📝 피드백 내용

- database.ts
  - 타입 형식 : 카멜 - 스네이크 맞추기

#### 📊 진행률

Week 7: ██████████████ 97%

---
