import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/Users';
import { Project } from './entity/Projects';
import { Paragraph } from './entity/Paragraphs';

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
});

export async function initDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('MariaDB connected');
    }
}