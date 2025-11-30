# 글쓰기 AI 서포터즈 - 상세 구현 가이드

> 이 문서는 `planning.md`를 바탕으로 초보 개발자가 그대로 따라 하며 구현할 수 있도록 **명령어, 코드 예시, 파일 구조**를 모두 포함합니다.  
> 순서는 4주 로드맵을 그대로 따르되, 각 주차에서 작성해야 하는 핵심 파일과 함수를 코드 수준으로 안내합니다.

---

## 0. 공통 준비

### 0-1. 리포지토리 구조
```
writingAI/
├── _docs/
│   ├── planning.md
│   └── planning_detail.md  ← (이 문서)
├── backend/
└── frontend/
```

### 0-2. 필수 설치
- Node.js 18+
- Git
- MariaDB 10.5+ (로컬: Docker 또는 직접 설치)

### 0-3. MariaDB 로컬 실행 (Docker 예시)
```bash
docker run -d \
  --name writing-mariadb \
  -e MARIADB_ROOT_PASSWORD=devpass \
  -e MARIADB_DATABASE=writing_ai_db \
  -p 3306:3306 \
  mariadb:10.5
```

### 0-4. 공용 .env 템플릿
`backend/.env.example`
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=devpass
DB_DATABASE=writing_ai_db

OPENAI_API_KEY=replace_me
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```
복사해서 `.env`로 사용합니다.

---

## 1. Week 1 - Backend 골격 & DB

### 1-1. 프로젝트 초기화
```bash
cd writingAI
mkdir backend && cd backend
npm init -y
npm install express typescript ts-node @types/node @types/express
npm install typeorm mysql2 reflect-metadata
npm install dotenv cors @types/cors
npm install -D nodemon concurrently
npx tsc --init
```

### 1-2. `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  }
}
```

### 1-3. `package.json` 스크립트
```json
"scripts": {
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:typecheck\"",
  "dev:server": "nodemon --watch src --exec ts-node src/index.ts",
  "dev:typecheck": "tsc --noEmit",
  "build": "tsc",
  "start": "node dist/index.js",
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
}
```

### 1-4. 폴더 구조
```
backend/
├── src/
│   ├── entity/
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── Paragraph.ts
│   ├── routes/
│   │   ├── projectRoutes.ts
│   │   └── index.ts
│   ├── controllers/
│   │   └── projectController.ts
│   ├── services/
│   │   └── aiService.ts (Week 2에 작성)
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── data-source.ts
│   └── index.ts
└── .env
```

### 1-5. TypeORM 데이터 소스
`src/data-source.ts`
```typescript
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Project } from './entity/Project';
import { Paragraph } from './entity/Paragraph';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Project, Paragraph],
  synchronize: false,            // 운영 전환 시 true → false
  logging: false,
});

export async function initDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('✅ MariaDB connected');
  }
}
```

### 1-6. Entity 코드
`src/entity/User.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Project } from './Project';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
```

`src/entity/Project.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Paragraph } from './Paragraph';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['fantasy', 'romance', 'thriller', 'sf'], default: 'fantasy' })
  genre: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  synopsis: string | null;

  @Column({ type: 'longtext', nullable: true })
  lorebook: string | null; // JSON.stringify된 값

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Paragraph, (paragraph) => paragraph.project)
  paragraphs: Paragraph[];
}
```

`src/entity/Paragraph.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Project } from './Project';

@Entity()
export class Paragraph {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.paragraphs, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['user', 'ai'] })
  author: 'user' | 'ai';

  @Column()
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 1-7. Express 앱 진입점
`src/index.ts`
```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDataSource } from './data-source';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';

async function bootstrap() {
  await initDataSource();

  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use('/api', router);
  app.use(errorHandler);

  const port = Number(process.env.PORT ?? 5000);
  app.listen(port, () => console.log(`🚀 Server listening on ${port}`));
}

bootstrap().catch((err) => {
  console.error('Server bootstrap failed', err);
  process.exit(1);
});
```

### 1-8. 라우터 & 컨트롤러
`src/routes/index.ts`
```typescript
import { Router } from 'express';
import { projectRouter } from './projectRoutes';

export const router = Router();

router.use('/projects', projectRouter);
```

`src/routes/projectRoutes.ts`
```typescript
import { Router } from 'express';
import { createProject, getProjects, getProjectDetail } from '../controllers/projectController';

export const projectRouter = Router();

projectRouter.post('/', createProject);
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectDetail);
```

`src/controllers/projectController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '../entity/Project';

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = repo.create({
      title: req.body.title,
      genre: req.body.genre ?? 'fantasy',
      description: req.body.description,
      synopsis: req.body.synopsis ?? '',
      lorebook: JSON.stringify(req.body.lorebook ?? []),
    });

    await repo.save(project);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const list = await repo.find({ order: { createdAt: 'DESC' } });
    res.json(list);
  } catch (error) {
    next(error);
  }
}

export async function getProjectDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['paragraphs'],
      order: { paragraphs: { orderIndex: 'ASC' } },
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
}
```

### 1-9. 에러 핸들러
`src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
}
```

### 1-10. 데이터베이스 마이그레이션
`ormconfig.ts` 없이 `DataSource` 기반 명령:
```bash
npx typeorm migration:create src/migration/CreateBaseTables
npx typeorm migration:run
```
마이그레이션 파일 내에 `User`, `Project`, `Paragraph` 테이블 생성 SQL을 자동/수동으로 작성합니다.

---

### 1-11. MVP: AI Writing Core (Immediate)
**목표**: DB 설정 직후, 복잡한 로직 없이 OpenAI API 연동을 최우선으로 확인합니다.

#### 1) 패키지 설치
```bash
npm install openai
```

#### 2) `src/services/aiService.ts` (MVP 버전)
```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateText(prompt: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a novelist.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate text');
  }
}
```

#### 3) `src/routes/testRoutes.ts` (임시 테스트용)
```typescript
import { Router } from 'express';
import { generateText } from '../services/aiService';

export const testRouter = Router();

testRouter.post('/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await generateText(prompt);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});
```

#### 4) `src/index.ts`에 추가
```typescript
// ... imports
import { testRouter } from './routes/testRoutes';

// ... app setup
app.use('/api/test', testRouter);
```

---

## 2. Week 2 - AI 통합 & 글쓰기 로직

### 2-1. OpenAI 세팅
```bash
cd backend
npm install openai
```

`src/services/aiService.ts`
```typescript
import OpenAI from 'openai';
import { Project } from '../entity/Project';
import { Paragraph } from '../entity/Paragraph';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContextOptions {
  includeSynopsis: boolean;
  includeLorebook: boolean;
  includeDescription: boolean;
  maxParagraphs: number;
  loreFocusTags?: string[];
}

export async function generateNextParagraph(project: Project, paragraphs: Paragraph[]) {
  const prompt = buildContext(project, paragraphs, {
    includeSynopsis: true,
    includeLorebook: true,
    includeDescription: true,
    maxParagraphs: 8,
  });

  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    input: [
      { role: 'system', content: '당신은 협업 소설 작가입니다.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_output_tokens: 500,
  });

  return response.output_text;
}

function buildContext(project: Project, paragraphs: Paragraph[], options: ContextOptions) {
  let context = '';

  if (options.includeSynopsis && project.synopsis) {
    context += `[Synopsis]\n${project.synopsis}\n\n`;
  }
  if (options.includeLorebook && project.lorebook) {
    const notes = JSON.parse(project.lorebook);
    context += `[Lorebook]\n${formatLore(notes, options.loreFocusTags)}\n\n`;
  }
  if (options.includeDescription && project.description) {
    context += `[Background]\n${project.description}\n\n`;
  }

  const recent = paragraphs.slice(-options.maxParagraphs).map((p) => `${p.author.toUpperCase()}: ${p.content}`);
  context += recent.join('\n\n');

  context += '\n\nAI, 다음 단락을 작성해 주세요.';
  return context;
}

function formatLore(notes: any[], tags?: string[]) {
  return notes
    .filter((note) => (!tags || tags.length === 0 ? true : note.tags.some((tag: string) => tags.includes(tag))))
    .map((note) => `- [${note.category}] ${note.title}: ${note.content}`)
    .join('\n');
}
```

### 2-2. 글쓰기 세션 컨트롤러
`src/controllers/writingController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '../entity/Project';
import { Paragraph } from '../entity/Paragraph';
import { generateNextParagraph } from '../services/aiService';

export async function writeWithAi(req: Request, res: Response, next: NextFunction) {
  try {
    const projectRepo = AppDataSource.getRepository(Project);
    const paragraphRepo = AppDataSource.getRepository(Paragraph);

    const project = await projectRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['paragraphs'],
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userParagraph = paragraphRepo.create({
      project,
      content: req.body.content,
      author: 'user',
      orderIndex: project.paragraphs.length,
    });
    await paragraphRepo.save(userParagraph);

    const aiText = await generateNextParagraph(project, [...project.paragraphs, userParagraph]);
    const aiParagraph = paragraphRepo.create({
      project,
      content: aiText.trim(),
      author: 'ai',
      orderIndex: project.paragraphs.length + 1,
    });
    await paragraphRepo.save(aiParagraph);

    res.json({ userParagraph, aiParagraph });
  } catch (error) {
    next(error);
  }
}
```

`src/routes/writingRoutes.ts`
```typescript
import { Router } from 'express';
import { writeWithAi } from '../controllers/writingController';

export const writingRouter = Router();
writingRouter.post('/:id/write', writeWithAi);
```
`src/routes/index.ts`에 `router.use('/writing', writingRouter);` 추가.

### 2-3. 시놉시스 & 설정집 API
`src/controllers/contextController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Project } from '../entity/Project';

export async function getContext(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOneBy({ id: Number(req.params.id) });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json({
      synopsis: project.synopsis ?? '',
      lorebook: project.lorebook ? JSON.parse(project.lorebook) : [],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateContext(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOneBy({ id: Number(req.params.id) });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.synopsis = req.body.synopsis ?? null;
    project.lorebook = JSON.stringify(req.body.lorebook ?? []);
    await repo.save(project);

    res.json({ message: 'Context updated', projectId: project.id });
  } catch (error) {
    next(error);
  }
}
```

`src/routes/contextRoutes.ts`
```typescript
import { Router } from 'express';
import { getContext, updateContext } from '../controllers/contextController';

export const contextRouter = Router();
contextRouter.get('/:id/context', getContext);
contextRouter.put('/:id/context', updateContext);
```
`src/routes/index.ts`에서 `router.use('/projects', contextRouter);`가 아니라 **중복을 피하기 위해**:
```typescript
router.use('/projects', projectRouter);
router.use('/projects', contextRouter);
router.use('/writing', writingRouter);
```

---

## 3. Week 3 - Frontend 구현

### 3-1. Vite 프로젝트 초기화
```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
npm install axios react-router-dom
npm install @types/react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        userBg: '#f0f9ff',
        aiBg: '#f5f3ff',
        border: '#e5e7eb',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

`src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-50 text-slate-900 font-sans;
  }
}

.btn-primary {
  @apply inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-indigo-500;
}
.card {
  @apply rounded-xl border border-border bg-white shadow-sm;
}
```

### 3-2. Axios 클라이언트
`src/api/client.ts`
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api',
});
```

### 3-3. 프로젝트 리스트 화면
`src/pages/ProjectList.tsx`
```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface Project {
  id: number;
  title: string;
  genre: string;
  createdAt: string;
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    apiClient.get('/projects').then((res) => setProjects(res.data));
  }, []);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">내 프로젝트</h1>
        <button className="btn-primary" onClick={() => (window.location.href = '/projects/new')}>
          새 프로젝트
        </button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id} className="card p-4">
            <a href={`/projects/${p.id}`} className="text-lg font-medium text-slate-900">
              {p.title}
            </a>
            <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {p.genre}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### 3-4. 글쓰기 세션 핵심 컴포넌트

`src/pages/WritingSession.tsx`
```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { StoryContextPanel } from '../components/StoryContextPanel';

interface Paragraph {
  id: number;
  author: 'user' | 'ai';
  content: string;
}

export function WritingSession() {
  const { projectId } = useParams();
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiClient.get(`/projects/${projectId}`).then((res) => setParagraphs(res.data.paragraphs));
  }, [projectId]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const res = await apiClient.post(`/writing/${projectId}/write`, { content: input });
      setParagraphs((prev) => [...prev, res.data.userParagraph, res.data.aiParagraph]);
      setInput('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[65%_35%]">
      <section className="flex flex-col rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {paragraphs.map((p) => (
            <article
              key={p.id}
              className={`rounded-xl border border-border px-4 py-3 ${
                p.author === 'user' ? 'bg-userBg' : 'bg-aiBg'
              }`}
            >
              <strong className="text-sm text-slate-500">
                {p.author === 'user' ? '나' : 'AI'}
              </strong>
              <p className="mt-1 whitespace-pre-line text-slate-900">{p.content}</p>
            </article>
          ))}
        </div>
        <div className="border-t border-border p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="이야기를 이어 써보세요"
            className="h-32 w-full rounded-xl border border-border bg-slate-50 p-4 text-base focus:border-primary focus:outline-none"
          />
          <button className="btn-primary mt-4 w-full" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? 'AI 작성 중...' : '단락 제출'}
          </button>
        </div>
      </section>

      <StoryContextPanel projectId={Number(projectId)} />
    </div>
  );
}
```

`src/components/StoryContextPanel.tsx`
```typescript
import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

interface LoreNote {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  includeInPrompt?: boolean;
}

export function StoryContextPanel({ projectId }: { projectId: number }) {
  const [synopsis, setSynopsis] = useState('');
  const [lore, setLore] = useState<LoreNote[]>([]);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    apiClient.get(`/projects/${projectId}/context`).then((res) => {
      setSynopsis(res.data.synopsis);
      setLore(res.data.lorebook);
    });
  }, [projectId]);

  const debouncedSave = (payload: any) => {
    if (timer) clearTimeout(timer);
    const nextTimer = setTimeout(() => {
      apiClient.put(`/projects/${projectId}/context`, payload);
    }, 2000);
    setTimer(nextTimer);
  };

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">시놉시스 & 설정집</h2>
        <span className="text-xs text-slate-500">자동 저장 (2초)</span>
      </header>
      <section className="space-y-2">
        <label className="text-sm font-medium text-slate-600">시놉시스</label>
        <textarea
          className="min-h-[160px] w-full rounded-xl border border-border bg-slate-50 p-3 text-sm focus:border-primary focus:outline-none"
          value={synopsis}
          onChange={(e) => {
            setSynopsis(e.target.value);
            debouncedSave({ synopsis: e.target.value, lorebook: lore });
          }}
        />
      </section>
      <section className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-600">설정집</label>
          <button
            className="text-sm font-medium text-primary hover:text-indigo-500"
            onClick={() => {
              const next = [
                ...lore,
                { id: crypto.randomUUID(), category: 'character', title: '새 노트', content: '', tags: [] },
              ];
              setLore(next);
              debouncedSave({ synopsis, lorebook: next });
            }}
          >
            + 노트 추가
          </button>
        </div>
        {lore.map((note, idx) => (
          <div key={note.id} className="space-y-2 rounded-2xl border border-border bg-slate-50 p-4">
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={note.title}
              onChange={(e) => {
                const next = [...lore];
                next[idx] = { ...note, title: e.target.value };
                setLore(next);
                debouncedSave({ synopsis, lorebook: next });
              }}
            />
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={note.content}
              onChange={(e) => {
                const next = [...lore];
                next[idx] = { ...note, content: e.target.value };
                setLore(next);
                debouncedSave({ synopsis, lorebook: next });
              }}
            />
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={note.includeInPrompt ?? true}
                onChange={(e) => {
                  const next = [...lore];
                  next[idx] = { ...note, includeInPrompt: e.target.checked };
                  setLore(next);
                  debouncedSave({ synopsis, lorebook: next });
                }}
              />
              AI 컨텍스트 포함
            </label>
          </div>
        ))}
      </section>
    </aside>
  );
}
```

### 3-5. Tailwind 스타일 레시피
- 레이아웃: `lg:grid-cols-[65%_35%]` + `gap-6`로 2컬럼, 모바일은 `flex flex-col`
- 카드: `rounded-2xl border border-border bg-white shadow-sm`
- 사용자 문단: `bg-userBg`, AI 문단: `bg-aiBg`
- 패널 헤더: `flex items-center justify-between text-sm text-slate-500`
- 체크박스: `h-4 w-4 rounded border-border text-primary focus:ring-primary`

---

## 4. Week 4 - 인증 & 고급 기능

### 4-1. 인증 API
`src/routes/authRoutes.ts`
```typescript
import { Router } from 'express';
import { register, login } from '../controllers/authController';

export const authRouter = Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
```

`src/controllers/authController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(User);
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = repo.create({ email: req.body.email, username: req.body.username, password: hashed });
    await repo.save(user);
    res.status(201).json({ id: user.id });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ email: req.body.email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token });
  } catch (error) {
    next(error);
  }
}
```

### 4-2. 프론트 인증 훅 (간단 버전)
`src/utils/auth.ts`
```typescript
export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}
```

`apiClient`에 인터셉터 추가:
```typescript
import { getToken } from '../utils/auth';
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 4-3. 프로젝트 내보내기 (추가 기능 예시)
백엔드 `projectController.ts`에:
```typescript
export async function exportProject(req: Request, res: Response, next: NextFunction) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['paragraphs'],
      order: { paragraphs: { orderIndex: 'ASC' } },
    });
    if (!project) return res.status(404).json({ message: 'Not found' });

    const text = project.paragraphs
      .map((p) => `${p.author === 'user' ? '[User]' : '[AI]'} ${p.content}`)
      .join('\n\n');

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="project-${project.id}.txt"`);
    res.send(text);
  } catch (error) {
    next(error);
  }
}
```

라우터:
```typescript
projectRouter.get('/:id/export', exportProject);
```

프론트에서 다운로드 버튼:
```tsx
<button onClick={() => window.open(`/api/projects/${projectId}/export`, '_blank')}>
  TXT로 내보내기
</button>
```

---

## 5. 시놉시스 & 설정집 협업 규칙 (요약)
1. **시놉시스**: 줄거리 전체 방향성. 패널에서 자동 저장되며, 백엔드 `Project.synopsis` TEXT 필드에 저장.
2. **설정집**: `[{ id, category, title, content, tags, includeInPrompt }]` 배열. `Project.lorebook` LONGTEXT에 JSON으로 저장.
3. **AI 컨텍스트 옵션**: 글쓰기 제출 시 프론트가 `includeSynopsis`, `includeLorebook`, `loreFocusTags`를 전달하여 `aiService`에서 빌드.
4. **히스토리**: 변경 추적을 위해 추후 `ContextHistory` 테이블(week 2 확장 항목)에 `{ projectId, synopsis, lorebook, version }` 저장 가능.

---

## 6. 실행 & 테스트 체크리스트

### 6-1. Backend
```bash
cd backend
npm run dev              # 개발 모드
npm run typeorm migration:run
```
- `http://localhost:5000/api/projects` 호출로 헬스 체크

### 6-2. Frontend
```bash
cd frontend
npm start
```
- `http://localhost:3000` 접속 → 프로젝트 생성 → 글쓰기 화면 → 시놉시스/설정집 패널 수정 → 단락 작성/AI 응답 검증

### 6-3. 테스트 아이템
- [ ] DB 연결 성공 로그
- [ ] 프로젝트 CRUD 정상 동작
- [ ] 시놉시스/설정집 저장 및 재로딩
- [ ] 글쓰기 제출 시 AI 응답 + 단락 두 개 추가
- [ ] 우측 패널 자동 저장 (2초 지연)
- [ ] AI 프롬프트 옵션 토글 테스트

---

## 7. 다음 단계
- Week 4 이후에는 `StoryContextPanel`을 리팩터링하여 섹션별 탭/모바일 대응 UI 제공
- `ContextHistory` 테이블을 추가해 변경 이력을 UI에서 타임라인으로 확인
- OpenAI 비용 절감을 위해 **요약 기능**(이전 단락 압축) 구현을 고려

필요 시 `planning.md`의 상위 개요와 이 문서를 병행해서 확인하세요. 화이팅! 🚀

