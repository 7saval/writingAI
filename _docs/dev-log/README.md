# 개발 로그 작성 가이드

## 📁 폴더 구조

```
docs/dev-log/
├── README.md      # 이 파일
├── week-1.md      # 1주차: 환경 설정 & 기본 구조
├── week-2.md      # 2주차: AI 통합 & 핵심 로직
├── week-3.md      # 3주차: Frontend 개발
└── week-4.md      # 4주차: 고급 기능 & 마무리
```

---

## 📝 작성 방법

### 매일 기록할 내용

1. **오늘의 목표**: 하루 시작 전 작성
2. **완료한 작업**: 하루 마무리하며 체크
3. **배운 것**: 새로 알게 된 개념/기술
4. **내일 할 일**: 다음 작업 미리 계획
5. **이슈/질문**: 막힌 부분, 궁금한 점

### 작성 시간

- **아침 (5분)**: 오늘의 목표 작성
- **저녁 (10분)**: 나머지 항목 작성

### 시놉시스/설정집 기록 규칙
- 글쓰기 화면 우측 패널(시놉시스 & 설정집)에 변경이 생기면 **완료한 작업** 또는 **배운 것** 섹션에 요약을 남긴다.
- 시놉시스는 "줄거리 방향", 설정집은 "인물/세계/규칙"처럼 태그를 붙여 `[Synopsis]`, `[Lore]` 접두사를 사용한다.
- AI 컨텍스트에 포함/제외 토글을 조정했다면 이유를 한 줄로 메모해 두면 나중에 프롬프트 품질을 추적하기 쉽다.
- 큰 수정이 있을 땐 변경 전/후 차이를 코드 블록 대신 리스트로 정리하고, 관련 커밋/버전 링크를 남긴다.

---

## 📋 일일 로그 템플릿

각 주차 파일(`week-N.md`)에 아래 템플릿을 복사해서 사용하세요:

```markdown
### 📅 YYYY-MM-DD (Day N)

#### 🎯 오늘의 목표
- [ ] 작업 1
- [ ] 작업 2
- [ ] 작업 3

#### ✅ 완료한 작업
- ✅ TypeScript 설정 완료
- ✅ Express 서버 기본 구조 작성
- ⚠️ TypeORM 연결 (부분 완료)

#### 💡 배운 것
**TypeORM 데코레이터**
- `@Entity()`: 데이터베이스 테이블과 매핑
- `@PrimaryGeneratedColumn()`: 자동 증가 ID
- `@Column()`: 테이블 컬럼 정의

**새로 알게 된 개념**
- TypeScript의 `reflect-metadata`가 필요한 이유
- Express 미들웨어 체인 순서의 중요성

#### 🔧 해결한 문제
**문제**: TypeORM 연결 시 "Cannot find module" 에러
**해결**: tsconfig.json에 `"emitDecoratorMetadata": true` 추가

**참고 링크**: https://typeorm.io/...

#### 📌 내일 할 일
- [ ] User Entity 완성
- [ ] Project Entity 작성
- [ ] 관계 설정 (OneToMany, ManyToOne)

#### 🚨 이슈/질문
- TypeORM 마이그레이션 자동 생성 방법이 헷갈림
- JWT 토큰 만료 시간 설정 기준은?

#### 📊 진행률
Week 1: ████░░░░░░ 40%

---
```

---

## 🎯 작성 팁

### 1. 구체적으로 작성하기

❌ **나쁜 예**:
```markdown
- 오늘 API 만들었음
- 에러 해결함
```

✅ **좋은 예**:
```markdown
- POST /api/projects 엔드포인트 구현
  - title, description, genre 받아서 DB 저장
  - 유효성 검사 추가
- TypeORM 연결 에러 해결
  - tsconfig.json의 decorator 설정 누락이 원인
```

---

### 2. 코드 스니펫 포함하기

중요한 코드나 설정은 꼭 기록하세요:

```markdown
#### 💡 배운 것

**TypeORM Entity 관계 설정**
\`\`\`typescript
@Entity()
export class Project {
  @OneToMany(() => Paragraph, paragraph => paragraph.project)
  paragraphs: Paragraph[];
}

@Entity()
export class Paragraph {
  @ManyToOne(() => Project, project => project.paragraphs)
  project: Project;
}
\`\`\`
```

---

### 3. 에러와 해결 방법 자세히 기록

나중에 비슷한 에러를 만났을 때 큰 도움이 됩니다:

```markdown
#### 🔧 해결한 문제

**에러 메시지**:
\`\`\`
Error: Cannot read property 'then' of undefined
at projectController.ts:15
\`\`\`

**원인**: 
- async 함수에서 await 키워드 빠뜨림

**해결**:
\`\`\`typescript
// Before
const project = projectRepository.save(newProject);

// After
const project = await projectRepository.save(newProject);
\`\`\`

**시간**: 30분 소요
**참고**: TypeScript strict mode에서 Promise 타입 체크 확인 필요
```

---

### 4. 학습 자료 링크 저장

유용한 자료는 꼭 링크를 남기세요:

```markdown
#### 📚 참고한 자료
- [TypeORM Relations 가이드](https://typeorm.io/relations)
- [Express Error Handling 베스트 프랙티스](https://...)
- [Stack Overflow: TypeORM 마이그레이션](https://...)
```

---

### 5. 주간 회고 작성 (주말)

각 주차 마지막에 회고를 추가하세요:

```markdown
## 🎉 Week 1 회고 (YYYY-MM-DD)

### 이번 주 성과
- ✅ 개발 환경 구축 완료
- ✅ 데이터베이스 설계 완료
- ✅ 기본 API 3개 구현

### 잘한 점
- 매일 꾸준히 개발 로그 작성
- 에러 만났을 때 당황하지 않고 문서 먼저 확인
- TypeORM 공식 문서 꼼꼼히 읽음

### 아쉬운 점
- 계획보다 1일 늦어짐
- Git 커밋을 너무 크게 함

### 다음 주 목표
- AI API 통합 완료
- 글쓰기 세션 API 구현
- 커밋을 더 작은 단위로

### 배운 핵심 개념
1. TypeORM Entity 관계 설정
2. Express 미들웨어 패턴
3. TypeScript 제네릭 활용

### 예상 시간 vs 실제 시간
- 환경 설정: 2일 예상 → 2일 소요 ✅
- DB 설계: 2일 예상 → 3일 소요 ⚠️
- API 구현: 3일 예상 → 2일 소요 ✅
```

---

## 📊 진행률 표시 방법

각 일일 로그 마지막에 진행률을 표시하세요:

```markdown
#### 📊 진행률
Week 1: ████████░░ 80% (Day 6/7)
전체:   ██░░░░░░░░ 20% (Week 1/4)
```

**계산 방법**:
- 주차 진행률: (현재 날짜 / 7) × 100
- 전체 진행률: (완료 주차 / 4) × 100

---

## 🎨 마크다운 스타일 가이드

### 이모지 활용
- 📅 날짜
- 🎯 목표
- ✅ 완료
- ⚠️ 부분 완료
- ❌ 미완료
- 💡 배운 것
- 🔧 문제 해결
- 📌 할 일
- 🚨 이슈
- 📊 진행률
- 🎉 회고
- 📚 참고 자료
- 💻 코드
- 🐛 버그
- ⚡ 성능
- 🎨 UI/UX

### 체크박스
```markdown
- [ ] 미완료 작업
- [x] 완료된 작업
- [~] 진행 중 (선택)
```

### 강조
```markdown
**굵게**: 중요한 키워드
`코드`: 함수명, 파일명, 명령어
> 인용: 중요한 메모나 경고
```

---

## 🔍 검색 가능하게 작성하기

나중에 Ctrl+F로 찾기 쉽게 키워드를 일관되게 사용하세요:

```markdown
# 권장 키워드
[에러]: TypeORM 연결 에러
[해결]: async/await 수정
[TODO]: 마이그레이션 학습 필요
[성능]: 쿼리 최적화 완료
[리팩토링]: 컨트롤러 분리
```

---

## 📱 모바일에서 작성하기

GitHub 앱이나 모바일 에디터를 사용하면 이동 중에도 작성 가능:

- **GitHub Mobile**: 직접 파일 수정
- **Working Copy** (iOS): Git 클라이언트
- **MGit** (Android): Git 클라이언트

---

## 💾 백업 & 버전 관리

### Git 커밋 규칙
```bash
# 일일 로그 커밋
git add docs/dev-log/week-1.md
git commit -m "docs: Week 1 Day 3 개발 로그 추가"

# 주간 회고 커밋
git commit -m "docs: Week 1 회고 작성"
```

### 정기 푸시
매일 또는 주말에 GitHub에 푸시하세요:
```bash
git push origin main
```

---

## 🎯 로그 활용 방법

### 1. 매주 금요일: 주간 회고
- 이번 주 성과 정리
- 다음 주 계획 수립

### 2. 프로젝트 종료 후: 전체 회고
- 4주간 모든 로그 리뷰
- 포트폴리오 작성 시 참고
- 기술 블로그 글감

### 3. 면접 준비
- "프로젝트에서 어떤 문제를 해결했나요?"
- "가장 어려웠던 부분은?"
→ 로그에서 구체적인 사례 찾기

### 4. 다음 프로젝트
- 같은 에러 반복 방지
- 시간 예측 정확도 향상
- 배운 내용 복습

---

## 📈 성장 추적

매주 마지막에 체크하세요:

```markdown
### 기술 스택 숙련도
- TypeScript: ⭐⭐⭐☆☆ → ⭐⭐⭐⭐☆
- TypeORM: ⭐☆☆☆☆ → ⭐⭐⭐☆☆
- React: ⭐⭐☆☆☆ → ⭐⭐☆☆☆
- OpenAI API: ⭐☆☆☆☆ → ⭐⭐☆☆☆

### 이번 주 새로 배운 기술
1. TypeORM Relations
2. Express 미들웨어 패턴
3. JWT 인증

### 다음 주 학습 목표
1. OpenAI API 프롬프트 엔지니어링
2. React Hooks 심화
3. 에러 핸들링 패턴
```

---

## ✨ 동기 부여 팁

### 작은 성취도 기록하기
```markdown
#### 🎉 오늘의 작은 성취
- 처음으로 TypeORM Entity 관계를 혼자 설정함!
- 2시간 걸렸던 에러를 30분 만에 해결
- planning.md 체크리스트 3개 완료
```

### 어려웠던 순간도 솔직하게
```markdown
#### 😫 힘들었던 점
- TypeORM 문서가 이해 안 돼서 3시간 헤맴
- 에러 메시지가 너무 불친절함
→ 하지만 결국 해결! 성장의 과정이라 생각하자
```

---

## 🎓 예시 로그

`week-1.md` 파일의 실제 작성 예시는 별도로 제공됩니다.

첫 주 Day 1-2의 예시를 참고해서 본인만의 스타일로 작성하세요!

---

## 📞 도움이 필요할 때

- 로그 작성이 어려우면 처음엔 간단하게라도 시작
- 꾸준함이 완벽함보다 중요
- 나중에 보는 '미래의 나'를 위해 작성
- 막히는 부분은 언제든 질문하세요!

---

**Happy Coding! 🚀**

프로젝트 완료 후 이 로그들이 큰 자산이 될 거예요!