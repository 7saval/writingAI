import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from "../entity/Users";
import { StatusCodes } from "http-status-codes";
import { SocialAccount } from "../entity/SocialAccounts";
import { OAuth2Client } from 'google-auth-library';

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
        if (!user.password) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '이메일 또는 비밀번호가 일치하지 않습니다.'
            });
        }

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
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOneBy({ id: req.user!.id });

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.status(StatusCodes.OK).json({
            authenticated: true,
            message: '인증이 완료되었습니다.',
            user: {
                username: user.username,
                email: user.email
            }
        });

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



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 구글 로그인
export async function googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body; // Client sends ID Token

        // ID Token 검증 (google-auth-library 사용)
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '유효하지 않은 토큰입니다.'
            });
        }

        const { sub: socialId, email, name } = payload;

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: '이메일 정보가 없습니다.'
            });
        }

        const socialRepo = AppDataSource.getRepository(SocialAccount);
        const userRepo = AppDataSource.getRepository(User);

        // 1. 소셜 계정 조회
        let socialAccount = await socialRepo.findOne({
            where: { provider: 'google', socialId },
            relations: ['user']
        });

        let user: User;

        if (socialAccount) {
            // 이미 연동된 계정 -> 로그인 처리
            user = socialAccount.user;
        } else {
            // 연동 안된 경우
            // 이메일로 기존 유저 확인
            const existingUser = await userRepo.findOneBy({ email });

            if (existingUser) {
                // 기존 유저 존재 -> 소셜 계정 연동
                user = existingUser;

                // 바로 신규 유저 생성할 때
                // } else {
                //     // 신규 유저 생성
                //     user = userRepo.create({
                //         email,
                //         username: name || 'User',
                //         password: undefined // 소셜 유저는 비밀번호 없음
                //     });
                //     await userRepo.save(user);
                // }

                // 소셜 계정 생성 및 연결
                socialAccount = socialRepo.create({
                    provider: 'google',
                    socialId,
                    user
                });
                await socialRepo.save(socialAccount);
            } else {
                // 신규 유저 -> 추가 정보 입력을 위한 토큰 발급
                const signupToken = jwt.sign({
                    email,
                    socialId,
                    provider: 'google',
                    name: name || 'User'
                }, process.env.JWT_SECRET!, {
                    expiresIn: '30m' // 30분간 유효
                });

                return res.status(StatusCodes.OK).json({
                    isNewUser: true,
                    signupToken,
                    profile: {
                        email,
                        name: name || 'User'
                    }
                });
            }
        }

        // 로그인 처리
        const jwtToken = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN as any
        });

        res.cookie("token", jwtToken, {
            httpOnly: true
        });

        res.status(StatusCodes.OK).json({
            message: '구글 로그인이 완료되었습니다.',
            token: jwtToken,
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        next(error);
    }
}

// 소셜 회원가입 완료
export async function completeSocialSignup(req: Request, res: Response, next: NextFunction) {
    try {
        const { signupToken, nickname } = req.body;

        if (!signupToken || !nickname) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: '필수 정보가 누락되었습니다.'
            });
        }

        // 토큰 검증
        const decoded = jwt.verify(signupToken, process.env.JWT_SECRET!) as any;
        const { email, socialId, provider } = decoded;

        const userRepo = AppDataSource.getRepository(User);
        const socialRepo = AppDataSource.getRepository(SocialAccount);

        // 1. 유저 생성
        const user = userRepo.create({
            email,
            username: nickname, // 사용자가 입력한 닉네임 사용
            password: undefined
        });
        await userRepo.save(user);

        // 2. 소셜 계정 연결
        const socialAccount = socialRepo.create({
            provider,
            socialId,
            user
        });
        await socialRepo.save(socialAccount);

        // 3. 로그인 토큰 발급
        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN as any
        });

        res.cookie("token", token, {
            httpOnly: true
        });

        res.status(StatusCodes.CREATED).json({
            message: '회원가입 및 로그인이 완료되었습니다.',
            token,
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error: any) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: '유효기간이 만료되었거나 잘못된 토큰입니다. 다시 소셜 로그인을 시도해 주세요.'
            });
        }
        next(error);
    }
}