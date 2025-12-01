### 📅 2025-11-11 (Day 0)

#### 🎯 오늘의 목표
- [x] AI 툴 활용해서 UI 화면 그리기

#### ✅ 완료한 작업
- ✅ AI 툴 활용해서 UI 화면 그리기

#### 💡 배운 것
**v0 app 활용**
- vercel에서 개발한 UI 만들어주는(실제로는 개발부터 DB연결 배포까지 다 해주는) v0 앱을 알아봤다.

**새로 알게 된 개념**
- 현존하는 소설쓰기 ai 앱의 UI와 설정 기능들을 알아보고 UI 및 기능 설계에 참고했다.

#### 🔧 해결한 문제
**문제**:  
**해결**: 

**참고 링크**:   
[v0](https://v0.app/)  
[수도라이트](https://sudowrite.com/)  
[노벨AI](https://sudowrite.com/)


#### 📌 내일 할 일
- [ ] 개발 환경 셋팅

#### 🚨 이슈/질문
- 

#### 📊 진행률
Week 1: █░░░░░░░░░░░░ 1%

---

### 📅 2025-11-17 (Day 1)

#### 🎯 오늘의 목표
- [x] Node.js + Express + TypeScript 프로젝트 초기화
- [x] 필요한 패키지 설치
  - express, typescript, ts-node, @types/node, @types/express
  - typeorm, mysql2 (MariaDB 드라이버), reflect-metadata
  - dotenv, cors, @types/cors
- [x] tsconfig.json 설정
- [x] 기본 서버 구동 확인
- [x] 환경 변수 설정 (.env)

#### ✅ 완료한 작업
- ✅ Node.js + Express + TypeScript 프로젝트 초기화
- ✅ 필요한 패키지 설치
  - express, typescript, ts-node, @types/node, @types/express
  - typeorm, mysql2 (MariaDB 드라이버), reflect-metadata
  - dotenv, cors, @types/cors
- ✅ tsconfig.json 설정
- ✅ 기본 서버 구동 확인
- ✅ 환경 변수 설정 (.env)
- ✅ MariaDB 데이터베이스 생성

#### 💡 배운 것
**모듈 호출 방법 import vs require**
- require : CommonJS에서 사용하는 모듈을 불러오는 키워드. 동기적 작동
- import : JS의 ES6 문법으로 다른 패키지 안에 있는 클래스, 메소드, 변수 등의 데이터를 사용하고자 할 때 쓰는 키워드. 비동기적 작동

**새로 알게 된 개념**
- .


#### 🔧 해결한 문제
**문제**:  
**해결**: 

**참고 링크**: 


#### 📌 내일 할 일
- [ ] 설치한 패키지 하나씩 공부하기
- [ ] 데이터베이스 설계

#### 🚨 이슈/질문
- 

#### 📊 진행률
Week 1: █░░░░░░░░░░░░ 1%

---
### 📅 2025-11-19 (Day 2)

#### 🎯 오늘의 목표
- [ ] 설치한 패키지 하나씩 공부하기
- [ ] 데이터베이스 설계
- [ ] TypeORM 연결 설정
- [x] Entity 정의
  - Users Entity
  - Projects Entity
  - Paragraphs Entity
- [x] 관계 설정 (OneToMany, ManyToOne)
- [ ] 마이그레이션 생성 및 실행

#### ✅ 완료한 작업
- ✅ ERD 그리기 : Entity 정의 및 관계 설정

<img width="541" height="740" alt="Image" src="https://github.com/user-attachments/assets/080c9189-70dd-4e04-95d3-1d0d2d35affc" />  
  
  
  
#### 💡 배운 것


**새로 알게 된 개념**
- .


#### 🔧 해결한 문제
**문제**:  
**해결**: 

**참고 링크**: 


#### 📌 내일 할 일
- [ ] 설치한 패키지 하나씩 공부하기
- [ ] 데이터베이스 설계

#### 🚨 이슈/질문
- 테이블 관계 설정 시 식별자, 비식별자 관계
- 회원 -> 프로젝트 -> 단락 순으로 서로 종속 관계인데, 단락 테이블에 회원id, 프로젝트id 다 포함이 맞나?

#### 📊 진행률
Week 1: █░░░░░░░░░░░░ 1%

---
### 📅 2025-11-25 (Day 3)

#### 🎯 오늘의 목표
- [ ] 설치한 패키지 하나씩 공부하기
- [x] 데이터베이스 설계
- [x] TypeORM 연결 설정
- [x] Entity 정의
  - Users Entity
  - Projects Entity
  - Paragraphs Entity
- [x] 관계 설정 (OneToMany, ManyToOne)
- [ ] 마이그레이션 생성 및 실행

#### ✅ 완료한 작업
- ✅ TypeORM 연결 설정
- ✅ Entity 정의
  - Users Entity
  - Projects Entity
  - Paragraphs Entity
- ✅ 관계 설정 (OneToMany, ManyToOne)

<img width="552" height="760" alt="Image" src="https://github.com/user-attachments/assets/f44f6d67-0fc4-4537-8485-56530b81d1bf" />
  
  
  
#### 💡 배운 것
- TypeORM 연결 설정하는 법
  - .env 파일에 데이터베이스 정보 입력
  - data-source.ts 파일에 DataSource 모듈 이용하여 데이터베이스 연결 설정
  - initDataSource 함수를 이용하여 데이터베이스 연결 초기화
- Entity 정의하기
  - @Entity() 데코레이터를 이용하여 Entity 정의
  - @PrimaryGeneratedColumn() 데코레이터를 이용하여 Primary Key 정의
  - @Column() 데코레이터를 이용하여 Column 정의
  - @JoinColumn() 데코레이터를 이용하여 Join Column 정의 (생략 가능)
  - @CreateDateColumn() 데코레이터를 이용하여 Create Date Column 정의
  - @UpdateDateColumn() 데코레이터를 이용하여 Update Date Column 정의
- 관계 설정 (OneToMany, ManyToOne)
  - @OneToMany() 데코레이터를 이용하여 OneToMany 관계 설정 (생략 가능)
  - @ManyToOne() 데코레이터를 이용하여 ManyToOne 관계 설정. 
    옵션으로 {onDelete: 'CASCADE'} 사용 가능

**새로 알게 된 개념**
- Definite Assignment Assertion 
  - strictPropertyInitialization 옵션이 true일 때, 클래스의 모든 필드가 반드시 초기화되어야 한다. 이를 위해 !를 사용한다.  
  TypeScript에게 **"이 변수는 실행 시점에 무조건 값이 할당될 거니까 에러 띄우지 마"**라고 알려주는 역할


#### 🔧 해결한 문제
**문제**:  “Property 'xxx' has no initializer and is not definitely 
assigned in the constructor” 오류 발생

**해결**: strictPropertyInitialization 옵션이 true일 때, 클래스의 모든 필드가 반드시 초기화되어야 한다는 규칙 때문.  
Definite Assignment Assertion(!) 사용해 알아서 초기화한다고 알려준다.

**참고 링크**: https://typeorm.io/docs/getting-started


#### 📌 내일 할 일
- [ ] 설치한 패키지 하나씩 공부하기
- [ ] 마이그레이션 생성 및 실행
- [ ] 라우터 구조 설계
- [ ] Project CRUD API
  - POST /api/projects (프로젝트 생성)
  - GET /api/projects (프로젝트 목록)
  - GET /api/projects/:id (프로젝트 상세)
  - PUT /api/projects/:id (프로젝트 수정)
  - DELETE /api/projects/:id (프로젝트 삭제)
- [ ] Postman/Insomnia로 API 테스트
- [ ] 에러 핸들링 미들웨어 추가

#### 🚨 이슈/질문
- .

#### 📊 진행률
Week 1: █░░░░░░░░░░░░ 1%

---
### 📅 2025-11-26 (Day 4)

#### 🎯 오늘의 목표
- [ ] 설치한 패키지 하나씩 공부하기
- [ ] 마이그레이션 생성 및 실행
- [ ] 라우터 구조 설계
- [ ] Project CRUD API
  - POST /api/projects (프로젝트 생성)
  - GET /api/projects (프로젝트 목록)
  - GET /api/projects/:id (프로젝트 상세)
  - PUT /api/projects/:id (프로젝트 수정)
  - DELETE /api/projects/:id (프로젝트 삭제)
- [ ] Postman/Insomnia로 API 테스트
- [ ] 에러 핸들링 미들웨어 추가

#### ✅ 완료한 작업
- ✅ typeORM 초기화 서버실행, DB 테이블 생성 및 수정
  
  
  
#### 💡 배운 것
- 

**새로 알게 된 개념**
- CORS(Cross-Origin Resource Sharing)
  - 서버가 어떤 사이트(도메인)에서 오는 요청을 허용할지, 어떤 HTTP 메서드(GET, POST 등)를 허용할지 등의 규칙을 쉽게 정할 수 있게 도와주는 기능
  - 사용 이유
    - 웹 브라우저에는 **동일 출처 정책(SOP, Same-Origin Policy)**이라는 보안 규칙이 있어 웹 페이지는 자신과 **같은 출처(Origin)**의 서버로만 데이터를 요청할 수 있다. (예: localhost:3000 ↔ localhost:3000)
    - 문제 상황: 요즘 개발 환경은 프론트엔드(localhost:3000)와 백엔드(localhost:4000)를 따로 띄우는 경우가 많다. 이때 포트 번호가 다르므로 브라우저는 이를 다른 출처로 인식하고, 보안을 위해 요청을 차단해 버린다.
    - 해결책: 서버에서 "이 출처(localhost:3000)는 안전하니 요청을 허용해줘!"라고 브라우저에게 알려줘야 하는데, 이 설정을 위해 cors 패키지를 사용한다.


#### 🔧 해결한 문제
**문제**:  

**해결**: 

**참고 링크**:


#### 📌 내일 할 일
- [ ] 설치한 패키지 하나씩 공부하기
- [ ] 마이그레이션 생성 및 실행
- [ ] 라우터 구조 설계
- [ ] Project CRUD API
  - POST /api/projects (프로젝트 생성)
  - GET /api/projects (프로젝트 목록)
  - GET /api/projects/:id (프로젝트 상세)
  - PUT /api/projects/:id (프로젝트 수정)
  - DELETE /api/projects/:id (프로젝트 삭제)
- [ ] Postman/Insomnia로 API 테스트
- [ ] 에러 핸들링 미들웨어 추가

#### 🚨 이슈/질문
- typeORM 마이그레이션 실제 현업 워크플로우
  - 개발 시에는 synchronize: true로 설정하는 게 나은지
- typeORM 컬럼(카멜) 명명규칙과 DB 명명규칙(스네이크) 통일?

#### 📊 진행률
Week 1: █░░░░░░░░░░░░ 2%

---
### 📅 2025-11-30 (Day 5)

#### 🎯 오늘의 목표
- [ ] OpenAI API 연동

#### ✅ 완료한 작업
- ✅ OpenAI API 연동
  
  
  
#### 💡 배운 것
- 

**새로 알게 된 개념**
- 


#### 🔧 해결한 문제
**문제**:  

**해결**: 

**참고 링크**:
- OpenAI API
  - [API 문서](https://platform.openai.com/docs)
  - [Playground](https://platform.openai.com/playground)
  - [Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)


#### 📌 내일 할 일
- AI 글쓰기 핵심 기능
  - [ ] Paragraph 엔티티 및 리포지토리 구현
  - [ ] 글쓰기 세션 API (/write) 생성
  - [ ] 컨텍스트 관리 구현 (시놉시스/설정집)

#### 🚨 이슈/질문
- 

#### 📊 진행률
Week 1: █░░░░░░░░░░░░ 3%
