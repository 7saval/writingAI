import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../entity/Users";
import { StatusCodes } from "http-status-codes";

// 회원가입
export async function signup(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
        const { email, password, username } = req.body;
        const hashed = await bcrypt.hash(password, 10); // 비밀번호 해싱 (보안 강화)
        const user = repo.create({ email, username, password: hashed });
        await repo.save(user);
        res.status(StatusCodes.CREATED).json({
            message: '회원가입이 완료되었습니다.',
            id: user.id
        });
    } catch (error: any) {
        // 이메일 중복 에러 처리
        if (error.code === 'ER_DUP_ENTRY' || (error.message && error.message.includes('Duplicate entry'))) {
            return res.status(StatusCodes.CONFLICT).json({
                message: '이미 가입된 이메일입니다.'
            });
        }

        console.error('회원가입 중 오류 발생:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: '회원가입 중 오류가 발생했습니다.'
        });
    }
}

// 로그인
export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
        const { email, password } = req.body;
        // 사용자 존재 여부
        const user = await repo.findOneBy({ email });
        if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({
            message: '이메일 또는 비밀번호가 일치하지 않습니다.'
        });

        // 비밀번호 일치 여부
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(StatusCodes.UNAUTHORIZED).json({
            message: '이메일 또는 비밀번호가 일치하지 않습니다.'
        });

        // JWT 토큰 발급
        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN as any
        });

        // 쿠키에 토큰 담기 - 토큰 변수에 토큰 담기
        res.cookie("token", token, {
            httpOnly: true
        });

        res.status(StatusCodes.OK).json({
            message: '로그인이 완료되었습니다.',
            token,
            user: {
                username: user.username
            }
        });
    } catch (error) {
        next(error);
    }
}

// 로그아웃
export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        res.clearCookie("token");
        res.status(StatusCodes.OK).json({
            message: '로그아웃이 완료되었습니다.'
        });
    } catch (error) {
        next(error);
    }
}

// 사용자 인증
export async function verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(StatusCodes.OK).json({
            authenticated: false,
            message: '인증되지 않은 사용자입니다.'
        });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
            const repo = AppDataSource.getRepository(User);
            const user = await repo.findOneBy({ id: decoded.id });
            if (!user) return res.status(StatusCodes.OK).json({
                authenticated: false,
                message: '인증되지 않은 사용자입니다.'
            });
            res.status(StatusCodes.OK).json({
                authenticated: true,
                message: '인증이 완료되었습니다.',
                user: {
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(StatusCodes.OK).json({
                authenticated: false,
                message: '세션이 만료되었습니다.'
            });
        }

    } catch (error) {
        next(error);
    }
}

// 비밀번호 찾기
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
        const { email } = req.body;
        const user = await repo.findOneBy({ email });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        // 인증코드 생성 (6자리 숫자)
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // DB에 저장
        user.resetCode = code;
        user.resetCodeExpires = new Date(Date.now() + 1000 * 60 * 5); // 5분 후
        await repo.save(user);

        // 이메일 발송
        console.log(`인증코드: ${code}`);
        // await emailService.send(email, '비밀번호 초기화 인증코드', code);

        return res.status(StatusCodes.OK).json({
            message: '인증코드가 이메일로 전송되었습니다.',
            code
        });

    } catch (error) {
        next(error);
    }
}

// 비밀번호 초기화
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(User);
        const { email, code, newPassword } = req.body;
        const user = await repo.findOneBy({ email });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: '사용자를 찾을 수 없습니다.'
            });
        }

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

        return res.status(StatusCodes.OK).json({
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });
    } catch (error) {
        next(error);
    }
}

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