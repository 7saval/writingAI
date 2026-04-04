# Export Guide

## 목표

`WritingSession` 화면에서 현재 프로젝트의 전체 paragraph를 Word(`.docx`)와 PDF로 내보낸다.

- 대상 화면: `frontend/src/components/Editor.tsx`
- 대상 데이터: 현재 `projectId`에 연결된 모든 paragraph
- 지원 플랫폼: 웹 브라우저, Electron 앱
- 우선순위: 공통 데이터 모델 정리 -> Word 안정화 -> PDF 확장

## 현재 코드 기준 전제

현재 에디터는 아래 흐름으로 동작한다.

- `Editor.tsx`에서 `useParams()`로 `projectId`를 읽는다.
- `useProjectParagraphsQuery(Number(projectId))`로 프로젝트별 paragraph 목록을 조회한다.
- 조회 결과를 로컬 상태 `paragraphs`에 반영한 뒤 화면에 렌더링한다.
- 문단 생성 중에는 임시 paragraph를 로컬 상태에 추가한다.

프로젝트 제목은 아래 경로에서 조회할 수 있다.

- `frontend/src/hooks/useProjects.ts`의 `useProjectDetailQuery`
- `frontend/src/api/projects.api.ts`의 `fetchProjectDetail`

따라서 내보내기 기능은 아래 데이터를 조합하면 된다.

- `projectId`
- 프로젝트 제목
- 현재 paragraph 목록

## 확정 범위

내보내기 대상은 "현재 프로젝트의 전체 paragraph"다.

- 정렬 기준: `orderIndex ASC`
- 본문 기준: `paragraph.content`
- 문서 메타데이터: 프로젝트 제목만 포함
- 작성자 라벨: 선택 사항

확정 정책은 아래와 같다.

- 프로젝트 문서에는 제목만 포함한다.
- 장르, 설명, synopsis, lorebook은 초기 범위에서 제외한다.
- `ai`/`user` 작성자 라벨은 내보내기 다이얼로그에서 사용자가 선택한다.
- 빈 문단은 제외한다.
- 정렬은 내보내기 직전에 다시 적용한다.
- 데이터 기준은 화면의 최신 로컬 상태 `paragraphs`를 우선 사용한다.

## 공통 설계

웹과 Electron이 같은 데이터를 사용할 수 있도록 문서 생성 직전의 공통 레이어를 둔다.

### 1. 공통 export 모델

예상 타입 예시:

```ts
type ExportParagraph = {
  id: number;
  content: string;
  writtenBy: "user" | "ai";
  orderIndex: number;
};

type ExportDocumentModel = {
  projectId: number;
  projectTitle: string;
  exportedAt: string;
  includeAuthorLabel: boolean;
  paragraphs: ExportParagraph[];
};
```

역할:

- UI 상태를 문서 친화적인 구조로 정규화
- Word/PDF 생성기에서 같은 입력을 공유
- 웹/Electron 구현 차이를 저장 단계로만 제한
- 작성자 라벨 표시 여부를 포맷 생성 단계에 함께 전달

진행 상태:

- [x] `frontend/src/features/export/types.ts`에 공통 타입 정의

### 2. 공통 변환 함수

추천 위치:

- `frontend/src/features/export/utils/buildExportDocument.ts`

역할:

- `project`, `paragraphs`, `includeAuthorLabel`을 받아 `ExportDocumentModel` 생성
- 문단 정렬
- 빈 문단 제거
- 임시 로딩 문단 제거
- 파일명 생성용 safe title 생성

진행 상태:

- [x] `buildExportDocument()` 구현
- [x] `sanitizeFilename()` 구현

### 3. 파일명 규칙

권장 기본 규칙:

- Word: `{projectTitle}-{YYYY-MM-DD}.docx`
- PDF: `{projectTitle}-{YYYY-MM-DD}.pdf`

파일명에서 제거할 문자:

- `\ / : * ? " < > |`

진행 상태:

- [x] Word 파일명 규칙 반영
- [ ] PDF 파일명 규칙 실제 저장 흐름 반영

## UI 설계

### 배치 위치

가장 자연스러운 위치는 `Editor.tsx` 상단 툴바다.

### 다이얼로그 설계

내보내기 버튼은 하나만 두고, 클릭 시 다이얼로그를 연다.

다이얼로그 항목:

- 포맷 선택: `Word (.docx)` 또는 `PDF`
- 옵션 선택: `작성자 라벨 포함`
- 실행 버튼: `내보내기`

추가 상태:

- 내보내기 진행 중 버튼 비활성화
- 성공 시 토스트
- 실패 시 경고 다이얼로그 또는 토스트

진행 상태:

- [x] `Editor.tsx` 상단에 `내보내기` 버튼 추가
- [x] `ExportDialog.tsx` 추가
- [x] 포맷 선택 UI 추가
- [x] 작성자 라벨 옵션 체크박스 추가
- [x] 내보내기 진행 상태 비활성화 처리
- [x] 성공 토스트 연결
- [x] 실패 알림 연결

## 문서 구성 정책

문서 구조 권장안:

- 1행: 프로젝트 제목
- 본문: paragraph를 순서대로 배치
- 문단 간 간격 추가

작성자 라벨 옵션이 꺼져 있으면 문단 본문만 출력한다.

작성자 라벨 옵션이 켜져 있으면 각 문단 앞에 `AI` 또는 `USER` 라벨을 붙인다.

진행 상태:

- [x] 프로젝트 제목 출력
- [x] 문단 정렬 후 출력
- [x] 작성자 라벨 옵션 반영
- [x] 빈 문단 제외
- [x] `isLoading` 임시 문단 제외

## 웹 버전 설계

웹에서는 브라우저에서 파일을 만들어 바로 다운로드하는 방식이 1차 구현에 적합하다.

### 1. Word 내보내기

권장 라이브러리:

- `docx`

흐름:

1. `Editor.tsx`에서 현재 `paragraphs`와 프로젝트 정보를 확보한다.
2. 사용자가 다이얼로그에서 포맷과 작성자 라벨 옵션을 선택한다.
3. `buildExportDocument()`로 공통 모델을 만든다.
4. `docx`로 문서 객체를 생성한다.
5. Blob으로 패킹한다.
6. 브라우저 다운로드를 트리거한다.

진행 상태:

- [x] `docx` 설치
- [x] `exportWord.ts` 구현
- [x] 브라우저 다운로드 연결
- [x] `Editor.tsx`에서 Word export 호출 연결

### 2. PDF 내보내기

웹 PDF는 두 가지 방식이 있다.

#### 방식 A. HTML 렌더링 기반 PDF

권장 후보:

- `html2pdf.js`
- `jspdf` + `html2canvas`

#### 방식 B. PDF 객체 직접 생성

권장 후보:

- `pdf-lib`
- `jspdf`

진행 상태:

- [x] PDF 선택 경로 placeholder 연결
- [ ] 웹 PDF 라이브러리 선정
- [ ] 실제 PDF 생성 구현
- [ ] 브라우저 다운로드 연결

### 3. 웹 버전 권장 결론

- 1차 릴리스: Word + 간단한 PDF
- 사용자 옵션: 포맷 선택 + 작성자 라벨 포함 여부
- PDF 품질 요구가 높아지면 Electron 또는 서버 렌더링 중심으로 보완

진행 상태:

- [x] Word 1차 릴리스 가능 상태
- [ ] 웹 PDF 1차 릴리스

## Electron 버전 설계

Electron에서는 "다운로드"보다 "사용자가 저장 위치를 고르는 문서 저장" 경험이 더 자연스럽다.

### 1. 저장 방식

렌더러 프로세스:

- 현재 프로젝트 데이터를 수집
- 사용자가 다이얼로그에서 포맷과 작성자 라벨 옵션을 선택
- IPC로 메인 프로세스에 export 요청

메인 프로세스:

- `dialog.showSaveDialog()`로 저장 경로 선택
- 포맷별 파일 생성
- `fs.writeFile`로 저장

진행 상태:

- [ ] Electron IPC export 요청 구조 설계
- [ ] 저장 다이얼로그 연결

### 2. Word 내보내기

권장 구조:

- 공통: `ExportDocumentModel` 생성
- 공통: `docx` 문서 생성 함수
- Electron 전용: 저장 경로 선택 + 파일 쓰기

진행 상태:

- [ ] 공통 Word buffer 생성 함수 분리
- [ ] Electron 저장 경로 선택
- [ ] Electron 파일 쓰기

### 3. PDF 내보내기

Electron에서는 `webContents.printToPDF()`가 가장 유력하다.

진행 상태:

- [ ] export 전용 HTML 템플릿
- [ ] 숨김 BrowserWindow 또는 전용 route 구성
- [ ] `printToPDF()` 호출
- [ ] 파일 저장

## 권장 디렉터리 구조

초기 구조 예시:

```txt
frontend/src/
  features/export/
    components/
      ExportDialog.tsx
    utils/
      buildExportDocument.ts
      sanitizeFilename.ts
    web/
      exportWord.ts
      exportPdf.ts
    types.ts
```

진행 상태:

- [x] `frontend/src/features/export/` 구조 생성
- [x] `components`, `utils`, `web`, `types.ts` 반영

## 세부 동작 정책

### 어떤 데이터를 내보낼 것인가

확정 범위:

- 현재 프로젝트 제목
- 전체 paragraph 본문
- 작성자 라벨 옵션이 켜졌을 때만 `user`/`ai` 라벨 포함

제외 항목:

- 작성 시각
- 장르
- 설명
- synopsis
- lorebook

### 내보내기 시점의 데이터 기준

권장 기준은 로컬 상태 우선이다.

- 장점: 막 수정한 내용도 즉시 반영
- 단점: 서버 데이터와 미세하게 어긋날 수 있음

진행 상태:

- [x] 로컬 상태 `paragraphs` 기준 export 반영

### 정렬 정책

정렬은 항상 내보내기 직전에 다시 적용한다.

```ts
[...paragraphs].sort((a, b) => a.orderIndex - b.orderIndex)
```

진행 상태:

- [x] 정렬 로직 반영

### 제외 정책

아래 문단은 제외 권장:

- `isLoading === true` 인 임시 AI 문단
- `content.trim()` 이 빈 문자열인 문단

진행 상태:

- [x] 제외 정책 반영

## 오류 처리

### 웹

- 라이브러리 생성 실패
- Blob 생성 실패
- 브라우저 다운로드 차단

처리:

- 토스트 또는 다이얼로그로 실패 안내
- 실패 사유는 콘솔에 함께 기록

진행 상태:

- [x] 예외 catch 및 `showAlert` 연결
- [x] 성공 토스트 연결

### Electron

- 저장 위치 선택 취소
- 파일 쓰기 실패
- PDF 렌더링 실패

진행 상태:

- [ ] Electron 오류 처리 구현

## 구현 순서

### 1단계

- [x] `useProjectDetailQuery` 연결
- [x] export용 공통 타입/변환 함수 작성
- [x] `Editor.tsx`에 `내보내기` 버튼 추가
- [x] export 다이얼로그 추가

### 2단계

- [x] 다이얼로그에서 포맷 선택 상태 관리
- [x] 다이얼로그에서 작성자 라벨 옵션 상태 관리
- [x] 웹 Word 내보내기 구현

### 3단계

- [ ] 웹 PDF 1차 구현
- [x] Word 파일명 정리 및 다운로드 처리

### 4단계

- [ ] Electron IPC 구조 설계
- [ ] Electron Word 저장 구현

### 5단계

- [ ] Electron PDF 구현
- [ ] 긴 문서 품질 점검

## 추천 기술 선택

### Word

권장:

- `docx`

진행 상태:

- [x] 채택 및 설치 완료

### 웹 PDF

1차 권장:

- `html2pdf.js`

진행 상태:

- [ ] 채택 여부 확정

### Electron PDF

권장:

- `webContents.printToPDF()`

진행 상태:

- [ ] 구현 전

## 오픈 이슈

- [ ] PDF 품질 기준을 웹과 Electron에서 다르게 허용할지
- [ ] export 버튼을 `Editor` 내부에 둘지 `WritingSession` 상단에 둘지
- [ ] 작성자 라벨 표시 텍스트를 `AI`/`USER`로 유지할지 한글로 바꿀지

## 최종 권장안

현재 코드베이스 기준으로 가장 현실적인 1차 구현안은 아래다.

1. [x] `Editor.tsx`에 `내보내기` 버튼과 다이얼로그 추가
2. [x] `useProjectDetailQuery`로 프로젝트 제목 조회
3. [x] 공통 `buildExportDocument()` 함수 작성
4. [x] 다이얼로그에서 포맷과 작성자 라벨 옵션을 선택
5. [x] 웹은 `docx` 기반 Word 다운로드부터 구현
6. [ ] PDF는 웹 1차 구현 후, 품질이 필요하면 Electron `printToPDF()`를 고도화
