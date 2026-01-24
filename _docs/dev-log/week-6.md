### 📅 2026-01-24 (Day 26)

#### 🎯 오늘의 목표
- [x] vercel 통한 프론트엔드 배포
- [x] render 통한 백엔드 배포
- [x] supabase 통한 데이터베이스 배포

#### ✅ 완료한 작업
- ✅ vercel 통한 프론트엔드 배포
- ✅ render 통한 백엔드 배포
- ✅ supabase 통한 데이터베이스 배포

#### 📝 작업 상세
1) render 배포
    - render 프로젝트 셋팅
    - settings에서 root directory 설정 : backend
    - Build & Deploy
    ```bash
    <!-- Build Command -->
    npm install && npm run build
    <!-- Start Command -->
    npm run start
    ```
    - backend 환경변수 셋팅
        - DB 관련 환경변수를 supabase에서 받은 값으로 셋팅
        - render는 고정 포트를 쓰므로 port 번호는 환경변수 셋팅할 필요 없다.

2) supabase DB 셋팅
    - render용 DB로 supabase를 선택한 이유
        - Mysql을 지원하는 Railway, PlanetScale을 고려했으나, PlanetScale은 무료 플랜이 없고, Railway는 초기 무료 제공 크레딧 소진 후엔 과금 전환
        - Supabase는 영구 무료 플랜이고 인증/스토리지 같은 풀스택 기능 포함한다.
        - 그러나 MySQL이 아니라 PostgreSQL을 지원하여 코드나 ORM 세팅을 Postgres로 맞춰야 함
    - Supabase 프로젝트 생성 → DB 생성됨 → Host 값이 생김 → DBeaver에 입력

3) MySQL => PostgreSQL 마이그레이션
    - MySQL 드라이버 제거 : `npm uninstall mysql mysql2`
    - postgresql 드라이버 설치 : `npm install pg`
    - TypeORM DataSource 수정 / ssl 셋팅
    ```typescript
    export const AppDataSource = new DataSource({
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false,
        },
        entities: ["dist/entities/**/*.js"],
        migrations: ["dist/migrations/**/*.js"],

        synchronize: false,
    });
    ```
    - TypeORM 문법 수정 
    : Users.ts: datetime → timestamp로 수정

    - 기존 마이그레이션 파일 제거 후 postgre 버전으로 마이그레이션 생성
    ```typescript
    npm run migration:generate -- ./src/migrations/intialMigration
    npm run migration:run
    ```

---
#### 🔧 해결한 문제
**문제1**: Supabase PostgreSQL 연결 실패 (IPv6 연결 오류)

**원인**: 
```bash
Error: connect ENETUNREACH 2406:da12:b78:de0d:dad9:6fd4:8488:19e8:5432
```
- Render가 Supabase에 연결 시 IPv6 주소로 시도하다가 실패
- DNS 해석 시 IPv6를 우선 사용하여 네트워크 접근 불가

**해결**: Supabase Connection Pooler 사용 (ORM 전용)
```bash
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

---
**문제2**: TypeORM MigrationInterface import 오류

**원인**: 
```bash
SyntaxError: The requested module 'typeorm' does not provide an export named 'MigrationInterface'
```
**해결**: Migration 파일 import 수정
```typescript
// 기존
import { MigrationInterface, QueryRunner } from "typeorm";

// 수정
import type { MigrationInterface, QueryRunner } from "typeorm";
```
---
**문제3**: Render 빌드 시 타입 정의 파일 누락

**원인**: 
```bash
error TS7016: Could not find a declaration file for module 'express'
```
- Render가 production 모드로 빌드하여 devDependencies 설치 안 함
- @types/* 패키지가 devDependencies에 있어서 빌드 시 사용 불가

**해결**: TypeScript 관련 패키지를 dependencies로 이동

---
**문제4**: Project 생성 시 userId null 제약 조건 위반

**원인**: 
```bash
error: null value in column "userId" of relation "projects" violates not-null constraint
```
- JWT 토큰에서 userId를 제대로 추출하지 못함
- 또는 프로젝트 생성 시 user 관계를 제대로 설정하지 않음
- CORS/쿠키 전송 문제로 인증 토큰이 서버에 도달하지 않을 가능성

**해결**: projectController.ts 수정
```typescript
const newProject = projectRepository.create({
    title,
    description,
    genre,
    synopsis: '',
    lorebook: [],
    user  // user 객체 직접 할당
});
```
---

#### 💡 **개념 정리**

**참고 링크**


#### 📌 내일 할 일
- 

#### 📌 디벨롭 사항
- [ ] 글쓰기 애니메이션
- [ ] 사용자정의 프롬프트 구현 
- [ ] 사용자 인증 시스템 구현
- [ ] 백엔드 에러 핸들링 개선
- [ ] 작성 글 내보내기
- [ ] 배포하기


#### 📝 피드백 내용
- 글쓰기 애니메이션
    - 스트림 형식 / 잘라서 눈속임

- database.ts
    - 타입 형식 : 카멜 - 스네이크 맞추기

- ai 생성 시 스크롤 맨 밑으로 이동하도록 구현


#### 📊 진행률
Week 6: ████████████░░ 88%

---