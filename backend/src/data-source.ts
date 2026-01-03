import 'reflect-metadata';
import 'dotenv/config';  // 추가
import { DataSource } from 'typeorm';
import { User } from './entity/Users';
import { Project } from './entity/Projects';
import { Paragraph } from './entity/Paragraphs';
import { SocialAccount } from './entity/SocialAccounts';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3307),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Project, Paragraph, SocialAccount],
    migrations: ["./src/migrations/**/*.ts"],   // 마이그레이션 파일 위치
    // synchronize: true,     // 운영 전환 시 true → false
    synchronize: false,     // 스키마 자동 동기화 비활성화 (데이터 보호)
    logging: true,
    dateStrings: true,  // 날짜 형식대로 표기
});

export async function initDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('MariaDB connected');
    }
}