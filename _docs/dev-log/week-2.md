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
**문제**: createdAt과 updatedAt이 한국 시간으로 표기되지 않음

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

**참고 링크**:

#### 📌 내일 할 일
- Vite React 프로젝트 초기화
- Tailwind CSS 및 스타일링 설정
- 프로젝트 목록 페이지 구현
- 글쓰기(라이팅) 세션 UI 구현
- 프론트엔드와 API 연동

#### 🚨 이슈/질문
- user가 쓴 내용에 이어서 ai가 써주길 바랐는데, user가 쓴 내용을 디벨롭하는 방향으로 ai가 써주고 있음
- ai가 쓴 내용이 너무 급발진. 시놉과 설정을 참고하는데 한 순간에 결말까지 가버림

#### 📊 진행률
Week 2: ██░░░░░░░░░░░ 15%

---