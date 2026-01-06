import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { StatusCodes } from "http-status-codes";

// Express Request 인터페이스 확장
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
            };
        }
    }
}

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // verify-user 요청은 401 에러 로그 방지를 위해 200 반환
            if (req.path.includes('/verify-user')) {
                return res.status(StatusCodes.OK).json({
                    authenticated: false,
                    message: '인증 토큰이 없습니다.'
                });
            }
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as jwt.JwtPayload;

        // 요청 객체에 유저 정보 추가
        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token expired' });
        }
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
    }
}
