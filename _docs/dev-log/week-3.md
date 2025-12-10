
### 📅 2025-12-08 (Day 12)

#### 🎯 오늘의 목표
- [x] 시놉시스&설정집 모달창 분리
- [x] 시놉시스&설정집 삭제 구현
- [ ] 장르 프롬프트 보완
- [ ] 홈 화면, 헤더 푸터 레이아웃 구현

#### ✅ 완료한 작업
- ✅ 시놉시스&설정집 모달창 분리
- ✅ 설정집 삭제 구현  


#### 💡 **개념 정리**  
1) Partial<T> 유틸리티 타입  
    - T 타입의 모든 프로퍼티를 선택적으로 만드는 타입
    - 업데이트 함수에서 객체의 일부 프로퍼티만 업데이트할 때 사용

```typescript
// 원본 타입
interface LoreNote {
  id: number;
  title: string;
  content: string;
  keywords: string[];
  createdAt: Date;
}

// Partial을 사용하면
type PartialLoreNote = Partial<LoreNote>;

// 위는 아래와 동일
interface PartialLoreNote {
  id?: number;
  title?: string;
  content?: string;
  keywords?: string[];
  createdAt?: Date;
}
```
---
#### 🔧 해결한 문제
**문제1**: 시놉시스&설정집 모달창 분리하면서 코드의 중복이 다수 발생했다.

**해결**: 시놉시스&설정집 상태 업데이트 로직을 커스텀 훅에 캡슐화하였다.

**커스텀 훅 장점**  
✅ 관심사의 분리: 상태 관리 로직이 커스텀 훅에 집중됨  
✅ 코드 중복 제거: 배열 복사 로직을 반복하지 않음  
✅ 가독성 향상: onChange 핸들러가 매우 간결해짐  
✅ 유지보수성: 상태 업데이트 로직 변경 시 한 곳만 수정하면 됨  
✅ 타입 안정성: Partial<LoreNote>로 타입 체크 유지  

```typescript
export function LorebookModal({ projectId, open, onOpenChange }: LorebookModalProps) {

    const { synopsis,
        lorebook,
        isSubmitting,
        isLoading,
        saveContext,
        createNote,
        deleteNote,
        updateNote } = useStoryContext(projectId);

    return (
        ...생략...
    )
}

```

---


#### 📌 내일 할 일
- [ ] 설정집 카테고리 선택, 태그 입력 화면 구현
- [ ] 장르 프롬프트 보완
- [ ] ts-pattern 라이브러리 도입
- [ ] 홈 화면, 헤더 푸터 레이아웃 구현

#### 🚨 이슈/질문
- 


#### 📊 진행률
Week 3: ██████░░░░░░░░ 55%

---
### 📅 2025-12-09 (Day 13)

#### 🎯 오늘의 목표
- [x] 설정집 카테고리 선택, 태그 입력 화면 구현
- [ ] AI 프롬프트 보완 - 장르별, 사용자정의
- [ ] ts-pattern 라이브러리 도입
- [x] 홈 화면, 헤더 푸터 레이아웃 구현

#### ✅ 완료한 작업
- ✅ 설정집 카테고리 선택, 태그 입력 화면 구현
- ✅ 홈 화면, 헤더 푸터 레이아웃 구현
- ✅ shadcn ui 설치 및 컴포넌트 구현

**작업 내용 상세**
- 설정집 카테고리 select 구현 시, option 상수화
```typescript
export const CATEGORY_OPTIONS = [
    { value: 'character', label: '캐릭터' },
    { value: 'place', label: '장소' },
    { value: 'item', label: '아이템' },
    { value: 'event', label: '사건' },
];
```
```typescript
<select
    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
    value={note.category}
    onChange={(e) => updateNote(idx, { category: e.target.value })}
>
    {CATEGORY_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
            {option.label}
        </option>
    ))}
</select>
```

- 태그 입력 구현
  - 해시로 태그 색상 배열을 저장한다.
  - note.tags를 map으로 돌려 태그 색상을 적용한 span 요소들을 출력한다.

```typescript
{/* 태그 섹션 */}
<div className="space-y-2">
    <label className="text-xs font-medium text-slate-600">태그</label>

    {/* 태그 목록 */}
    <div className="flex flex-wrap gap-2 min-h-[32px]">
        {(note.tags || []).map((tag, tagIdx) => (
            <span
                key={tagIdx}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTagColor(tag)}`}
            >
                {tag}
                <button
                    onClick={() => handleRemoveTag(idx, tag)}
                    className="hover:opacity-70 focus:outline-none"
                    title="태그 삭제"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>
            </span>
        ))}
    </div>

    {/* 태그 추가 입력 */}
    <input
        type="text"
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
        value={tagInputs[note.id] || ''}
        onChange={(e) => updateTagInput(note.id, e.target.value)}
        onKeyDown={(e) => handleTagKeyDown(e, idx, note.id)}
        placeholder="태그 입력 후 Enter"
    />
</div>
```
```typescript
const updateTagInput = (id: string, value: string) => {
    setTagInputs(prev => ({ ...prev, [id]: value }));
}

// 태그 추가 핸들러
const handleAddTag = (noteIdx: number, noteId: string) => {
    const tagValue = tagInputs[noteId]?.trim();
    if (!tagValue) return;

    const currentTags = lorebook[noteIdx].tags || [];
    if (!currentTags.includes(tagValue)) {
        updateNote(noteIdx, { tags: [...currentTags, tagValue] });
    }

    // 입력 필드 초기화
    setTagInputs(prev => ({ ...prev, [noteId]: '' }));
};

// 태그 삭제 핸들러
const handleRemoveTag = (noteIdx: number, tagToRemove: string) => {
    const currentTags = lorebook[noteIdx].tags || [];
    updateNote(noteIdx, { tags: currentTags.filter(tag => tag !== tagToRemove) });
};

// Enter 키로 태그 추가
const handleTagKeyDown = (e: React.KeyboardEvent, noteIdx: number, noteId: string) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag(noteIdx, noteId);
    }
};

// 태그 색상 배열 (다양한 색상)
const tagColors = [
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-green-100 text-green-700 border-green-300',
    'bg-purple-100 text-purple-700 border-purple-300',
    'bg-pink-100 text-pink-700 border-pink-300',
    'bg-yellow-100 text-yellow-700 border-yellow-300',
    'bg-indigo-100 text-indigo-700 border-indigo-300',
    'bg-red-100 text-red-700 border-red-300',
    'bg-orange-100 text-orange-700 border-orange-300',
];

// 태그 이름을 기반으로 색상 선택 (일관성 유지)
const getTagColor = (tag: string) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return tagColors[hash % tagColors.length];
};

```

#### 💡 **개념 정리**  
1) lucide-react 
- Lucide-react는 React 프로젝트에서 사용할 수 있는 오픈소스 아이콘 라이브러리
- 단순히 아이콘 모음이 아닌, React 컴포넌트로 제공되기 때문에 React의 특성을 살려 동적으로 아이콘 조작 가능
- 참고 링크 : https://lucide.dev/guide/packages/lucide-react
- 설치
```bash
npm install lucide-react
```
- 커스터마이징
```typescript
import { Heart } from 'lucide-react';

function CustomizedIcon() {
  return (
    <Heart
      size={32}
      color="red"
      strokeWidth={3}
      className="my-icon"
    />
  );
}
```
- size: 아이콘의 크기를 픽셀 단위로 지정.
- color: 아이콘의 색상을 지정.
- strokeWidth: 선의 굵기를 지정.
- className: CSS 클래스를 추가.  
  
<br>

2) useRouteError  

- 라우트 핸들러에서 발생한 에러를 가져오는 훅  
- 참고 링크 : https://reactrouter.com/en/main/hooks/use-route-error
```typescript
const error = useRouteError() as RouteError;
```
<br>

3) shadcn ui
- Radix UI 및 Tailwind CSS를 사용하여 구축된 재사용 가능한 컴포넌트
- 컴포넌트 라이브러리가 아닌 앱에 복사하여 붙여넣을 수 있는 재사용 가능한 컴포넌트 모음
- 설치 참고 : https://ui.shadcn.com/docs/installation/vite
- alias 설정이 필수적이고, components.json, tailwind.config.ts 파일 등의 설정이 필요함

```bash
npx shadcn@latest init
npx shadcn@latest add button
```


---
#### 🔧 해결한 문제
**문제1**: 

**해결**: 


---


#### 📌 내일 할 일
- [ ] 장르 프롬프트 보완
- [ ] 커스터마이징 프롬프트
- [ ] ts-pattern 라이브러리 도입

#### 🚨 이슈/질문
- 


#### 📊 진행률
Week 3: ████████░░░░░ 65%

---
### 📅 2025-12-10 (Day 14)

#### 🎯 오늘의 목표
- [ ] 장르 프롬프트 보완
- [ ] 커스터마이징 프롬프트
- [ ] ts-pattern 라이브러리 도입

#### ✅ 완료한 작업
- ✅ 

**작업 내용 상세**

#### 💡 **개념 정리**  
1) 

---
#### 🔧 해결한 문제
**문제1**: 

**해결**: 


---

#### 📌 내일 할 일
- [ ] 장르 프롬프트 보완
- [ ] 커스터마이징 프롬프트
- [ ] ts-pattern 라이브러리 도입

#### 🚨 이슈/질문
- 


#### 📊 진행률
Week 3: ████████░░░░░ 65%

---