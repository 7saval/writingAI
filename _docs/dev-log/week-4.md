
### 📅 2025-12-26 (Day 16)

#### 📝 피드백 내용
- 글쓰기 애니메이션
    - 스트림 형식 / 잘라서 눈속임

- database.ts
    - 타입 형식 : 카멜 - 스네이크 맞추기

- ai 생성 시 스크롤 맨 밑으로 이동하도록 구현

#### 🎯 오늘의 목표
- [ ] 로그인, 회원가입 기능 구현

#### ✅ 완료한 작업
- ✅ 헤더에 유저 아이콘 드롭다운 메뉴 구현
- ✅ 로그인 페이지 구현


#### 📝 작업 상세
- shadcn/ui DropdownMenu 사용해 헤더에 유저 아이콘 드롭다운 메뉴 구현
    - DropdownMenu 사용법
        - DropdownMenuTrigger : 버튼을 클릭할 때 드롭다운 메뉴가 나타남
        - DropdownMenuContent : 드롭다운 메뉴의 내용
        - DropdownMenuItem : 드롭다운 메뉴의 항목
        - asChild : 자식 컴포넌트로 전달

    ```typescript
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="rounded-full bg-transparent">
                    <User className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link to="/projects" className="flex items-center gap-2 bg-transparent">
                        <PenLine className="h-4 w-4" />
                        글쓰기
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        로그인
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    ```


#### 💡 **개념 정리**
1) asChild
- Radix UI (shadcn/ui의 기반 라이브러리)에서 사용되는 패턴으로, 불필요한 태그 중첩을 방지하고 자식 컴포넌트에 기능을 위임할 때 사용
- "나(DropdownMenuTrigger)를 렌더링하지 말고, 내 기능을 바로 아래 자식에게 물려줘라" 라는 의미

2) `min-h-full` vs `min-h-screen`
- min-h-full : 뷰포트의 높이를 기준으로 최소 높이를 설정
- min-h-screen : 화면의 높이를 기준으로 최소 높이를 설정  

※ flex-1 : flexbox의 flex-grow 속성과 동일. flex-item이 flex-container의 남은 공간을 얼마나 차지할 것인지를 결정

#### 📌 내일 할 일
- [ ] 로그인, 회원가입, 비밀번호 찾기 API 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

#### 📌 디벨롭 사항
- [ ] 글쓰기 애니메이션
- [ ] 사용자정의 프롬프트 구현 
- [ ] 사용자 인증 시스템 구현
- [ ] 백엔드 에러 핸들링 개선
- [ ] 작성 글 내보내기
- [ ] 배포하기

#### 🚨 이슈/질문
- 

#### 📊 진행률
Week 4: ███████████░░░ 80%

---