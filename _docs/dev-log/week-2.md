### 📅 2025-12-01 (Day 6)

#### 🎯 오늘의 목표
- AI 글쓰기 핵심 기능
  - [x] OpenAI 세팅
  - [ ] 글쓰기 세션 API (/write) 생성
  - [ ] 컨텍스트 관리 구현 (시놉시스/설정집)

#### ✅ 완료한 작업
- ✅ OpenAI 세팅
  
  
  
#### 💡 배운 것
- chat.completions.create() 메소드
    - OpenAI의 Chat Completions API를 호출해서 AI가 답변(텍스트)을 생성하도록 요청하는 함수

| 필드           | 의미                             |
| ------------ | ------------------------------ |
| `model`      | 사용할 AI 모델 (여기서는 `gpt-4o-mini`) |
| `messages`   | 대화 메시지 배열 — 시스템/유저/어시스턴트 역할 포함 |
| `max_tokens` | 모델이 생성할 수 있는 최대 토큰 수(출력 길이 제한) |

- messages 필드
  - 시스템 메시지: AI에게 어떤 역할을 할 것인지 알려주는 메시지
  - 유저 메시지: 사용자가 입력한 메시지
  - 어시스턴트 메시지: AI가 생성한 응답

- client.chat.completions.create vs client.responses.create 차이

| 항목        | `chat.completions.create`                     | `responses.create`     |
| --------- | --------------------------------------------- | ---------------------- |
| 사용 방식     | 이전 Chat API 스타일                               | 새로운 **Responses API**  |
| 메시지 전달 방식 | `{role: system/user/assistant, content: ...}` | 단일 `input` 또는 구조적 입력   |
| 목적        | 대화형 모델 중심                                     | 텍스트/JSON/이미지 생성까지 통합   |


**새로 알게 된 개념**
- 

#### 🔧 해결한 문제
**문제**: 현재 설치된 OpenAI 패키지가 v4 구조(resources/chat/completions) 기반이라 client.responses.create() 를 쓰면 에러가 난다.

**원인**: Responses API가 SDK v4에 포함되지 않음. v5로 업그레이드하거나, client.chat.completions.create()를 사용해야 함.

**과정**: 현재 소설쓰기 프로젝트에서 버전업이 나을지, 버전 유지가 나을지 선택하기 위해 핵심 고려 요소를 비교해보았다. 이미지나 오디오로 확장할 가능성은 낮고, 이전 메시지 누적 기능이 가장 필요하므로 messages 배열에 자연스럽게 기록해 관리할 수 있는 v4 버전을 유지하기로 결정했다.

💡 핵심 고려 요소
| 요소           | chat.completions(v4)  | responses(v5 최신)     |
| ------------ | --------------------- | -------------------- |
| 단락 단위 텍스트 생성 | 매우 안정적                | 문제 없음                |
| 대화 맥락 유지     | 구조적으로 최적화됨            | input 하나에 압축 필요      |
| 이전 메시지 누적    | messages 배열에 자연스럽게 기록 | 개발자가 직접 컨텍스트 관리 권장   |
| API 안정성      | 성숙함 (버그 적음)           | 빠르게 발전 중 (변경 가능성 있음) |
| 장기 확장성       | 제한적                   | 강력 (JSON, 이미지, 오디오)  |


**해결**: client.chat.completions.create()를 사용

**코드 변경**:
- `client.responses.create` 사용
```typescript

    const response = await client.responses.create({
        model: 'gpt-4o-mini',
        input: [
            { role: 'system', content: '당신은 협업 소설 작가입니다.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.8,   // 창의성
        max_output_tokens: 500, // 출력 길이 제한
    });

    return response.output_text;
```

- `client.chat.completions.create` 사용
```typescript

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: '당신은 협업 소설 작가입니다.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.8,   // 창의성
        max_tokens: 500, // 출력 길이 제한
    });

    return response.choices[0].message.content;
```

**참고 링크**:
- OpenAI API
  - [API 문서](https://platform.openai.com/docs)
  - [Playground](https://platform.openai.com/playground)
  - [Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)


#### 📌 내일 할 일
- AI 글쓰기 핵심 기능
  - [ ] 글쓰기 세션 API (/write) 생성
  - [ ] 컨텍스트 관리 구현 (시놉시스/설정집)

#### 🚨 이슈/질문
- 

#### 📊 진행률
Week 2: ██░░░░░░░░░░░ 10%

---
### 📅 2025-12-02 (Day 7)

#### 🎯 오늘의 목표
- AI 글쓰기 핵심 기능
  - [x] 글쓰기 세션 API (/writing) 생성
  - [x] 컨텍스트 관리 구현 (시놉시스/설정집)

#### ✅ 완료한 작업
- ✅ 글쓰기 세션 API (/writing) 생성
- ✅ 프로젝트 API (/projects) 생성
- ✅ 컨텍스트 관리 구현 (시놉시스/설정집)
- ✅ postman API 테스트
  
  
  
#### 💡 배운 것
- typeORM에서 find, findone, findoneBy 차이
  - 여러 개를 가져와야 한다면? 👉 find
  - 하나만 가져오는데, Join(relations)이나 정렬, 특정 컬럼 선택이 필요하다면? 👉 findOne
  - 하나만 가져오는데, 단순히 **조건(where)**만 필요하다면? 👉 findOneBy


|     메서드	  | 반환 타입	      | 설명                  | 주요 특징           |
| ------------ | ---------------| -------------------- | ------------------ |
| find         | Entity[] (배열)| 조건에 맞는 모든 데이터를 가져옵니다. |	결과가 없으면 빈 배열 []을 반환합니다. |
| findOne	   | Entity \| null	| 조건에 맞는 첫 번째 데이터만 가져옵니다. |	where, relations, select 등 모든 옵션을 사용할 수 있습니다. |
| findOneBy	  | Entity \| null	| 조건에 맞는 첫 번째 데이터만 가져옵니다. |	where 조건만 간단히 넣을 수 있는 단축 메서드입니다. |

- typeORM create, save 차이
  - create: 데이터베이스에 저장하기 전, 엔터티 인스턴스를 메모리 상에서 생성하는 데 사용
  - save: 데이터베이스에 저장하는 데 사용
- express에서 에러 핸들링
  - app.use(errorHandler) 미들웨어로 적용해 서버에서 발생하는 모든 에러를 한 곳에서 처리하도록 함  


**새로 알게 된 개념**
- 

#### 🔧 해결한 문제
**문제1**: createdAt과 updatedAt이 한국 시간으로 표기되지 않음

**원인**: 
1) DB 타임존 설정이 시스템(UTC)으로 되어 있음. 
2) typeORM 설정에서 dateStrings 설정이 안 되어 있음

**해결**: 
1) DB 타임존 설정을 한국 시간으로 변경
2) typeORM 설정에서 dateStrings: true로 설정

```sql
-- 전체 데이터베이스 timezone 설정
SET GLOBAL time_zone = 'Asia/Seoul';

-- 현재 session timezone 설정
SET time_zone = 'Asia/Seoul';

-- 타임존 설정값 조회
SELECT @@global.time_zone, @@session.time_zone;
```

```typescript
export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3307),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Project, Paragraph],
    synchronize: true,     // 운영 전환 시 true → false
    logging: true,
    dateStrings: true,  // 날짜 형식대로 표기
});
```
---
**문제2**: 시간이 지나면 lorebook이 null로 초기화되는 문제 발생

**원인**: synchronize: true로 설정되어 있음

- synchronize: true가 하는 일
  - 서버를 재시작할 때마다 TypeORM이 Entity 정의를 보고 데이터베이스 스키마를 자동으로 수정
  - Entity에서 lorebook이 nullable: true로 정의되어 있으면, 기존 데이터를 null로 초기화
  - 특히 JSON 타입 컬럼은 synchronize 과정에서 데이터 손실이 발생하기 쉽다.

**해결**:
1) synchronize: false로 변경  
2) lorebook 기본값 설정 : default: '[]'  
  
**주의사항**
- synchronize: false로 설정하면, 데이터베이스 스키마가 자동으로 수정되지 않으므로 마이그레이션을 사용하여 스키마를 관리해야 함


**참고 링크**:

#### 📌 내일 할 일
- typeORM 마이그레이션 실행
- Vite React 프로젝트 초기화
- Tailwind CSS 및 스타일링 설정
- 프로젝트 목록 페이지 구현
- 글쓰기(라이팅) 세션 UI 구현
- 프론트엔드와 API 연동

#### 🚨 이슈/질문
- user가 쓴 내용에 이어서 ai가 써주길 바랐는데, user가 쓴 내용을 디벨롭하는 방향으로 ai가 써주고 있음
- ai가 쓴 내용이 너무 급발진. 시놉과 설정을 참고하는데 한 순간에 결말까지 가버림  

    


**예시**

```json
{
    "id": 2,
    "title": "당신이 죽였다",
    "description": "친구의 가정폭력을 알고 친구와 함께 친구의 남편을 죽이고 은폐하는 이야기",
    "genre": "스릴러",
    "synopsis": "백화점 VIP 담당 직원 은수는 어느날 절친 희수의 가정폭력 사실을 알게 되고, 남편을 살해할 계획을 세우는데...",
    "lorebook": [
        {
            "category": "character",
            "title": "은수",
            "content": "29세. 백화점 VIP 담당 직원.",
            "tags": [
                "백화점",
                "주인공"
            ]
        }
    ],
    "createdAt": "2025-12-02 20:40:38.391960",
    "updatedAt": "2025-12-02 22:05:54.000000",
    "paragraphs": [
        {
            "id": 3,
            "content": "백화점에서 은수는 결혼 후 연락이 뜸한 절친 희수의 뒷모습을 우연히 본 것 같다.",
            "writtenBy": "user",
            "orderIndex": 0,
            "createdAt": "2025-12-02 21:27:30.698967",
            "updatedAt": "2025-12-02 21:27:30.698967"
        },
        {
            "id": 4,
            "content": "은수는 점심시간을 이용해 백화점의 고급 매장을 돌아다니던 중, 익숙한 뒷모습을 발견했다. 희수의 긴 생머리가 햇빛을 받아 반짝이며, 그녀의 슬픈 어깨선이 그 날의 흐릿한 기분과 어우러졌다. 은수는 잠시 망설이다가, 희수에게 다가가고자 했지만, 주저앉고 말았다. 희수가 남편과의 결혼 생활이 순탄치 않다는 이야기를 들었던 기억이 떠올랐다. 그녀의 눈빛은 언제나 슬픔과 불안으로 가득 차 있었고, 은수는 친구의 곁에 다가가 위로의 말을 건네고 싶었지만, 그 대신 고개를 숙이고 지나쳤다. \n\n하지만 그 순간, 은수의 마음속에 뜨거운 결심이 솟구쳤다. \"희수를 구해줘야 해.\" 그녀는 결심했다. 친구가 겪고 있는 고통을 외면할 수 없었고, 그 원인인 남편을 없애기로 마음먹었다. 은수는 난생처음으로 자신이 사람의 목숨을 빼앗는 계획을 세우고 있다는 사실에 두려움을 느꼈지만, 그보다 더 강하게 희수를 지켜야 한다는 의지가 불타올랐다. 그 날의 결심은 은수가 지금까지 겪어본 어떤 감정보다도 강렬했다.",
            "writtenBy": "ai",
            "orderIndex": 1,
            "createdAt": "2025-12-02 21:27:40.926593",
            "updatedAt": "2025-12-02 21:27:40.926593"
        }
    ]
}

```

#### 📊 진행률
Week 2: ██░░░░░░░░░░░ 15%

---
### 📅 2025-12-03 (Day 8)

#### 🎯 오늘의 목표
- [x] typeORM 마이그레이션 실행
- [x] Vite React 프로젝트 초기화
- [x] Tailwind CSS 및 스타일링 설정
- [ ] 프로젝트 목록 페이지 구현
- [ ] 글쓰기(라이팅) 세션 UI 구현
- [ ] 프론트엔드와 API 연동

#### ✅ 완료한 작업
- ✅ typeORM 마이그레이션 실행
- ✅ Vite React 프로젝트 초기화
- ✅ Tailwind CSS 및 스타일링 설정
  
  
  
#### 💡 배운 것
1) Vite 환경에서 환경 변수 사용법
  - Vite 환경에서는 process.env로 환경변수를 가져올 수 없다.   
  ➡️ import.meta.env 사용
  ```typescript
    // baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api',
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  ```  
  - 환경변수 파일(.env) 작성 또한 주의해야 할 사항이 있는데 반드시 변수명 앞에 VITE_ 접두어가 있어야 공개적으로 접근 가능
  ```
    VITE_API_URL=http://localhost:5000/api
  ```  

<br>

2) Tailwind CSS를 사용하여 스타일링하는 방법
  - Tailwind 기본 모듈 로드 필수 
    - base(전역 스타일) / components(컴포넌트 스타일) / utilities(유틸리티 스타일)
  - Tailwind는 CSS를 layer 단위로 관리


**새로 알게 된 개념**  
---
📚 TypeORM 마이그레이션이란?  
마이그레이션은 데이터베이스 스키마의 변경 이력을 관리하는 버전 관리 시스템으로 데이터베이스 구조 변경을 추적한다.

🎯 마이그레이션의 용도  
1. 데이터베이스 스키마 버전 관리
- 테이블 생성/삭제, 컬럼 추가/수정/삭제 등의 변경 이력을 코드로 관리
- 팀원들과 동일한 DB 구조를 공유
2. 안전한 배포
- 개발 → 스테이징 → 프로덕션 환경으로 DB 변경사항을 안전하게 이동
- 문제 발생 시 롤백 가능
3. 데이터 보존
- synchronize: true는 기존 데이터를 삭제할 수 있지만, 마이그레이션은 데이터를 보존하면서 스키마 변경  

<br>
🔍 생성된 마이그레이션 파일 구조

```typescript
export class InitialMigration1764770977727 implements MigrationInterface {
    // ⬆️ 데이터베이스 스키마 업그레이드
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 엔티티와 실제 DB의 차이를 반영하는 SQL 쿼리들
        await queryRunner.query(`ALTER TABLE ...`);
    }

    // ⬇️ 변경사항 되돌리기 (롤백)
    public async down(queryRunner: QueryRunner): Promise<void> {
        // up()의 반대 작업을 수행하는 SQL 쿼리들
        await queryRunner.query(`ALTER TABLE ...`);
    }
}
```  
<br>
🚀 마이그레이션 사용법  

1️⃣ package.json에 스크립트 추가  
2️⃣ data-source.ts에 migrations 파일 위치 작성  
3️⃣ synchronize: false로 설정  

4️⃣ 마이그레이션 실행 (DB에 적용)
```bash
npm run migration:run
```
동작:

- up() 메서드의 SQL 쿼리들이 실행
- 데이터베이스에 실제로 변경사항이 적용
- migrations 테이블에 실행 이력이 기록

언제 사용?
- 새로운 마이그레이션 파일을 생성한 후
- 다른 개발자가 만든 마이그레이션을 받았을 때
- 새로운 환경(스테이징, 프로덕션)에 배포할 때  

5️⃣ 마이그레이션 되돌리기 (롤백)
```bash
npm run migration:revert
```  

동작:

- 가장 최근에 실행된 마이그레이션의 down() 메서드가 실행
- 한 번 실행할 때마다 하나의 마이그레이션만 되돌린다.

언제 사용?
- 마이그레이션 실행 후 문제가 발생했을 때
- 잘못된 스키마 변경을 취소하고 싶을 때  

6️⃣ 새로운 마이그레이션 생성  

```bash
npm run migration:generate -- ./src/migrations/마이그레이션이름
```

동작:
- 엔티티 정의와 실제 DB를 비교
- 차이점을 자동으로 감지하여 마이그레이션 파일 생성  

언제 사용?
- 엔티티 파일을 수정한 후 (컬럼 추가, 타입 변경 등)

---
#### 🔧 해결한 문제
**문제1**: 

**원인**: 

**해결**: 



**참고 링크**:

#### 📌 내일 할 일
- 프로젝트 목록 페이지 구현
- 글쓰기(라이팅) 세션 UI 구현
- 프론트엔드와 API 연동

#### 🚨 이슈/질문
- 


#### 📊 진행률
Week 2: ██░░░░░░░░░░░ 17%

---
### 📅 2025-12-05 (Day 9)

#### 🎯 오늘의 목표
- [ ] 프로젝트 목록 페이지 구현
- [ ] 글쓰기(라이팅) 세션 UI 구현
- [ ] 프론트엔드와 API 연동

#### ✅ 완료한 작업
- ✅ 
  
  
  
#### 💡 배운 것
1) 


**새로 알게 된 개념**  
---


---
#### 🔧 해결한 문제
**문제1**: 

**원인**: 

**해결**: 



**참고 링크**:

#### 📌 내일 할 일
- 

#### 🚨 이슈/질문
- 


#### 📊 진행률
Week 2: ██░░░░░░░░░░░ 17%

---