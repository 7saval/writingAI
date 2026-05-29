/// <reference path="./types/express.d.ts" />

if (process.env.NODE_ENV !== "production") {
    import("dotenv/config");
}
import express from 'express';
import { initDataSource } from './data-source';
import cors from 'cors';
// import { testRouter } from './routes/testRoutes';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    await initDataSource();

    const app = express();
    app.use(cors({
        origin: process.env.CORS_ORIGIN?.split(","),    // 허용할 프론트엔드 주소
        credentials: true,                  // 쿠키나 인증 헤더를 포함할 경우 true 설정
    }));
    app.use(express.json());
    app.use(cookieParser());
    // app.use('/api/test', testRouter);
    app.use('/api', router);    // API 라우터 등록
    app.use(errorHandler);      // 에러 핸들러 등록 (맨 마지막에 위치)

    const port = Number(process.env.PORT ?? 5000);
    app.listen(port, () => console.log(`🚀 Server listening on ${port}`));
}

bootstrap().catch((err) => {
    console.error('Server bootsrap failed', err);
    process.exit(1);
})
