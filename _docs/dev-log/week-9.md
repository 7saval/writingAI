### 📟 2026-04-04 (Day 31)

#### 🎯 오늘의 목표

- [x] 프로젝트별 paragraph 문서 내보내기 방향 설계
- [x] Word/PDF export 가이드 문서 작성 및 범위 확정
- [x] `Editor`에서 내보내기 UI 연결
- [x] 웹 Word export 1차 구현
- [ ] 웹 PDF 실제 생성 구현
- [ ] Electron 저장 흐름 구현

#### ✅ 완료한 작업

- [x] 프로젝트 문서 export 요구사항을 정리하고 `_docs/export_guide.md` 작성
  - 프로젝트 문서에는 제목만 포함
  - `ai`/`user` 작성자 라벨은 내보내기 다이얼로그에서 옵션으로 선택
  - 웹 / Electron 구현 방향을 분리해서 설계
- [x] `frontend/src/features/export/` 구조 추가
  - `types.ts`
  - `utils/buildExportDocument.ts`
  - `utils/sanitizeFilename.ts`
  - `web/exportWord.ts`
  - `web/exportPdf.ts`
  - `components/ExportDialog.tsx`
- [x] 공통 export 데이터 모델 정의
  - `ExportFormat`
  - `ExportParagraph`
  - `ExportDocumentModel`
  - `ExportDialogValue`
- [x] export 문서 변환 로직 구현
  - 로컬 상태 `paragraphs` 기준으로 export
  - `orderIndex` 정렬
  - 빈 문단 제거
  - `isLoading` 임시 AI 문단 제거
  - 파일명 safe title 처리
- [x] `Editor.tsx`에 내보내기 UI 연결
  - 프로젝트 제목 조회를 위해 `useProjectDetailQuery` 연결
  - 상단 내보내기 버튼 추가
  - `ExportDialog` 연결
  - 포맷 선택 및 작성자 라벨 옵션 상태 반영
- [x] 웹 Word export 1차 구현
  - `docx` 패키지 설치
  - 프로젝트 제목 + 문단 본문 기반 `.docx` 생성
  - 작성자 라벨 옵션이 켜지면 `AI` / `USER` 라벨 포함
  - 브라우저 다운로드 트리거 연결
- [x] 웹 PDF export 구현
  - `html2pdf.js` 기반 웹 PDF export 1차 구현
  - 대상 파일: `frontend/src/features/export/web/exportPdf.ts`
  - `ExportDialog`에서 PDF 포맷 선택 시 호출
  - 프로젝트 제목 + 문단 본문 기반 PDF 생성
  - 작성자 라벨 옵션이 켜지면 `AI` / `USER` 라벨 포함
  - 브라우저 다운로드 트리거 연결

#### 🧩 해결한 문제

**문제 1: export 기능 범위가 모호해서 구현 전에 정책이 흔들릴 수 있었음**

- **상황**: 프로젝트 제목 외에 장르, 설명, 작성자 라벨, PDF 저장 방식까지 한 번에 섞여 있어 구현 경계가 불명확했음.
- **해결**:
  - `_docs/export_guide.md`에 범위를 먼저 고정
  - "제목만 포함"을 확정
  - 작성자 라벨은 다이얼로그 옵션으로 분리
  - 웹 Word를 1차 목표, PDF/Electron은 후속 단계로 분리
- **결과**: 구현 우선순위가 선명해져서 과도한 확장 없이 바로 개발 가능해짐.

#### 🧠 배운 점

**1. export 기능은 "문서 생성"과 "저장 방식"을 분리하는 게 좋다**

- 문서 본문을 만드는 공통 레이어와
- 웹 다운로드 / Electron 저장을 분리하면
- 이후 PDF나 Electron 확장 시 재사용성이 높아진다.

**2. 구현 전에 정책을 문서로 잠그는 게 개발 속도를 올린다**

- 제목만 포함할지
- 작성자 라벨을 기본값으로 넣을지
- PDF를 바로 할지

이런 부분을 미리 정하면 UI와 데이터 모델이 흔들리지 않는다.

**3. 브라우저 export는 Word부터 붙이는 게 안정적이다**

- Word는 `docx` 기반으로 구조화된 문서를 만들기 쉬움
- PDF는 품질, 페이지 분할, 폰트 대응 등 고려할 점이 많아 후순위로 두는 게 현실적

#### 개념정리

**1. `docx` 라이브러리 설치 이유**

- 브라우저 환경에서 `.docx` 파일을 직접 생성할 수 있게 해주는 라이브러리다.
- Word 문서를 단순 텍스트가 아니라 문단, 정렬, 글자 스타일 같은 구조를 가진 문서로 만들 수 있다.
- 이번 export 기능에서는 프로젝트 제목, 문단 본문, 작성자 라벨 옵션을 Word 문서 형식으로 내보내기 위해 사용했다.

설치 명령:

```bash
cmd /c npm install docx --prefix frontend
```

**2. `docx` import 모듈 역할**

- 참고링크 : [docx라이브러리](https://www.npmjs.com/package/docx)

```ts
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph as DocxParagraph,
  TextRun,
} from "docx";
```

- `Document`
  - Word 파일 전체를 나타내는 최상위 문서 객체다.
  - 제목, 본문 문단, 섹션 구성을 모두 이 객체 안에 담는다.
- `Paragraph as DocxParagraph`
  - Word 문서의 한 문단 블록을 만든다.
  - 프로젝트 제목 한 줄, 본문 문단 한 덩어리 같은 단위를 표현할 때 사용한다.
  - 기존 프로젝트의 `Paragraph` 타입과 이름이 겹치므로 `DocxParagraph`로 alias를 주었다.
- `TextRun`
  - 문단 안에서 실제 텍스트 조각을 만든다.
  - 굵게, 기울임, 글자 크기 같은 텍스트 스타일을 적용할 수 있다.
  - 예를 들어 제목 텍스트, `AI` / `USER` 라벨, 문단 본문을 각각 `TextRun`으로 구성할 수 있다.
- `AlignmentType`
  - 문단 정렬 방식을 지정할 때 사용한다.
  - 제목을 가운데 정렬하거나 본문은 기본 정렬로 두는 식으로 활용한다.
- `Packer`
  - `Document` 객체를 실제 다운로드 가능한 `.docx` 바이너리 또는 Blob으로 변환한다.
  - 브라우저 다운로드를 트리거하려면 최종적으로 이 단계가 필요하다.

**3. 현재 `exportWord.ts`에서의 역할 정리**

- `Document`: export할 Word 파일 전체 뼈대 생성
- `DocxParagraph`: 제목 문단, 날짜 문단, 본문 문단 생성
- `TextRun`: 제목 텍스트, 작성자 라벨, 문단 본문 작성
- `AlignmentType`: 제목 중앙 정렬
- `Packer`: 완성된 문서를 Blob으로 변환해 다운로드 가능하게 처리

**4. Blob이란 무엇인가**

- `Blob`은 브라우저에서 다루는 파일 형태의 바이너리 데이터 덩어리다.
- 아직 로컬 디스크에 저장된 파일은 아니지만, 브라우저 안에서는 파일처럼 취급할 수 있다.
- 이미지, PDF, Word 문서, 텍스트 파일 같은 데이터를 다운로드 가능한 형태로 만들 때 자주 사용한다.

이번 export 흐름에서는:

1. `Document`로 Word 문서 구조를 만든다.
2. `Packer.toBlob(doc)`으로 `.docx` 파일 데이터를 `Blob`으로 변환한다.
3. 이 `Blob`을 브라우저 다운로드 링크에 연결해서 실제 파일 다운로드를 시작한다.

즉, `Blob`은 "브라우저 메모리 안에 있는 파일 데이터"라고 이해하면 된다.

**5. `URL.createObjectURL(blob)`는 왜 필요한가**

- `Blob`은 파일 데이터 자체이지만, 이 데이터만으로는 `<a href="...">` 같은 다운로드 링크에 바로 연결할 수 없다.
- `URL.createObjectURL(blob)`은 브라우저 메모리에 있는 `Blob` 데이터에 접근할 수 있는 임시 URL을 만들어준다.
- 이 임시 URL을 `a.href`에 넣으면 브라우저가 해당 `Blob`을 파일처럼 다운로드할 수 있다.

현재 export 흐름에서는:

1. `Packer.toBlob(doc)`으로 Word 파일 데이터를 만든다.
2. `URL.createObjectURL(blob)`으로 임시 URL을 만든다.
3. `a.href = objectUrl`로 링크에 연결한다.
4. `a.click()`으로 다운로드를 시작한다.
5. 작업이 끝나면 `URL.revokeObjectURL(objectUrl)`로 메모리를 정리한다.

즉, `createObjectURL()`은 "브라우저 메모리 속 파일 데이터에 접근할 수 있는 임시 주소를 만들어주는 함수"다.

#### 📝 코드/구조 메모

**Export 타입**

```ts
export type ExportFormat = "word" | "pdf";

export interface ExportDocumentModel {
  projectId: number;
  projectTitle: string;
  exportedAt: string;
  includeAuthorLabel: boolean;
  paragraphs: ExportParagraph[];
}
```

**문서 변환 레이어 핵심**

```ts
const normalizedParagraphs = [...paragraphs]
  .filter((paragraph) => !paragraph.isLoading)
  .filter((paragraph) => paragraph.content.trim().length > 0)
  .sort((a, b) => a.orderIndex - b.orderIndex);
```

**Editor 연결 포인트**

- `useProjectDetailQuery`로 프로젝트 제목 조회
- `ExportDialog`에서 포맷 / 작성자 라벨 선택
- `handleExport()`에서 `buildExportDocument()` 호출 후 포맷별 분기

#### 📊 진행률

Week 9: █████░░░░░ 50%
전체: ███████░░░ 70%

---

#### 📄 PDF export 구현

- [x] `html2pdf.js` 기반 웹 PDF export 1차 구현
  - 대상 파일: `frontend/src/features/export/web/exportPdf.ts`
  - 입력 데이터는 `buildExportDocument()`가 만든 `ExportDocumentModel`을 그대로 재사용
  - 프로젝트 제목, export 날짜, 문단 목록, 작성자 라벨 옵션을 PDF용 HTML 컨테이너로 구성
  - PDF 저장 시 파일명 규칙은 공통 유틸을 통해 `{projectTitle}-{YYYY-MM-DD}.pdf` 형식으로 맞춤

- [x] PDF 라이브러리 로딩 최적화
  - 초기에는 `html2pdf.js`를 정적 import로 연결했지만 메인 번들 크기가 너무 커짐
  - 이후 `exportPdfDocument()` 내부에서 동적 import로 전환해 PDF 기능 사용 시점에만 라이브러리를 로드하도록 변경

- [x] PDF 렌더링 안정화 시도
  - 첫 구현에서는 PDF 컨테이너를 화면 밖으로 크게 밀어둔 상태에서 캡처했는데, 내용이 비어 보이는 문제가 발생
  - 이후 숨김 방식을 여러 차례 조정했고, 최종적으로는 숨김용 래퍼(`mountNode`)를 따로 만들고 실제 PDF 타깃 컨테이너는 정상 레이아웃 상태로 렌더링한 뒤 캡처하도록 변경
  - `document.fonts.ready`와 `requestAnimationFrame` 대기를 추가해 폰트와 레이아웃이 잡힌 뒤 PDF를 생성하도록 보완

#### 🧩 PDF export 트러블슈팅

**문제 2: `html2pdf.js`로 생성한 PDF가 처음에는 비어 있거나 내용이 보이지 않는 문제가 있었다**

- **상황**:
  - PDF export 기능은 정상 실행되지만, 결과 PDF에서 제목과 문단 텍스트가 보이지 않거나 빈 페이지처럼 출력되는 경우가 있었다.
  - 특히 PDF용 DOM을 `left: -99999px`처럼 멀리 보낸 상태에서 캡처할 때 문제가 두드러졌다.
- **해결**:
  - PDF 컨테이너 자체를 숨기지 않고, 바깥 래퍼만 화면 밖으로 이동시키는 구조로 변경했다.
  - 캡처 대상은 정상적인 크기와 레이아웃을 가진 컨테이너로 유지했다.
  - 폰트 로딩과 브라우저 렌더 타이밍을 기다린 뒤 `html2pdf()`를 실행하도록 순서를 보완했다.
- **결과**:
  - PDF 내용이 정상적으로 보이기 시작했다.
  - 다만 페이지 분할 품질은 여전히 `html2pdf.js`와 `html2canvas` 렌더링 특성에 영향을 받는 상태다.

**문제 3: 페이지가 남아 있어도 다음 문단이 통째로 다음 페이지로 넘어가거나, 반대로 문단이 어색하게 잘리는 문제가 있었다**

- **상황**:
  - `break-inside: avoid`를 줄 때는 짧은 문단도 페이지 끝에서 통째로 다음 페이지로 밀리는 경우가 생겼다.
  - 이를 제거하면 이번에는 문단 중간이 너무 어색하게 잘리는 문제가 나타났다.
- **해석**:
  - `html2pdf.js`는 HTML을 캔버스 이미지처럼 렌더링한 뒤 PDF에 넣는 구조라, 문서 편집기 수준의 정교한 문단 분할 제어에는 한계가 있다.
  - 즉, CSS만으로 어느 정도 조정은 가능하지만 페이지 분할 품질을 완전히 원하는 수준으로 맞추기 어렵다.
- **현재 판단**:
  - 1차 구현으로는 `html2pdf.js` 방식이 빠르게 기능을 붙이기에는 적합했다.
  - 하지만 문단이 많은 문서나 페이지 품질을 중요하게 보는 사용성에서는 한계가 분명히 드러났다.

#### 📘 개념 정리

- 참고링크 : [html2pdf.js](https://www.npmjs.com/package/html2pdf.js)

**왜 `html2pdf.js`를 선택했는가**

- 브라우저에서 바로 동작하고 구현 속도가 빠르다.
- 기존 HTML/CSS 감각으로 문서 레이아웃을 구성할 수 있다.
- 프로젝트 제목, 날짜, 문단 텍스트 정도의 단순 문서에는 1차 구현용으로 접근성이 좋다.

**`html2pdf.js` 방식의 한계**

- 내부적으로 `html2canvas` 기반 렌더링을 사용하므로 페이지 분할이 문서 편집기처럼 정교하지 않다.
- CSS 조정으로 어느 정도 보완할 수 있지만, 문단 중간 잘림이나 애매한 페이지 넘김을 완전히 제어하기 어렵다.
- 즉, "빠르게 붙이기 좋은 방식"이지만 "문단 중심 문서 품질"을 높이는 데는 구조적 한계가 있다.

#### 📦 번들 최적화 추가 진행

- [x] PDF export 라이브러리 `html2pdf.js`를 정적 import에서 동적 import로 전환
  - 대상 파일: `frontend/src/features/export/web/exportPdf.ts`
  - 변경 전: 앱 초기 로딩 시 메인 번들에 PDF 라이브러리가 함께 포함
  - 변경 후: 사용자가 PDF 내보내기를 실행할 때만 별도 청크를 로드

#### 🧩 트러블슈팅

**문제 4: PDF export 구현 후 빌드 경고가 남았고, 메인 번들 크기가 너무 크게 묶였다**

- **상황**:
  - `html2pdf.js`를 일반 import로 연결한 상태에서 `npm run build --prefix frontend`를 실행하면 메인 번들이 크게 증가했다.
  - Vite가 `Some chunks are larger than 500 kB after minification` 경고를 출력했다.
  - PDF 기능은 자주 쓰는 초기 화면 기능이 아닌데도 모든 사용자가 첫 로딩 시 해당 라이브러리 비용을 함께 부담하는 구조였다.
- **해결**:
  - `frontend/src/features/export/web/exportPdf.ts` 상단의 정적 import를 제거했다.
  - `exportPdfDocument()` 내부에서 `const { default: html2pdf } = await import("html2pdf.js")` 방식으로 동적 import를 적용했다.
  - 그 결과 PDF export 코드는 메인 번들에서 분리되어 별도 청크로 출력되도록 변경됐다.
- **결과**:
  - 초기 로딩 시 메인 번들에 PDF 라이브러리가 포함되지 않게 되었다.
  - PDF 내보내기를 실제로 사용할 때만 PDF 청크를 네트워크로 내려받는 구조가 되었다.
  - 빌드 경고 자체는 남아 있지만, 메인 번들 크기는 큰 폭으로 감소했다.

**빌드 결과 수치 비교**

- 변경 전
  - 메인 번들: `assets/index-5CoD4fSA.js` 약 `2,004.24 kB`
  - 별도 PDF 청크: 없음
- 변경 후
  - 메인 번들: `assets/index-BaDRfUSb.js` 약 `1,012.23 kB`
  - PDF 청크: `assets/html2pdf-BR1UAQwj.js` 약 `975.80 kB`

**수치 해석**

- 메인 번들이 약 `992.01 kB` 감소했다.
- 감소율 기준으로 보면 메인 번들 크기가 약 `49.5%` 줄었다.
- 즉, 초기 화면 진입 시점에는 PDF 기능 비용을 거의 절반 수준까지 메인 번들에서 걷어낸 셈이다.

#### 📘 개념 정리

**번들이란 무엇인가**

- 번들은 브라우저가 실제로 다운로드하고 실행하는 JavaScript 묶음 파일이다.
- 개발 중에는 코드가 여러 파일로 나뉘어 있지만, 배포 빌드에서는 번들러가 이를 몇 개의 결과 파일로 합친다.
- 이 결과 파일이 너무 크면 브라우저가 다운로드, 파싱, 실행하는 비용이 모두 증가한다.
- 그래서 자주 쓰지 않는 기능이나 무거운 라이브러리는 동적 import로 분리해서 필요할 때만 불러오는 방식이 성능상 유리하다.

**이번 작업에서 번들 분리가 의미하는 것**

- Word export는 상대적으로 가볍고 앱 흐름에 자연스럽게 포함되어 있어 기존 방식 유지가 가능했다.
- PDF export는 `html2pdf.js` 자체가 무거워서 메인 번들에 항상 포함시키기엔 부담이 컸다.
- 따라서 PDF 기능만 별도 청크로 분리해 초기 로딩 성능을 개선했다.

#### 🎨 UI/UX 추가 진행

- [x] `Editor` export UI를 북마크 기반 hover/dropdown 구조로 개편
  - `frontend/src/components/EditorHeader.tsx`를 분리해서 북마크 trigger와 dropdown button UI를 담당하게 구성
  - 상단 고정 버튼 1개만 두던 방식에서 export 진입 UX를 더 잘 드러내는 구조로 변경
- [x] dropdown에 `내보내기` 버튼 1개만 남기고, 프로젝트명 길이와 무관하게 한 줄로 보이도록 고정 너비와 `whitespace-nowrap` 적용
- [x] 특정 프로젝트에서만 다운로드 아이콘이 가려지는 현상 원인 분석
  - 스크롤 컨테이너와 UI 오버레이가 같은 레이어 축에서 겹치며, 스크롤바 유무에 따라 북마크 우측 아이콘 가시성이 달라질 수 있음을 확인
  - `scrollTop = scrollHeight`로 최신 문단까지 이동하는 프로젝트에서 문제가 더 잘 드러나는 점도 정리
- [x] 북마크를 스크롤 영역 바깥 고정 레이어로 분리해 스크롤바와 독립
  - hover가 끊기지 않도록 `pointer-events`, `group-hover`, `z-index` 경로를 다시 조정
  - 우측 정렬 기준도 고정 레이어 기준으로 재정렬
- [x] 프로젝트 이동 시 `현재 프로젝트` fallback 문구가 잠깐 보이는 문제 해결
  - `projectDetail?.title ?? ""`로 수정해 로딩 중 잘못된 기본 문구가 노출되지 않도록 처리

#### 🩹 UI/UX 해결한 문제

**문제 5: export UI는 찾기 쉬워야 하고, 동시에 hover 동작도 안정적이어야 했음**

- **상황**: 상단 고정 버튼 방식은 발견성이 약했고, hover UI로 바꾸자 아이콘 가림, 버튼 줄바꿈, hover 경로 끊김 같은 문제가 함께 발생
- **해결**:
  - 북마크 + 소형 dropdown 구조로 단순화
  - 고정 폭, 줄바꿈 방지, 스크롤바와 분리된 고정 레이어로 문제를 각각 해소
  - hover가 깨질 때는 레이아웃보다 `pointer-events` 경로를 먼저 점검
- **결과**: export UI를 "찾을 수 있고", "hover가 유지되고", "스크롤과 독립적인" 상태로 수렴시킴

#### 🧠 추가로 배운 것

**hover UI는 CSS 몇 줄 문제가 아니라, 레이어/스크롤/포인터 이벤트가 동시에 얽히는 구조 문제일 수 있다**

- `pointer-events-none` 하나만 잘못 들어가도 hover가 즉시 끊어진다
- `overflow-y-auto`로 스크롤바가 생기면 우측 정렬 UI의 체감 위치가 달라질 수 있다
- fallback 문구는 로딩 UX에서 "잠깐 보이는 잘못된 상태"만으로도 버그처럼 느껴질 수 있다

---

#### 🚀 디벨롭할 사항

- [ ] `jsPDF` 기반 PDF export 전환 검토
  - 제목, 날짜, 문단 텍스트를 PDF 좌표 기반으로 직접 배치하면 페이지 넘김 기준을 우리가 제어할 수 있다.
  - 특히 현재 문제인 문단 잘림, 애매한 공백, 페이지 분할 품질 개선에 더 적합하다.
- [ ] `jsPDF` 전환 시 한글 폰트 처리 전략 정리
  - 웹 환경에서 한글이 깨지지 않도록 폰트 임베드 또는 사용 가능한 폰트 전략을 먼저 정리해야 한다.
- [ ] `html2pdf.js` 유지 시 보완안 추가 검토
  - 짧은 문단만 보호하고 긴 문단만 분할 허용하는 혼합 전략
  - 문단 간격, 줄간격, 페이지 여백을 조정하는 출력 최적화
- [ ] Electron 저장 다이얼로그 설계 시작

- [ ] 라우트 단위 코드 스플리팅 적용 검토
  - 에디터, 프로젝트 상세, 설정 화면처럼 진입 경로가 분리되는 페이지는 route 기준으로 청크를 나누면 초기 번들을 더 줄일 수 있다.
- [ ] 다른 무거운 의존성도 동적 import 전환 검토
  - 실제 사용 시점이 늦거나 특정 기능에서만 필요한 라이브러리는 PDF와 같은 방식으로 필요 시 로드하도록 분리할 수 있다.
- [ ] 번들 분석 도구 도입 검토
  - `vite-bundle-visualizer` 또는 유사 도구로 어떤 라이브러리가 메인 번들을 키우는지 시각적으로 확인하면 다음 최적화 우선순위를 정하기 쉽다.

#### ❓ 이슈 / 질문

- PDF를 웹에서 바로 생성할지, Electron 쪽 품질을 우선할지 결정이 필요함
- 작성자 라벨 표시를 `AI` / `USER`로 유지할지 한글(`AI`, `사용자`)로 바꿀지 UX 판단이 남아 있음

#### 📊 진행률

Week 9: ███░░ 30%
전체: ███████░░░ 70%

---

### 📅 2026-04-07 (Day 32)

#### 🎯 오늘 목표

- [x] `jsPDF` 기반 PDF export 전환
- [x] Noto Sans KR 폰트 기반 한글 PDF 출력 안정화
- [x] PDF 레이아웃 상수 분리 및 주석 보강
- [x] `html2pdf.js` 제거 후 `jspdf` 직접 의존성 정리

#### ✅ 완료한 작업

- [x] 웹 PDF export 방식을 `html2pdf.js` 기반 DOM 캡처 방식에서 `jsPDF` 기반 좌표 렌더링 방식으로 전환
  - 대상 파일: `frontend/src/features/export/web/exportPdf.ts`
  - `jsPDF`를 동적 import로 불러오고 A4 세로 문서 기준으로 제목, 날짜, 작성자 라벨, 본문을 직접 배치
  - 문단을 줄 단위로 분해하고 남은 세로 공간을 계산해 페이지를 수동으로 넘기도록 구현
- [x] 한글 폰트 로더 분리
  - 대상 파일: `frontend/src/features/export/web/pdfFonts.ts`
  - `NotoSansKR-Regular.ttf`, `NotoSansKR-Bold.ttf`를 `jsPDF` VFS에 등록
  - 일반/볼드 폰트를 분리 등록해 제목과 작성자 라벨까지 한글이 깨지지 않도록 처리
- [x] PDF 레이아웃 상수 분리
  - 대상 파일: `frontend/src/features/export/constants/pdf.ts`
  - 페이지 크기, 여백, 본문 폭, 폰트 크기, 줄간격, 블록 간격을 상수로 분리
  - 이후 레이아웃 튜닝 시 `exportPdf.ts` 내부 계산식을 건드리지 않고 값만 조정할 수 있게 정리
- [x] PDF 관련 코드 주석 보강
  - `pdf.ts`에는 각 상수가 문서 레이아웃에서 무엇을 의미하는지 설명 추가
  - `exportPdf.ts`에는 다운로드, 줄 높이 계산, 줄바꿈, 페이지 분할, 텍스트 렌더링 흐름 주석 추가
  - `pdfFonts.ts`에는 폰트 캐시, 바이너리 문자열 변환, 폰트 등록 과정 주석 추가
- [x] 패키지 정리
  - `frontend/package.json`에서 `html2pdf.js` 의존성 제거
  - `jspdf`를 직접 의존성으로 설치해 실제 사용 코드와 패키지 상태를 일치시킴
- [x] 빌드 검증
  - `npm run build --prefix frontend` 실행
  - TypeScript 빌드와 Vite 프로덕션 빌드 모두 통과 확인

#### 🛠 해결한 문제

**문제 1: `html2pdf.js` 방식은 빠르게 붙이기에는 편했지만, 문단 중심 문서 레이아웃을 정교하게 제어하기 어려웠다**

- **문제상황**
  - 기존 PDF export는 HTML 컨테이너를 만들고 `html2pdf.js`가 이를 캡처해 PDF로 바꾸는 흐름이었다.
  - 이 방식은 내부적으로 `html2canvas` 렌더링에 크게 의존하므로, 문단이 페이지 끝에서 어떻게 나뉘는지 세밀하게 다루기 어려웠다.
  - 긴 문단에서 `break-inside: avoid`를 주면 통째로 다음 페이지로 넘어가고, 제거하면 중간이 어색하게 잘리는 문제가 있었다.
  - 결과적으로 “브라우저 캡처” 품질에는 가깝지만 “문서 편집기 같은 문단 제어”에는 한계가 분명했다.
- **진행**
  - PDF 생성 방식을 DOM 캡처가 아니라 좌표 기반 렌더링으로 전환하기로 결정했다.
  - `jsPDF`를 사용해 페이지 크기, 여백, 폰트 크기, 줄간격을 상수화하고, 각 문단을 줄 단위로 나눈 뒤 직접 `text()`로 배치하는 구조로 재설계했다.
  - 페이지 하단 여백을 넘기면 `addPage()`를 호출하고 새 페이지 상단부터 이어 쓰도록 구현했다.
  - 작성자 라벨 표시 여부도 문단 블록 높이 계산에 반영해 옵션이 켜진 경우와 꺼진 경우 모두 같은 흐름으로 처리했다.
- **결과**
  - PDF export가 HTML 캡처 결과에 덜 의존하고, 문서 레이아웃을 코드로 제어할 수 있는 구조가 되었다.
  - 제목, 날짜, 작성자 라벨, 본문이 모두 A4 문서형 레이아웃에 맞춰 안정적으로 출력되도록 정리됐다.
  - 긴 문단도 줄 단위로 다음 페이지에 자연스럽게 이어지게 되어 기존 `html2pdf.js` 방식보다 문단 분할 제어력이 좋아졌다.

**문제 2: `jsPDF` 전환 시 한글 폰트를 별도로 처리하지 않으면 한글 출력과 줄폭 계산이 불안정해질 수 있었다**

- **문제상황**
  - `jsPDF` 기본 폰트는 한글을 안정적으로 지원하지 않으므로, 폰트 등록 없이 바로 전환하면 글자가 깨지거나 실제 출력 폭이 예상과 달라질 위험이 있었다.
  - 특히 이번 구현은 줄바꿈과 페이지 분할을 텍스트 폭 계산에 의존하므로, 폰트가 정확히 맞지 않으면 레이아웃 계산이 함께 흔들릴 수 있었다.
- **진행**
  - 문서에 기본적인 폰트인 `Noto Sans KR`를 채택했다.
  - `frontend/src/assets/fonts/`에 `Regular`, `Bold` 폰트를 배치하고, 별도 폰트 로더에서 `fetch` 후 binary string으로 변환해 `jsPDF` VFS에 등록하는 방식으로 구현했다.
  - 같은 폰트를 여러 번 읽지 않도록 Promise 캐시도 추가했다.
- **결과**
  - 제목, 본문, 작성자 라벨 모두 한글이 깨지지 않는 PDF 출력 기반이 마련됐다.
  - 일반/볼드 폰트를 나눠 등록해 문서형 스타일을 유지하면서도 한글 표시 안정성을 확보했다.
  - 줄바꿈 계산과 실제 렌더링 결과가 같은 폰트 기준으로 맞춰져 페이지 분할 신뢰도가 올라갔다.

#### 📚 개념 정리

**1. `html2pdf.js`와 `jsPDF` 비교**

**`html2pdf.js`**

- HTML 요소를 입력으로 받아 브라우저 렌더링 결과를 PDF로 바꾸는 데 초점이 있는 라이브러리다.
- 내부적으로 `html2canvas`와 `jsPDF`를 묶어서 사용하는 래퍼 성격이 강하다.
- 이미 만들어진 HTML/CSS 레이아웃을 빠르게 PDF로 내보내고 싶을 때 진입 장벽이 낮다.
- 브라우저 화면과 비슷한 모양을 빠르게 복제하기에는 편하지만, 문단 분할/페이지 흐름/텍스트 단위 제어는 상대적으로 약하다.
- 결과물이 “텍스트 기반 문서”라기보다 “렌더링된 화면을 PDF로 포장한 결과”에 가까워질 수 있다.
- 복잡한 CSS, 폰트 로딩 타이밍, 캡처 위치, 페이지 브레이크 규칙에 따라 출력 품질이 흔들릴 수 있다.

**`jsPDF`**

- PDF 문서를 직접 생성하는 라이브러리다.
- 페이지를 추가하고, 좌표를 지정하고, 텍스트와 도형과 이미지를 하나씩 배치하는 방식으로 동작한다.
- HTML 렌더링에 기대지 않기 때문에 문서형 출력 규격을 코드로 명확하게 제어할 수 있다.
- 대신 제목, 본문, 여백, 줄간격, 페이지 분할 같은 레이아웃 규칙을 직접 설계해야 하므로 구현 난이도는 더 높다.
- 한글 폰트처럼 기본 제공되지 않는 자산은 별도 등록이 필요하지만, 등록 후에는 출력 일관성이 높다.
- “편집기 화면을 PDF로 복제”하는 용도보다 “정해진 규격의 문서 PDF를 만든다”는 용도에 더 적합하다.

**핵심 차이**

- `html2pdf.js`는 HTML/CSS 렌더링 결과를 PDF로 바꾸는 쪽에 강하다.
- `jsPDF`는 PDF 자체를 조립하는 쪽에 강하다.
- `html2pdf.js`는 구현 속도가 빠르지만 세밀한 페이지 제어가 어렵다.
- `jsPDF`는 구현 부담이 있지만 페이지와 문단 레이아웃을 직접 통제할 수 있다.
- `html2pdf.js`는 화면 복제형, `jsPDF`는 문서 생성형 접근이라고 볼 수 있다.

**이번 프로젝트에서 왜 `jsPDF`가 더 맞았는가**

- export 대상이 “프로젝트 제목 + 문단 텍스트 + 작성자 라벨” 중심의 문서형 콘텐츠다.
- 화면 스타일을 그대로 복제하는 것보다 문단이 페이지를 넘어갈 때 자연스럽게 이어지는 것이 더 중요했다.
- 긴 문단이 많은 시나리오에서 CSS 브레이크 제어보다 코드 기반 페이지 분할이 더 안정적이었다.
- 따라서 이번 요구사항은 `html2pdf.js`보다 `jsPDF`가 더 잘 맞는 문제 유형이었다.

**2. `jsPDF` 주요 기능 정리**

- 참고링크 : [https://www.npmjs.com/package/jspdf](https://www.npmjs.com/package/jspdf)

- `new jsPDF({...})`
  - 새 PDF 문서를 생성한다.
  - 용지 크기(`format`), 방향(`orientation`), 단위(`unit`) 같은 기본 출력을 정한다.
- `text()`
  - PDF에 텍스트를 그린다.
  - 좌표 기반으로 제목, 본문, 라벨 등을 직접 배치할 수 있다.
- `setFont()`
  - 현재 사용할 폰트를 바꾼다.
  - 일반/볼드 전환이나 사용자 폰트 적용에 사용한다.
- `setFontSize()`
  - 텍스트 크기를 지정한다.
  - 제목, 부제, 본문 같은 계층별 시각 차이를 만들 때 사용한다.
- `setTextColor()`
  - 텍스트 색상을 지정한다.
  - 제목, 보조 정보, 라벨을 시각적으로 구분할 수 있다.
- `splitTextToSize()`
  - 지정한 폭 안에 들어가도록 텍스트를 줄 단위로 분할한다.
  - 문단 줄바꿈과 페이지 분할 구현의 핵심 도구다.
- `addPage()`
  - 새 페이지를 추가한다.
  - 남은 공간이 부족할 때 다음 페이지로 넘기는 데 사용한다.
- `output("blob")`
  - 생성한 PDF를 Blob 형태로 뽑아낸다.
  - 브라우저 다운로드와 연결하기 좋다.
- `save()`
  - PDF를 바로 파일로 저장한다.
  - 이번 구현에서는 공통 다운로드 흐름을 맞추기 위해 `blob` 출력 후 수동 다운로드 방식을 사용했다.
- `addFileToVFS()`
  - 폰트 같은 파일 데이터를 `jsPDF` 내부 가상 파일 시스템에 등록한다.
  - 사용자 폰트를 쓰기 위한 사전 준비 단계다.
- `addFont()`
  - VFS에 등록된 폰트를 실제 사용 가능한 폰트 패밀리로 연결한다.
  - 이후 `setFont()`에서 해당 이름을 선택해 쓸 수 있다.
- `rect()`, `line()`, `roundedRect()`
  - 사각형, 선, 둥근 사각형 같은 도형을 그릴 수 있다.
  - 현재 구현에는 쓰지 않았지만 표지, 카드형 블록, 구분선 같은 문서 장식에 활용할 수 있다.
- `addImage()`
  - 이미지 데이터를 PDF 안에 배치할 수 있다.
  - 추후 썸네일, 커버 이미지, 로고 등을 넣는 확장에 사용할 수 있다.
- 메타데이터 및 페이지 관리 API
  - 문서 속성, 현재 페이지, 총 페이지 수 같은 값을 다루는 기능도 제공한다.
  - 이후 PDF 고도화 시 머리말/꼬리말, 페이지 번호 삽입 등에 연결할 수 있다.

**3. 이번 구현에서 실제로 사용한 `jsPDF` 기능**

- `new jsPDF()`로 A4 세로 문서 생성
- `addFileToVFS()` + `addFont()`로 Noto Sans KR 폰트 등록
- `setFont()`, `setFontSize()`, `setTextColor()`로 문서 스타일 지정
- `splitTextToSize()`로 문단 줄바꿈 처리
- `text()`로 제목, 날짜, 작성자 라벨, 본문 출력
- `addPage()`로 페이지 분할
- `output("blob")`로 다운로드 가능한 PDF Blob 생성

#### 💡 추가로 배운 점

**PDF export는 “화면을 저장하는 문제”와 “문서를 조판하는 문제”가 다르다**

- 화면을 그대로 캡처하는 접근은 빠르게 기능을 붙이기 쉽다.
- 하지만 문단이 많고 페이지를 넘나드는 문서형 데이터에서는 결국 조판 규칙을 직접 가져가는 편이 더 안정적이다.
- 이번 전환으로 PDF export를 단순 출력 기능이 아니라 “문서 렌더링 로직”으로 다뤄야 한다는 점이 더 분명해졌다.

**한글 PDF는 폰트 결정이 구현의 일부다**

- 라이브러리 선택만으로 끝나는 문제가 아니라, 어떤 폰트를 어떤 방식으로 번들에 포함하고 등록할지까지 설계해야 완성된다.
- 특히 줄바꿈과 페이지 분할을 직접 구현할수록 폰트 처리 전략이 레이아웃 품질에 직접 영향을 준다.

#### 🔜 내일 할 일

- [ ] `jsPDF` 기반 PDF export 실제 출력 결과 수동 검증
  - 긴 문단, 빈 줄 포함 문단, 작성자 라벨 on/off 케이스 확인
- [ ] PDF 청크 크기와 초기 번들 영향 재점검
  - 필요하면 export 진입 시점 기준으로 추가 코드 스플리팅 검토
- [ ] `_docs/export_guide.md`와 week 9 로그의 PDF 전략 최신화

#### ❓ 이슈 / 질문

- 페이지 번호, 머리말/꼬리말 같은 고급 PDF 기능이 실제로 필요한지 추후 요구사항 확인 필요
- Electron 쪽 PDF 전략은 웹 `jsPDF`와 별도로 가져갈지, `printToPDF()`를 유지할지 추후 결정 필요

---

### 📅 2026-04-08 (Day 33)

#### 🎯 오늘 목표
- [x] Electron Word export 구현 계획 수립
- [x] 웹 Word 생성 로직을 공통 레이어로 분리
- [x] Electron 저장용 IPC 추가
- [x] `Editor`에서 웹/Electron Word export 분기 연결
- [x] Electron 모듈과 IPC 사용 방식 개념 정리

#### ✅ 완료한 작업

- [x] `_docs/export_guide.md`를 기준으로 Electron Word 우선 구현 계획 정리
  - 공통 데이터 모델은 유지하고 저장 방식만 플랫폼별로 분리하기로 결정
  - Word는 웹 구현을 재사용하되 "문서 생성"과 "다운로드/저장"을 분리하는 방향으로 확정
- [x] Word 문서 생성 공통 레이어 분리
  - `frontend/src/features/export/word/buildWordDocument.ts` 추가
  - `frontend/src/features/export/word/buildWordBuffer.ts` 추가
  - `frontend/src/features/export/web/exportWord.ts`는 공통 ArrayBuffer를 받아 브라우저 다운로드만 담당하도록 정리
- [x] Electron Word 저장 IPC 구현
  - `electron/preload.ts`에 `saveWordDocument(filename, data)` 브리지 API 추가
  - `electron/main.ts`에 `ipcMain.handle("save-word-document", ...)` 추가
  - 메인 프로세스에서 `dialog.showSaveDialog()`로 저장 위치를 받고 `fs.promises.writeFile()`로 `.docx` 바이너리 저장
- [x] `Editor.tsx`에서 플랫폼별 Word export 흐름 연결
  - 웹에서는 기존처럼 다운로드 유지
  - Electron에서는 `buildWordArrayBuffer()` 결과를 IPC로 전달해 저장
  - 저장 취소는 실패와 분리해서 조용히 종료하고, 실제 오류만 예외 처리
- [x] 타입 및 빌드 검증
  - `frontend/src/types/electron.d.ts`에 `saveWordDocument` 타입 추가
  - `npm run build --prefix frontend` 통과
  - `cmd /c npx tsc -p tsconfig.electron.json` 통과
- [x] PDF export 코드리뷰 반영
  - `frontend/src/features/export/web/exportPdf.ts`에서 수동 `PdfDocument` 타입 제거
  - `import type { jsPDF } from "jspdf"` 기반 공식 타입으로 교체
  - `jsPDF`의 `text()`가 baseline 기준으로 동작하는 점을 반영해 제목, 부제, 작성자 라벨, 본문 줄 출력 Y 좌표에 baseline 보정 추가
  - `npm run build --prefix frontend`로 변경 후 재검증

#### 🧩 해결한 문제

**문제 1: 기존 Electron export IPC는 문자열 중심이라 `.docx` 바이너리 저장에 맞지 않았다**

- **상황**
  - 기존 `export-file` IPC는 `format`, `content` 문자열 기반이라 텍스트나 단순 PDF 흐름에는 맞았지만 Word 바이너리 저장에는 어울리지 않았다.
- **해결**
  - `save-word-document` 전용 IPC를 추가했다.
  - 렌더러에서는 `ArrayBuffer`를 만들고, 메인 프로세스에서는 `Buffer.from(new Uint8Array(data))`로 변환해 파일에 저장했다.
- **결과**
  - Electron Word export가 브라우저 다운로드 흐름과 분리된 저장 UX를 갖게 됐다.

**문제 2: Word 문서 생성과 웹 다운로드가 한 파일에 섞여 있어 Electron 재사용이 불편했다**

- **상황**
  - 기존 `exportWord.ts`는 문서 생성부터 Blob 다운로드까지 모두 담당하고 있었다.
- **해결**
  - `buildWordDocument()`와 `buildWordArrayBuffer()`를 분리해 공통 Word 생성 레이어를 만들었다.
  - 웹은 다운로드만 담당하고, Electron은 같은 결과물을 IPC로 넘겨 저장하게 나눴다.
- **결과**
  - "무엇을 export할지"와 "어떻게 저장할지"가 분리돼 구조가 명확해졌다.

**문제 3: PDF export 코드에서 `jspdf` 공식 타입과 실제 텍스트 배치 기준을 충분히 활용하지 못하고 있었다**

- **상황**
  - `exportPdf.ts`에는 `PdfDocument`라는 수동 타입이 있었는데, 실제 `jspdf` 패키지가 제공하는 타입 정의와 분리돼 있었다.
  - 또한 `pdf.text()`의 Y 좌표를 줄 top처럼 사용하고 있었지만, `jsPDF`는 baseline 기준으로 텍스트를 배치하므로 상단 여백과 본문 줄 위치가 실제 계산보다 위로 붙을 수 있었다.
- **해결**
  - 수동 `PdfDocument` 타입을 제거하고 `import type { jsPDF as JsPdfDocument } from "jspdf"`로 공식 타입을 사용하도록 변경했다.
  - `getTextBaselineOffset()`를 추가해 `cursorY`는 계속 top 기준으로 유지하고, `text()` 호출 시에만 baseline 보정값을 더하도록 정리했다.
  - 제목, 부제, 작성자 라벨, 본문 출력에 동일한 기준을 적용했다.
- **결과**
  - `jspdf` 메서드 시그니처를 라이브러리 타입과 일치시켜 타입 안정성이 좋아졌다.
  - PDF 텍스트 배치가 `jsPDF`의 baseline 기준과 맞도록 보정돼 상단 여백 침범 가능성을 줄였다.

#### 🧠 배운 것

**1. Electron export는 렌더러와 메인 프로세스의 책임을 나눌수록 구조가 선명해진다**

- 렌더러는 export 데이터와 사용자 옵션을 준비한다.
- 메인 프로세스는 저장 경로 선택, 파일 쓰기, OS API 접근을 담당한다.
- 이번 Word export는 이 경계를 기준으로 나누니 변경 범위가 작고 재사용성이 좋아졌다.

**2. IPC는 응답이 필요한지부터 구분하면 설계가 쉬워진다**

- 저장 다이얼로그, 파일 저장, DB 저장처럼 결과를 반환해야 하는 작업은 `ipcMain.handle` + `ipcRenderer.invoke`가 적합하다.
- OS 알림처럼 단순 트리거만 필요하면 `ipcMain.on` + `ipcRenderer.send`가 더 단순하다.

**3. preload는 Electron 보안 구조의 핵심 경계면이다**

- 렌더러에 Electron 전체 API를 직접 열지 않고, 필요한 기능만 `contextBridge.exposeInMainWorld()`로 제한해서 노출할 수 있다.
- 그래서 `window.electron.saveWordDocument()` 같은 최소 기능만 안전하게 사용할 수 있다.

**4. 문서 레이아웃 코드에서는 "내가 계산하는 좌표 기준"과 "라이브러리가 해석하는 좌표 기준"이 같아야 한다**

- 이번 PDF 코드에서는 `cursorY`를 줄 top처럼 다루고 있었는데, `jsPDF.text()`는 baseline 기준이라 그대로 넘기면 실제 렌더링 위치가 위로 붙는다.
- 그래서 좌표 계산 레이어에서는 top 기준을 유지하고, 렌더링 호출 직전에 baseline 보정을 더하는 방식이 더 안전했다.
- 이런 종류의 차이는 타입 오류로는 잘 드러나지 않아서, 라이브러리 동작 규칙을 문서와 코드 양쪽에서 함께 확인하는 습관이 중요하다는 점을 다시 확인했다.

#### 📘 개념정리

**1. IPC란 무엇인가**

- IPC는 `Inter-Process Communication`의 줄임말로, 서로 다른 프로세스가 데이터를 주고받는 방식을 뜻한다.
- Electron에서는 보통 렌더러 프로세스와 메인 프로세스가 분리되어 있으므로, 렌더러가 운영체제 기능이나 파일 시스템에 직접 접근하지 않고 IPC를 통해 메인 프로세스에 요청을 보낸다.
- 흐름은 보통 아래처럼 정리된다.

```ts
Renderer -> Preload -> Main
```

- `Renderer`
  - React UI, 사용자 입력, 화면 상태를 담당한다.
- `Preload`
  - 렌더러와 메인 사이에서 안전한 브리지 역할을 한다.
  - 필요한 기능만 `window.electron` 같은 제한된 API로 노출한다.
- `Main`
  - `BrowserWindow`, 파일 저장, 다이얼로그, 알림, 전역 단축키 같은 Electron/OS 기능을 담당한다.

**2. Electron에서 IPC가 필요한 이유**

- 보안 때문이다.
- 현재 프로젝트도 `contextIsolation: true`, `nodeIntegration: false`로 설정되어 있어서 렌더러가 Node.js와 Electron 내부 기능에 직접 접근하지 않는다.
- 그래서 렌더러가 "저장 다이얼로그를 열어줘", "파일을 저장해줘", "알림을 띄워줘" 같은 요청을 IPC로 메인 프로세스에 전달해야 한다.

**3. IPC의 대표 패턴**

- `ipcRenderer.invoke` <-> `ipcMain.handle`
  - 응답이 필요한 비동기 요청-응답 패턴
  - 예: 파일 저장, DB 저장, 경로 선택
- `ipcRenderer.send` <-> `ipcMain.on`
  - 결과를 기다리지 않는 단방향 이벤트 패턴
  - 예: 알림 표시, 로그 전송, 단순 트리거

**4. `jsPDF.text()`의 좌표 기준**

- `jsPDF.text()`에 전달하는 Y 값은 텍스트 박스의 top이 아니라 baseline 기준이다.
- 따라서 상단 여백이나 줄 시작 위치를 top 기준으로 계산하고 있다면, `text()` 호출 시점에 폰트 높이만큼 baseline 보정을 더해야 실제 텍스트가 예상 위치에 놓인다.
- 이번 코드에서는 `getTextBaselineOffset(fontSize)`를 추가해 제목, 부제, 작성자 라벨, 본문 줄 출력 모두 같은 기준으로 맞췄다.

**5. `ipcMain.handle`은 언제 쓰는가**

- `ipcMain.handle(channel, handler)`는 렌더러가 `ipcRenderer.invoke(channel, ...args)`로 요청을 보냈을 때, 메인 프로세스가 비동기 작업을 수행하고 결과를 돌려줘야 할 때 쓴다.
- 즉 "요청-응답" 패턴의 IPC에 적합하다.
- 적합한 경우:
  - 저장 다이얼로그를 열고 사용자가 고른 경로를 반환해야 할 때
  - 파일 저장 후 성공/실패를 반환해야 할 때
  - DB 작업 결과를 렌더러가 기다려야 할 때
- 이번 코드에서 `ipcMain.handle`이 쓰인 곳:
  - `export-file`
  - `save-word-document`
  - `save-doc`

```ts
// renderer
const result = await ipcRenderer.invoke("save-word-document", filename, data);

// main
ipcMain.handle("save-word-document", async (_event, filename, data) => {
  return { success: true };
});
```

**6. `ipcMain.on`은 언제 쓰는가**

- `ipcMain.on(channel, listener)`는 렌더러가 `ipcRenderer.send(channel, ...args)`로 단방향 이벤트를 보낼 때 쓴다.
- 결과를 돌려줄 필요가 없는 알림성 이벤트에 적합하다.
- 이번 코드에서는 `show-notification`이 여기에 해당한다.

**7. 이번 작업의 IPC 흐름**

```ts
// renderer
const buffer = await buildWordArrayBuffer(exportDocument);
await window.electron.saveWordDocument(filename, buffer);

// preload
saveWordDocument: (filename, data) =>
  ipcRenderer.invoke("save-word-document", filename, data),

// main
ipcMain.handle("save-word-document", async (_event, filename, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename,
  });

  await fs.promises.writeFile(filePath, Buffer.from(new Uint8Array(data)));
  return { success: true };
});
```

- 렌더러는 Word 바이너리를 만든다.
- preload는 이 요청을 안전하게 메인 프로세스로 전달한다.
- 메인 프로세스는 실제 저장 다이얼로그와 파일 쓰기를 수행하고 결과를 다시 반환한다.

**8. `main.ts`에 쓰인 Electron 모듈 정리**

- `app`
  - Electron 앱의 생명주기를 관리한다.
  - `whenReady()`, `window-all-closed`, `will-quit`, `setAppUserModelId()` 같은 앱 레벨 동작에 사용한다.
- `BrowserWindow`
  - Electron 데스크톱 창을 만든다.
  - 창 크기, preload 경로, `contextIsolation`, `nodeIntegration` 같은 보안 옵션을 설정하고 페이지를 로드할 때 사용한다.
- `ipcMain`
  - 메인 프로세스에서 렌더러의 IPC 요청을 받는다.
  - `handle()`은 요청-응답, `on()`은 단방향 이벤트 처리에 쓴다.
- `dialog`
  - 운영체제의 저장/열기 다이얼로그를 띄운다.
  - 이번 Word export에서는 `showSaveDialog()`로 저장 위치와 파일명을 받는다.
- `Notification`
  - OS 네이티브 알림을 띄운다.
  - `isSupported()`로 지원 여부를 확인한 뒤 알림 생성과 클릭 이벤트 처리에 사용한다.
- `globalShortcut`
  - 앱 전역 단축키를 등록한다.
  - 이번 코드에서는 `CommandOrControl+Shift+A`를 등록하고 종료 시 `unregisterAll()`로 해제한다.

**9. `preload.ts`에 쓰인 Electron 모듈 정리**

- `contextBridge`
  - preload에서 정의한 안전한 API를 렌더러의 `window` 객체에 노출한다.
  - `window.electron`처럼 필요한 기능만 제한적으로 공개할 때 쓴다.
- `ipcRenderer`
  - 렌더러 쪽에서 메인 프로세스로 IPC 요청을 보내는 모듈이다.
  - `invoke()`로 응답이 필요한 요청, `send()`로 단방향 이벤트를 보낸다.
  - `on()`과 `removeListener()`로 메인 프로세스가 보낸 이벤트를 구독/해제할 수 있다.
- `IpcRendererEvent`
  - IPC 이벤트 리스너의 이벤트 객체 타입이다.
  - TypeScript에서 이벤트 핸들러 인자를 타입 안전하게 다룰 때 사용한다.

**10. 이번 `main.ts`, `preload.ts`에서 Electron 모듈이 실제로 맡은 역할**

```ts
// main.ts
app.whenReady(...)
new BrowserWindow(...)
ipcMain.handle("save-word-document", ...)
dialog.showSaveDialog(...)
new Notification(...)
globalShortcut.register(...)
```

- 메인 프로세스는 "창 생성", "OS 기능 접근", "파일 저장", "전역 단축키", "IPC 응답"을 담당한다.

```ts
// preload.ts
contextBridge.exposeInMainWorld("electron", {
  saveWordDocument: (filename, data) =>
    ipcRenderer.invoke("save-word-document", filename, data),
  showNotification: (title, body) =>
    ipcRenderer.send("show-notification", title, body),
});
```

- preload는 렌더러가 Electron 내부에 직접 접근하지 않도록 막으면서, 필요한 기능만 안전하게 전달하는 브리지 역할을 한다.

#### 🧾 코드/구조 메모

**Electron Word export 흐름**

```ts
// renderer
const buffer = await buildWordArrayBuffer(exportDocument);
const result = await window.electron.saveWordDocument(filename, buffer);
```

```ts
// preload
saveWordDocument: (filename: string, data: ArrayBuffer) =>
  ipcRenderer.invoke("save-word-document", filename, data),
```

```ts
// main
ipcMain.handle("save-word-document", async (_event, filename, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename,
  });

  const buffer = Buffer.from(new Uint8Array(data));
  await fs.promises.writeFile(filePath, buffer);
});
```

- 렌더러: export 데이터와 Word 바이너리 준비
- preload: 안전한 IPC 호출 창구 제공
- 메인: 저장 위치 선택과 파일 쓰기 수행

#### 🔜 내일 할 일

- [ ] `npm run electron:dev`에서 실제 Word 저장 다이얼로그와 저장 결과 확인
- [ ] 저장 취소 시 현재 UX가 적절한지 점검
- [ ] Electron PDF 구현 방향을 `printToPDF()` 기준으로 구체화
- [ ] `_docs/export_guide.md`에 Electron Word 구현 상태 반영 검토

#### ❓ 고민/질문

- Word export IPC를 포맷별 전용 채널로 유지할지, 향후 공통 `save-export-document` 스펙으로 통합할지 판단이 필요하다.
- Electron PDF도 Word처럼 "공통 데이터 + 플랫폼 전용 저장" 패턴은 유지하되, 출력 엔진은 `printToPDF()`로 분리하는 편이 더 자연스러워 보인다.

#### 📊 진행률

Week 9: ▰▰▰▰▱▱▱ 60%
전체: ▰▰▰▰▰▰▱▱▱▱ 70%

---

### 2026-04-10 (Day 34)

#### 오늘 목표

- [x] Electron PDF 구현 방향을 `printToPDF()` 기준으로 구체화
- [x] Electron PDF 렌더링 방식을 `hidden BrowserWindow + export route`로 확정
- [x] Electron PDF에서 웹과 최대한 동일한 시각 결과를 목표로 확정
- [x] Electron PDF 1차 범위에 페이지 번호, 머리말, 꼬리말 포함 확정
- [x] layout 없는 export route 지원 방식 결정 및 반영
- [x] `save-pdf-document` IPC 계약 추가
- [x] hidden window payload 주입 방식 구현
- [x] `printToPDF()` header/footer 템플릿 1차 구현
- [x] `_docs/export_guide.md` 최신화

#### 완료한 작업

- [x] `routeList`와 `App.tsx`를 조정해 `/export/pdf` route를 `Layout` 없이 렌더링하도록 반영
- [x] `frontend/src/types/electron.d.ts`, `electron/preload.ts`에 PDF 저장, payload 조회, ready 알림 브리지 추가
- [x] `electron/main.ts`에 `save-pdf-document` IPC와 hidden `BrowserWindow` 기반 저장 흐름 구현
- [x] `ExportPdfPage.tsx`, `ExportPdfDocument.tsx`를 추가해 PDF 전용 렌더링 화면 구성
- [x] `Editor.tsx`에서 웹 PDF와 Electron PDF 저장 흐름 분기 연결
- [x] `printToPDF()` header/footer 템플릿으로 프로젝트 제목, export 날짜, 페이지 번호 출력
- [x] `npm run build --prefix frontend` 통과
- [x] `cmd /c npx tsc -p tsconfig.electron.json` 통과

#### 해결한 문제

**문제 1: Electron PDF에서 제목은 보이는데 본문 내용이 보이지 않는 문제가 있었다**

- 상황
  - hidden window가 `/export/pdf` route를 열고 있었지만, payload를 state에 세팅한 직후 너무 빨리 ready 신호를 보내고 있었다.
  - 그 결과 실제 문단 DOM이 완전히 렌더되기 전에 `printToPDF()`가 실행될 수 있었다.
- 해결
  - `ExportPdfPage.tsx`에서 payload 로드와 렌더 완료 신호를 분리했다.
  - 첫 번째 effect는 payload만 `documentModel` state에 올린다.
  - 두 번째 effect는 `.export-pdf-page`와 문단 `section` 렌더링 여부를 확인한 뒤 `document.fonts.ready`, 2번의 `requestAnimationFrame`까지 기다리고 나서 `notifyPdfExportReady()`를 호출하도록 변경했다.
- 결과
  - PDF 본문이 정상적으로 출력되기 시작했다.

**문제 2: 페이지 이동 시 페이지 하단에 너무 많은 공백이 생겼다**

- 상황
  - 문단 블록 전체에 `break-inside: avoid`를 적용해 두었고, 이 때문에 다음 문단이 페이지 끝에 안 들어가면 문단 전체가 다음 페이지로 넘어가면서 큰 빈 공간이 생겼다.
- 해결
  - 문단 `section`의 `breakInside`를 `auto`로 변경했다.
  - `@media print` 안에서도 `section`에 `break-inside: auto`, `page-break-inside: auto`를 적용했다.
- 결과
  - 본문이 페이지 끝에서 더 자연스럽게 이어지고 페이지 하단 공백이 줄었다.

**문제 3: 작성자 라벨이 페이지 맨 아래에 혼자 떨어질 수 있었다**

- 상황
  - 문단 전체를 강제로 묶지 않도록 바꾼 뒤에는, 반대로 라벨만 페이지 마지막 줄에 남고 본문이 다음 페이지로 넘어갈 수 있는 상태가 되었다.
- 해결
  - 라벨 스타일에 `break-after: avoid`, `page-break-after: avoid`를 추가했다.
  - 본문에는 `orphans`, `widows`를 추가해 문단 첫 줄과 마지막 줄이 지나치게 어색하게 잘리지 않도록 완화했다.
- 결과
  - 라벨과 본문 시작이 더 자연스럽게 붙어 다니는 쪽으로 개선됐다.

#### 배운 점

**1. Electron PDF는 데이터 준비와 인쇄 준비를 분리해야 안정적이다**

- 렌더러는 export 문서 모델을 준비한다.
- 메인 프로세스는 hidden window를 띄워 인쇄를 담당한다.
- export route는 문서가 다 그려졌는지를 보장하는 역할을 맡는다.
- 이 셋을 나누니 디버깅 포인트가 명확해졌다.

**왜 `hidden window` 기반 PDF 저장 방식을 택했는가**

- `printToPDF()`는 현재 렌더된 페이지를 그대로 PDF로 만들기 때문에, 편집 UI가 섞이지 않은 인쇄 전용 화면이 필요했다.
- 메인 에디터 화면을 그대로 찍으면 툴바, 스크롤 상태, hover UI 같은 앱 상태가 PDF 결과에 영향을 줄 수 있다.
- hidden `BrowserWindow`를 따로 두면 export 전용 route만 로드해서 제목, 부제, 본문, 작성자 라벨, 여백, 페이지 번호를 독립적으로 제어할 수 있다.
- 웹 PDF와 최대한 비슷한 시각 결과를 유지하려면 “현재 작업 화면”이 아니라 “PDF용 문서 화면”을 분리하는 편이 훨씬 안정적이었다.
- 저장 흐름도 메인 프로세스에서 `showSaveDialog()`와 `printToPDF()`를 한 번에 묶어 처리할 수 있어서 Electron UX와 잘 맞았다.

**2. `printToPDF()`는 단순 저장 API가 아니라 현재 렌더된 문서 상태에 매우 민감하다**

- payload가 있어도 DOM이 다 그려지지 않으면 빈 PDF가 나올 수 있다.
- 폰트 로딩과 paint 타이밍까지 기다려야 실제 화면과 가까운 결과를 얻을 수 있다.
- 그래서 ready 신호 기준을 state 세팅 완료가 아니라 문서 렌더 완료로 두는 것이 중요했다.

**3. 페이지 분할 품질은 CSS 한 줄 차이에도 크게 달라진다**

- `break-inside: avoid`는 보기엔 안전해 보여도 긴 문서에서는 공백을 키울 수 있다.
- 반대로 이를 완전히 풀면 라벨과 본문 결속이 약해질 수 있다.
- 결국 문단 전체를 묶는 것이 아니라 라벨과 본문 시작만 붙들기처럼 더 작은 단위로 제어하는 편이 품질이 좋았다.

#### Electron PDF 흐름 도식

```text
[Editor.tsx]
사용자가 PDF 내보내기 클릭
  ->
buildExportDocument()로 공통 문서 모델 생성
  ->
Electron 환경이면 window.electron.savePdfDocument(filename, document)
  ->
[preload.ts]
renderer 요청을 IPC로 메인 프로세스에 전달
  ->
[electron/main.ts]
save-pdf-document 핸들러 실행
  ->
showSaveDialog()로 저장 경로 선택
  ->
hidden BrowserWindow 생성
  ->
pdfExportPayloads[webContents.id] = document 저장
  ->
hidden window가 /export/pdf route 로드
  ->
[ExportPdfPage.tsx]
window.electron.getPdfExportPayload()로 자기 문서 payload 조회
  ->
documentModel state 세팅
  ->
본문 DOM 렌더 확인
  ->
fonts.ready + 2번의 requestAnimationFrame 대기
  ->
window.electron.notifyPdfExportReady()
  ->
[electron/main.ts]
pdf-export-ready 신호 수신
  ->
hidden window.webContents.printToPDF(...)
  ->
PDF buffer 생성
  ->
fs.promises.writeFile(filePath, pdfBuffer)
  ->
payload 정리 + hidden window 닫기
  ->
renderer로 success 반환
  ->
[Editor.tsx]
성공 토스트 표시
```

#### 확인한 코드 포인트

- `electron/main.ts`
  - hidden window 생성
  - payload 보관
  - export route 로드
  - `printToPDF()` 호출
- `electron/preload.ts`
  - PDF 저장 요청 브리지
  - payload 조회 브리지
  - ready 알림 브리지
- `frontend/src/pages/ExportPdfPage.tsx`
  - payload 로드
  - 렌더 완료 시점 보장
- `frontend/src/features/export/components/ExportPdfDocument.tsx`
  - 인쇄용 문서 HTML/CSS 렌더링
  - 공백 및 라벨 페이지 브레이크 보정
- `frontend/src/components/Editor.tsx`
  - Electron PDF 저장 분기 연결

#### 내일 할 일

- [ ] `npm run electron:dev`에서 더 긴 문서 케이스를 수동 검증
- [ ] 머리말, 꼬리말 스타일을 Chromium 제약 안에서 더 다듬을 수 있는지 확인
- [ ] Electron 빌드 환경 `file://` route 전환이 실제 패키징에서도 안정적인지 점검
- [ ] `_docs/export_guide.md` 상단 체크 상태와 최신 업데이트 섹션 간 중복 정리

#### 회고/질문

- Electron PDF는 웹 `jsPDF`처럼 좌표 기반으로 완전히 통제하는 대신, HTML/CSS를 얼마나 안정적으로 인쇄 상태로 만들 수 있나가 품질의 핵심이라는 점이 더 분명해졌다.
- 지금 구조는 1차 구현으로 적절하지만, 나중에 페이지 번호 위치나 머리말, 꼬리말 디자인 자유도가 더 중요해지면 Chromium 템플릿 제약을 다시 검토할 필요가 있다.

#### 진행률

Week 9: 70%
Total: 70%
