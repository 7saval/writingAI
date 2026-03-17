import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

// OS의 userData 폴더 (AppData 등)에 db 파일 생성
export const dbPath = path.join(app.getPath('userData'), 'writingApp.db');
console.log('---');
console.log('SQLite DB 위치:', dbPath);
console.log('---');
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
