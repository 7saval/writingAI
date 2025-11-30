import 'dotenv/config';
import express from 'express';
import { initDataSource } from './data-source';
import cors from 'cors';
import { testRouter } from './routes/testRoutes';

async function bootstrap() {
    await initDataSource();

    const app = express();
    app.use(cors({
        origin: process.env.CORS_ORIGIN,    // 허용할 프론트엔드 주소
        credentials: true,                  // 쿠키나 인증 헤더를 포함할 경우 true 설정
    }));
    app.use(express.json());
    app.use('/api/test', testRouter);
    // app.use('/api', router);
    // app.use(errorHandler);

    const port = Number(process.env.PORT ?? 5000);
    app.listen(port, () => console.log(`🚀 Server listening on ${port}`));
}

bootstrap().catch((err) => {
    console.error('Server bootsrap failed', err);
    process.exit(1);
})
