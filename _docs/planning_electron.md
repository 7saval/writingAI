# 1주차 일렉트론(Electron) 마이그레이션 및 OS 기능 구현 (상세 코드 플랜)

본 문서는 기존 웹(Web) 프로젝트를 일렉트론(Electron) 앱으로 확장하고, 로컬 OS 기능을 연동하기 위한 상세 가이드입니다. 복사하여 붙여넣을 수 있는 코드 단위로 작성되었습니다.

---

## 📂 1. 일렉트론 적용 후 예상 폴더 구조

일렉트론 관련 코드(Node.js 환경)와 기존 렌더러(React/Vue 등 웹 환경) 코드를 분리하여 관리합니다.

```text
writingAI/
├── _docs/                    # 기존 문서 폴더
├── backend/                  # 기존 백엔드 폴더
├── frontend/                 # 기존 프론트엔드 폴더 (React 등)
│   ├── src/
│   │   ├── lib/
│   │   │   └── electronHelper.ts # 웹/앱 환경을 구분하여 API 호출하는 헬퍼 (신규 생성)
│   │   └── ...
│   └── package.json          # 프론트엔드 의존성
├── electron/                 # 일렉트론 메인 프로세스 관련 폴더 (최상단 root에 신규 생성)
│   ├── main.ts               # 일렉트론 진입점 (창 생성, IPC 리스너 등록)
│   ├── preload.ts            # 메인-렌더러 간 브릿지 설정
│   └── database.ts           # 로컬 SQLite DB 관리 모듈
├── package.json              # 일렉트론 포함 최상단 패키지 설정 (electron 폴더 바깥에 위치)
└── tsconfig.electron.json    # 일렉트론 빌드용 TS 설정 (신규)
```

---

## 📅 주간 상세 구현 계획 (Day 1 ~ Day 5)

### [Day 1] 일렉트론 환경 세팅 및 브릿지(IPC) 연동

**1. 패키지 설치**
```bash
# 일렉트론 및 빌드 도구 설치
npm install -D electron electron-builder concurrently wait-on
```

**2. `electron/preload.ts` 작성 (브릿지)**
렌더러(웹) 프로세스에서 Node.js 기능을 안전하게 호출하도록 노출합니다.

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// 브라우저의 window 객체에 'window.electron'으로 사용할 기능을 노출합니다.
contextBridge.exposeInMainWorld('electron', {
  // 1. 파일 내보내기 요청
  exportFile: (format: string, content: string) => ipcRenderer.invoke('export-file', format, content),
  // 2. 문서 자동 저장 (DB)
  saveToDb: (docId: string, content: string) => ipcRenderer.invoke('save-doc', docId, content),
  // 3. 네이티브 알림 표시
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', title, body),
  // 4. 단축키 눌림 감지 이벤트 구독
  onShortcutPressed: (callback: (action: string) => void) => {
    ipcRenderer.on('shortcut-pressed', (_event, action) => callback(action));
  }
});
```

**3. `electron/main.ts` 작성 (기본 창 띄우기)**
```typescript
import { app, BrowserWindow, ipcMain, dialog, Notification, globalShortcut } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 빌드된 preload.js 경로
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 개발 모드에서는 Vite/웹팩 서버 URL을 로드하고, 프로덕션에서는 빌드된 index.html 로드
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

**4. `src/lib/electronHelper.ts` (렌더러/웹 범용 헬퍼)**
웹 브라우저로 접속 시 에러가 나지 않도록 방어 로직을 작성합니다.

```typescript
const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

export const exportDocument = async (format: string, content: string) => {
  if (isElectron()) {
    return await window.electron.exportFile(format, content);
  } else {
    // 웹 브라우저 환경에서의 다운로드 처리 (Blob 이용)
    console.log('웹 환경: 브라우저 기본 다운로드 로직 실행');
  }
};
```

---

### [Day 2] 멀티 포맷 문서 내보내기 (Export) 구현

운영체제의 네이티브 저장 다이얼로그를 띄우고 파일을 저장합니다.

**`electron/main.ts` 내부에 IPC 리스너 추가:**
```typescript
import * as fs from 'fs';

// 앱 초기화 후 (app.whenReady) 아래 코드를 작성합니다.
ipcMain.handle('export-file', async (event, format, content) => {
  if (!mainWindow) return { success: false };

  // 1. 네이티브 파일 저장 경로 선택창 열기
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: '문서 내보내기',
    defaultPath: `my_writing.${format}`,
    filters: [
      { name: format.toUpperCase(), extensions: [format] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    // 2. 포맷별 파일 작성 로직 분기
    if (format === 'txt') {
      fs.writeFileSync(filePath, content, 'utf-8');
    } else if (format === 'pdf') {
       // Electron 내장 PDF 인쇄 기능 활용
       const pdfData = await mainWindow.webContents.printToPDF({});
       fs.writeFileSync(filePath, pdfData);
       // (주의: PDF 추출 전 웹 화면이 렌더링된 상태여야 가장 좋음)
    } else if (format === 'docx' || format === 'hwp') {
       // (추가 작업) docx 라이브러리(ex: 'docx' 패키지) 등을 설치하여 파일 생성
       fs.writeFileSync(filePath, content, 'utf-8'); // 임시 텍스트 처리 
    }
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('파일 저장 실패:', error);
    return { success: false, error: String(error) };
  }
});
```

---

### [Day 3] 로컬 DB (SQLite) 자동 저장 연동

일렉트론은 로컬 파일시스템 접근이 되기 때문에 SQLite를 쓰면 가벼운 로컬DB 구축이 가능합니다.

**1. 패키지 설치**
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

**2. `electron/database.ts` 작성**
```typescript
import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

// OS의 userData 폴더 (AppData 등)에 db 파일 생성
const dbPath = path.join(app.getPath('userData'), 'writingApp.db');
const db = new Database(dbPath);

// 테이블 초기 세팅
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    content TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export const saveDocument = (id: string, content: string) => {
  const stmt = db.prepare(`
    INSERT INTO documents (id, content, updatedAt) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET content=excluded.content, updatedAt=CURRENT_TIMESTAMP
  `);
  stmt.run(id, content);
  return true;
};
```

**3. `electron/main.ts` 에 DB IPC 추가**
```typescript
import { saveDocument } from './database';

ipcMain.handle('save-doc', (event, docId, content) => {
  try {
    saveDocument(docId, content);
    console.log(`자동 저장 완료: ${docId}`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
});
```

*(렌더러 측에서는 내용이 변경될 때마다 `debounce`(지연 함수)를 걸어 `window.electron.saveToDb` 로 자동 호출합니다.)*

---

### [Day 4] 글로벌 시스템 단축키 (AI 단축키)

설정 창이 아닌 전역 어디서든 (게임 중이거나 인터넷 서핑 중에도) 앱 단축키가 동작하게 만듭니다.

**`electron/main.ts` 에 추가 (app.whenReady.then 안쪽)**
```typescript
app.whenReady().then(() => {
  createWindow();

  // 전역 단축키 등록 (예: 알트 + 시프트 + A)
  const ret = globalShortcut.register('CommandOrControl+Shift+A', () => {
    console.log('AI 단축키 눌림!');
    // 렌더러(웹) 프로세스로 메세지를 쏘아 AI 생성 로직 실행을 유도
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-pressed', 'trigger-ai');
    }
  });

  if (!ret) {
    console.log('단축키 등록 실패 (다른 앱이 사용 중일 수 있음)');
  }
});

// 앱 종료 시 단축키 해제 필수!
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
```

---

### [Day 5] 네이티브 완료 알림 (Notification)

AI 생성이 끝나면 OS 우측 하단 시스템 알림을 표시하고, 클릭 시 앱 창을 활성화합니다.

**`electron/main.ts` IPC 로직 추가**
```typescript
ipcMain.on('show-notification', (event, title, body) => {
  // 알림을 지원하는 운영체제인지 확인
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title,
      body: body,
      // 아이콘 경로 설정 가능 icon: path.join(__dirname, 'icon.png')
    });

    // 사용자가 알림 팝업을 클릭했을 때 창 활성화
    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        
        // 추가로 스크롤 이동을 원한다면 렌더러로 메시지 전송
        // mainWindow.webContents.send('scroll-to-latest');
      }
    });

    notification.show();
  }
});
```

**렌더러 측 React 구역에서의 사용 예시**
```typescript
// AI 생성 완료 후의 함수 내에서
const handleAIGenerationComplete = (result) => {
  setStoryText(result); // 에디터 업데이트
  
  if (isElectron()) {
    window.electron.showNotification('AI 작성 완료', '새로운 문단이 생성되었습니다.');
  }
};
```

---

## 🛠 `window.electron` 타입 선언 (타입스크립트 에러 방지)

렌더러 코드 아무 곳(주로 `src/types/global.d.ts` 또는 유사 파일)에 다음을 선언하세요.

```typescript
export interface ElectronAPI {
  exportFile: (format: string, content: string) => Promise<{ success: boolean, path?: string, error?: string, canceled?: boolean }>;
  saveToDb: (docId: string, content: string) => Promise<{ success: boolean }>;
  showNotification: (title: string, body: string) => void;
  onShortcutPressed: (callback: (action: string) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
```
