import 'reflect-metadata';
// if (process.env.NODE_ENV !== "production") {
//     import("dotenv/config");
// }
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entity/Users';
import { Project } from './entity/Projects';
import { Paragraph } from './entity/Paragraphs';
import { SocialAccount } from './entity/SocialAccounts';

export const AppDataSource = new DataSource({
    type: 'postgres',
    // url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // ssl: true,
    // extra: {
    ssl: {
        rejectUnauthorized: false,
    },
    // },
    entities: [User, Project, Paragraph, SocialAccount],
    migrations: ["./src/migrations/**/*.ts"],   // 마이그레이션 파일 위치
    // synchronize: true,     // 운영 전환 시 true → false
    synchronize: false,     // 스키마 자동 동기화 비활성화 (데이터 보호)
    logging: true
});

export async function initDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('PostgreSQL connected');
    }
}