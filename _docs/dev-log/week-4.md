
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
### 📅 2025-12-27 (Day 17)

#### 🎯 오늘의 목표
- [x] 로그인, 회원가입, 비밀번호 찾기 API 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

#### ✅ 완료한 작업
- ✅ 로그인, 회원가입, 비밀번호 찾기, 초기화 API 구현 및 postman 테스트
- ✅ 프론트 인증 훅 구현
- ✅ 회원가입 페이지 UI 구현


#### 📝 작업 상세
[백엔드]

- bcrypt 모듈로 비밀번호 해싱 작업
    - `npm i --save-dev @types/bcrypt` 로 모듈 설치
    - bcrypt.hash : 비밀번호 해싱
    - bcrypt.compare : 비밀번호 일치 여부 확인
```typescript
// 회원가입 시
const repo = AppDataSource.getRepository(User);
const { email, password, username } = req.body;
const hashed = await bcrypt.hash(password, 10); // 비밀번호 해싱 (보안 강화)
const user = repo.create({ email, username, password: hashed });
await repo.save(user);

// 로그인 시
// 비밀번호 일치 여부
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(StatusCodes.UNAUTHORIZED).json({
    message: '이메일 또는 비밀번호가 일치하지 않습니다.'
});
```

- 로그인 시 jwt 토큰 발급
    - `npm i --save-dev @types/jsonwebtoken` 로 모듈 설치
    - typescript 사용 시 타입을 잘 지정해줘야 함

```typescript
// JWT 토큰 발급
const token = jwt.sign({
    id: user.id,
    email: user.email
}, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as any
});
```

- 비밀번호 찾기
    - Math.random()으로 인증코드 생성
    - DB에 인증코드와 인증코드 만료시간(resetCode, resetCodeExpires) 저장

```typescript
// 인증코드 생성 (6자리 숫자)
const code = Math.floor(100000 + Math.random() * 900000).toString();

// DB에 저장
user.resetCode = code;
user.resetCodeExpires = new Date(Date.now() + 3600 * 1000); // 1시간 후
await repo.save(user);

// 이메일 발송
console.log(`인증코드: ${code}`);
// await emailService.send(email, '비밀번호 초기화 인증코드', code);

```

- 비밀번호 초기화
    - 인증코드 검증 : string으로 타입 변경
    - 만료 시간 검증
    - 비밀번호 해시 적용해 변경
    - 인증코드 초기화

```typescript
// 코드 검증
if (user.resetCode !== code.toString()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
        message: '인증코드가 일치하지 않습니다.'
    });
}

// 만료 시간 검증
if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
        message: '인증코드가 만료되었습니다.'
    });
}

// 비밀번호 변경
const hashed = await bcrypt.hash(newPassword, 10);
user.password = hashed;

// 인증코드 초기화
user.resetCode = null;
user.resetCodeExpires = null;

// 저장
await repo.save(user);

```

[프론트엔드]
- 로컬 스토리지에 토큰 저장 및 가져오는 함수 생성 => zustand로 액션함수 셋팅

```typescript
export const setToken = (token: string) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const removeToken = () => {
    localStorage.removeItem('token');
};

// set함수로 상태 변경
export const useAuthStore = create<StoreState>((set) => ({
    isLoggedIn: getToken() ? true : false,  // 초기값
    storeLogin: (token: string) => {
        set(() => ({ isLoggedIn: true }));
        setToken(token);
    },
    storeLogout: () => {
        set(() => ({ isLoggedIn: false }));
        removeToken();
    }
}));
```
- axios 인터셉트 사용
    - 사용 이유 : 이 코드를 작성해두면, API를 호출할 때마다 헤더에 토큰을 넣어줄 필요가 없어진다. 죽, 로그인된 사용자라면 모든 요청에 자동으로 신분증(토큰)을 붙여서 보내는 자동화 설정
    - 원래는 axios.create에 헤더를 추가했는데, 요청 인터셉트를 추가하여 매 요청마다 최신 토큰을 헤더에 삽입
    

        ```typescript
        // 변경 전
        const axiosInstance = axios.create({
            // baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api',
            baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
            headers: {
                "Content-Type": "application/json",
                Authorization: getToken() ? `Bearer ${getToken()}` : "",
            },
            ...config,
        });
        ```

        ```typescript
        // 변경 후
        // 요청 인터셉터 : 매 요청마다 최신 토큰 헤더에 추가
        axiosInstance.interceptors.request.use((config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        })
        ```

---
#### 💡 **개념 정리**
1) bcrypt란?
- bcrypt는 단방향 해시 알고리즘입니다. 복호화가 불가능하며, 검증 시에는 저장된 해시에서 '솔트(Salt)'를 추출하여 입력된 비밀번호를 동일한 방식으로 다시 해싱한 뒤, 두 해시 값을 비교합니다  

**① 단방향 암호화 (One-way Hash)**  
설명: "비밀번호는 복호화될 필요가 없습니다. 오직 사용자가 입력한 값과 일치하는지만 알면 됩니다. 그래서 다시 평문으로 돌릴 수 없는 단방향 해시를 사용합니다."  
**② 솔팅 (Salting)**  
문제점: 같은 비밀번호(password123)는 항상 같은 해시값(a83fc...)을 가집니다. 해커들은 미리 계산된 표(Rainbow Table)를 이용해 원래 비밀번호를 찾아낼 수 있습니다.  
해결: bcrypt는 해싱할 때마다 **랜덤한 데이터(Salt)**를 섞습니다.
따라서 user A와 user B가 똑같이 비밀번호를 1234로 설정해도, DB에 저장되는 해시값은 서로 다릅니다.  
**③ 키 스트레칭 & 워크 팩터 (Key Stretching & Work Factor)**  
문제점: 컴퓨터 속도가 빨라져서 해커가 무차별 대입(Brute-force)으로 비밀번호를 뚫기 쉬워졌습니다.  
해결: bcrypt는 일부러 연산을 느리게 만듭니다.
Cost Factor(보통 10~12 사용)를 설정하여 해싱 한 번에 걸리는 시간을 조절합니다 (예: 0.1초).
일반 사용자는 로그인에 0.1초가 걸려도 괜찮지만, 1억 개의 비밀번호를 대입해야 하는 해커에게는 치명적인 지연 시간이 됩니다.  

**※ 용어 정리**
- 해시 : 비밀번호를 알아볼 수 없게 변환하는 것
- 솔트 : 똑같은 결과가 나오는 것을 막기 위해 섞는 랜덤값
- 키 스트레칭 : 해커가 빨리 뚫지 못하게 억지로 시간을 끄는 과정
- 코스트 팩터 : 키 스트레칭을 위한 반복 횟수를 조절하는 설정값

2) bcrypt vs crypto
- 가장 큰 차이점은 bcrypt는 비밀번호 저장을 위해 의도적으로 느리게 설계되었고, crypto는 데이터 보안 및 전송을 위해 빠르고 효율적으로 설계되었다는 점

1. Bcrypt (비밀번호 해싱 특화)
- 주목적: 사용자 비밀번호 저장.
- 특징:
    - 단방향 해싱: 암호화된 값을 다시 원본으로 돌릴 수 없습니다 (복호화 불가능).
    - 의도적인 느림 (Work Factor): Salt Rounds 옵션을 통해 해싱 계산에 걸리는 시간을 조절할 수 있습니다. 이는 하드웨어 성능이 좋아져도 해커가 무차별 대입 공격(Brute Force)을 하기 어렵게 만듭니다.
    - 자동 Salt: 해싱할 때마다 무작위 Salt(소금)를 자동으로 생성하여 포함하므로, 같은 비밀번호라도 매번 다른 해시값이 나옵니다.
    - 알고리즘: Blowfish 암호화 알고리즘 기반.
2. Crypto (범용 암호화 모듈)
- 주목적: 데이터 무결성 검증, 양방향 암호화, 토큰 생성 등 광범위한 보안 작업. Node.js 내장 모듈입니다.
- 기능:
    - 해시 (Hash): SHA-256, SHA-512 등. 매우 빠르기 때문에 비밀번호 저장용으로 그대로 쓰면 위험합니다 (Rainbow Table 공격에 취약).
    - 양방향 암호화 (Cipher/Decipher): AES 같은 알고리즘을 사용해 데이터를 암호화하고 다시 복호화할 수 있습니다. (예: 개인정보 DB 저장)
    - HMAC: 비밀 키를 사용한 해싱 (데이터 위변조 방지).
- 비밀번호 저장 시 주의: crypto 모듈의 pbkdf2나 scrypt를 사용하면 bcrypt처럼 안전하게 비밀번호를 저장할 수 있지만, 구현이 bcrypt보다 다소 복잡할 수 있습니다.

<요약비교표>
| 특징 | Bcrypt | Crypto (일반 해시 함수: SHA, MD5 등) |
| --- | --- | --- |
| 주사용처 | 비밀번호 저장 | 토큰 생성, 파일 무결성 체크, 양방향 데이터 암호화 |
| 속도 | 느림 (보안을 위해 조절 가능) | 매우 빠름 (대용량 처리에 유리) |
| 복호화 | 불가능 (단방향) | 가능 (AES 등) 또는 불가능 (SHA 등) |
| Salt 처리 | 내장 (자동 생성 및 관리 편함) | 개발자가 직접 관리해야 함 |
| 보안성 | Brute Force 공격에 매우 강함 | 일반 해시는 Brute Force에 취약 (PBKDF2 사용 시 보완 가능) |


#### 📌 내일 할 일
- [ ] 로그인, 회원가입 api 설정
- [ ] 비밀번호 찾기, 재설정 화면 및 기능 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

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


#### 🚨 이슈/질문
- 비밀번호 초기화 시 PUT 대신 POST 쓰는 이유
    - 인증 코드를 한 번 쓰면 만료시켜버리는 로직 때문에, 두 번 실행했을 때 결과가 다르므로(멱등하지 않으므로) PUT 대신 POST를 쓰는 것이 맞다.

**1. 멱등성 (Idempotency) 위배**  
RESTful API 설계에서 각 메서드의 중요한 특징은 다음과 같다.  
- PUT: 멱등성이 있어야 합니다. 즉, 같은 요청을 여러 번 보내도 서버의 상태가 항상 동일해야 한다.
- POST: 멱등성이 보장되지 않아도 된다. (요청할 때마다 새로운 리소스가 생성되거나 상태가 변할 수 있음)

```typescript
// ... 전략 ...
// 인증코드 초기화 (한 번 사용된 코드는 삭제됨)
user.resetCode = null;
user.resetCodeExpires = null;
await repo.save(user);
```

이 로직 때문에 첫 번째 요청은 성공하지만, 두 번째 요청은 실패(코드가 null이 되었으므로 "인증코드가 일치하지 않습니다" 에러 발생)하게 된다. 실행 횟수에 따라 결과가 달라지므로 멱등하지 않는다. 따라서 PUT보다는 POST가 적합하다.

**2. 리소스 교체 vs 동작 수행 (Action)**  
- PUT: 보통 /users/:id와 같이 특정 리소스 전체를 **교체(Replace)**할 때 사용
- PATCH: 리소스의 일부분만 수정할 때 사용
- POST: 리소스 생성뿐만 아니라, **복잡한 로직을 수행하는 프로세스(RPC 스타일)**를 처리할 때 범용적으로 사용

reset-password는 단순히 데이터를 저장하는 것을 넘어, **[검증 -> 비밀번호 해싱 -> 토큰 만료 -> 저장]**이라는 일련의 '절차(Action)'를 수행하는 성격이 강하기 때문에 POST를 사용하는 것이 관례상 가장 적절



#### 📊 진행률
Week 4: ███████████░░░ 80%

---
### 📅 2025-12-29 (Day 18)

#### 🎯 오늘의 목표
- [x] 로그인, 회원가입 api 설정
- [ ] 비밀번호 찾기, 초기화 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

#### ✅ 완료한 작업
- ✅ 로그인, 회원가입 api 설정
- ✅ 회원가입 시 이메일 중복확인 구현
- ✅ 로그인 시 해당 유저네임 헤더에 뿌려주기
- ✅ 인증 방식을 localStorage 기반에서 cookie 기반으로 전환


#### 📝 작업 상세
[백엔드]
- 회원가입 시 이메일 중복 확인 에러 처리
```typescript
} catch (error: any) {
    // 이메일 중복 에러 처리
    if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('Duplicate entry'))) {
        return res.status(StatusCodes.CONFLICT).json({
            message: '이미 가입된 이메일입니다.'
        });
    }
```
- 이메일 중복 확인 로직 추가
```typescript
// 이메일 중복 확인
export async function checkEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
        const { email } = req.body;
        const user = await repo.findOneBy({ email });

        if (user) {
            return res.status(StatusCodes.CONFLICT).json({
                message: '이미 사용 중인 이메일입니다.'
            });
        }

        return res.status(StatusCodes.OK).json({
            message: '사용 가능한 이메일입니다.'
        });
    } catch (error) {
        next(error);
    }
}
```

[프론트엔드]
- 회원가입 시 이메일 중복 확인 에러 처리
    - setEmailError: 에러 메시지 설정
    - setIsEmailChecked: 이메일 중복 확인 여부 설정
    - email Input 값 OnChange 시 setEmailError 초기화
```typescript
// 이메일 중복 확인
const handleCheckEmail = async () => {
    if (!email) {
        alert("이메일을 입력해주세요.");
        return;
    }

    try {
        const response = await apiClient.post('/auth/check-email', { email });
        setEmailError(response.data.message);
        setIsEmailChecked(true);
    } catch (error: any) {
        setIsEmailChecked(false);
        if (error.response && error.response.status === 409) {
            setEmailError(error.response.data.message);
        } else {
            alert("중복 확인 중 오류가 발생했습니다.");
        }
    }
}
```
- className 조건부 동적 생성

```typescript
{emailError && <p className={`text-sm ${isEmailChecked ? 'text-green-600' : 'text-destructive'}`}>{emailError}</p>}
```

- auth 관련 api 요청함수 auth.api.ts 공통파일로 리팩토링
```typescript
// 회원가입
export const signup = async (data: SignupProps) => {
    const response = await apiClient.post(`/auth/signup`, data);
    return response.data;
}

// 이메일 중복 확인
export const checkEmail = async (data: { email: string }) => {
    const response = await apiClient.post(`/auth/check-email`, data);
    return response.data;
}

// 로그인
export const login = async (data: Omit<SignupProps, 'username'>) => {
    const response = await apiClient.post<LoginResponse>(`/auth/login`, data);
    return response.data;
}
```

- 로그인 시 해당 유저네임 헤더에 뿌려주기  
    (1) username을 localStorage에 저장하는 방법  
    - Backend (authController.ts): 로그인 성공 시 응답에 username 포함  
    - Frontend (auth.api.ts): 로그인 응답 타입(LoginResponse)에 user 객체(username 포함)를 추가  
    - Frontend Store (authStore.ts): useAuthStore가 username을 상태 및 로컬 스토리지에 저장하고 관리하도록 업데이트  
    - Frontend Page (Login.tsx): 로그인 성공 시 storeLogin 함수에 username을 함께 전달하도록 수정  
    - Frontend Component (Header.tsx): 헤더의 유저 아이콘 옆에 로그인된 사용자의 username이 표시되도록 변경  
    
    (2) cookie(httpOnly)를 사용하는 방법
    - Backend (package.json): `cookie-parser` 및 `@types/cookie-parser` 설치
    - Backend (index.ts): `cookie-parser` 미들웨어 추가, CORS 설정에 `credentials: true` 확인
    - Backend (authController.ts): 
        - 로그인 성공 시 응답에 username 포함 (localStorage 방식과 동일)
        - `logout` 함수 추가: `res.clearCookie("token")` 처리
        - `verifyUser` 함수 추가: 쿠키에서 토큰 읽어 검증 후 유저 정보 반환
    - Backend (authRoutes.ts): `POST /logout`, `GET /verify-user`, `POST /check-email` 라우트 추가
    - Frontend (auth.api.ts): `logout()`, `verifyUser()` API 함수 추가
    - Frontend (api/client.ts): `withCredentials: true` 설정 추가, 토큰 헤더 인터셉터 주석 처리
    - Frontend Store (authStore.ts): 
        - `storeLogin` 시그니처 변경: `(username: string)` (token 파라미터 제거)
        - 초기값을 `false`/`null`로 설정 (새로고침 시 useEffect에서 verifyUser로 확인)
        - localStorage 관련 로직 주석 처리
    - Frontend (App.tsx): `useEffect`로 앱 초기 로드 시 `verifyUser()` 호출하여 인증 상태 확인
    - Frontend Page (Login.tsx): 로그인 성공 시 `storeLogin(res.user.username)` 호출 (token 제거)
    - Frontend Component (Header.tsx): 로그아웃 시 `logout()` API 호출 후 `storeLogout()` 실행

    ```text
    - [보안성] httpOnly 설정 시 자바스크립트(document.cookie)로 접근 불가하여 XSS 공격 방어에 유리
    - [흐름]
        1. 로그인: 서버가 Set-Cookie 헤더로 httpOnly 토큰 발급. 클라이언트는 별도로 토큰 저장 안 함 (isLoggedIn 상태만 관리)
        2. 새로고침(초기 로드): 클라이언트가 GET /auth/verify-user 요청. 브라우저가 자동으로 쿠키 전송 -> 서버가 토큰 검증 후 유저 정보 반환 -> 클라이언트 스토어 업데이트
        3. 로그아웃: 클라이언트가 POST /auth/logout 요청 -> 서버가 쿠키 삭제(Clear Cookie) -> 클라이언트 스토어 초기화
    - [설정]
        - Backend: cors({ credentials: true }), cookie-parser 미들웨어 필수
        - Frontend: axios({ withCredentials: true }) 필수
    ```

    **[핵심 차이점]**
    - 현재 (LocalStorage): "나 로그인했어, 여기 내 명찰(Token)이랑 이름(Username)이야." -> 브라우저가 주머니(LocalStorage)에 넣고 필요할 때마다 꺼내 봄.
    - 쿠키 (HttpOnly): 서버가 브라우저에게 "이 금고(Cookie) 맡아줘. 단, 너는 절대 열어보지 마(HttpOnly)."라고 함. -> 브라우저는 금고 안에 뭐가 들었는지(Token이 뭔지, Username이 뭔지) 모름.

---
#### 💡 **개념 정리**
- 중복 이메일 가입 시 에러 상태코드를 409(CONFLICT)로 내려주는 것이 적합한 이유
    - 해당 문제 발생 시 가장 표준적으로 사용되는 코드
    - 의미: "요청이 현재 서버의 리소스 상태와 충돌하고 있습니다."
    - 주 사용처: 이미 존재하는 데이터(ID, 이메일 등)를 다시 생성하려고 할 때.
    - 이유: "이미 리소스가 존재하므로, 그 위에 덮어쓰거나 새로 만들 수 없다"는 서버의 상태를 표현함


#### 📌 내일 할 일
- [ ] 비밀번호 찾기, 재설정 화면 및 기능 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

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


#### 🚨 이슈/질문
- 회원가입 시 이메일 중복 발생 시 예외 처리
    - [문제발생] 이메일 unique 값 설정으로 인해 데이터에 있는 이메일이 중복으로 들어갔을 경우 Duplicate entry 에러 발생
    - [원인파악] 서버에서 데이터 무결성 위배에 대한 예외 처리를 하지 않았음
    - [진행] 
        - 회원가입 api 예외 처리 시 error.code === 'ER_DUP_ENTRY' 확인
        - 에러 상태코드 409(CONFLICT)로 내려주고 에러 메시지 전달
        - 프론트에서는 서버에서 내려준 statusCode가 409일 경우 error.response.data.message로 넘겨준 메세지값을 출력하도록 조치
    - [결과]
        - 회원가입 실패에 대한 원인을 사용자가 알 수 있도록 하여 사용자 경험 개선

#### 📊 진행률
Week 4: ███████████░░░ 83%

---
### 📅 2025-12-30 (Day 19)

#### 🎯 오늘의 목표
- [ ] 비밀번호 찾기, 초기화 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

#### ✅ 완료한 작업
- ✅ 


#### 📝 작업 상세

#### 💡 **개념 정리**
- 


#### 📌 내일 할 일
- [ ] 비밀번호 찾기, 재설정 화면 및 기능 구현
- [ ] 로그인, 회원가입 react-hook-form으로 구현
- [ ] 구글 OAuth 구현

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


#### 🚨 이슈/질문
- 

#### 📊 진행률
Week 4: ███████████░░░ 83%