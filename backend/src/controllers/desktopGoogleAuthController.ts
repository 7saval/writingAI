import { NextFunction, Request, Response } from "express";
import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import { StatusCodes } from "http-status-codes";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entity/Users";
import { SocialAccount } from "../entity/SocialAccounts";
import * as desktopOAuthSessions from "../services/desktopOAuthSessions";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

// Desktop용 Google 로그인 리디렉션 URI (Google Console에 등록된 것과 일치해야 함)
const DESKTOP_REDIRECT_URI = process.env.GOOGLE_DESKTOP_REDIRECT_URI;

if (!DESKTOP_REDIRECT_URI) {
  console.warn(
    "Warning: GOOGLE_DESKTOP_REDIRECT_URI is not defined in environment variables.",
  );
}

/**
 * 1. Electron 로그인 세션 생성 및 인증 URL 반환
 * POST /api/auth/google/desktop/session
 */
export async function createDesktopGoogleSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = desktopOAuthSessions.createDesktopOAuthSession();

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      state: session.state,
      code_challenge: session.codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
      prompt: "select_account",
      redirect_uri: DESKTOP_REDIRECT_URI,
    });

    res.status(StatusCodes.OK).json({
      sessionId: session.sessionId,
      authUrl,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Google OAuth 콜백 처리
 * GET /api/auth/google/desktop/callback
 */
export async function handleDesktopGoogleCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { code, state, error } = req.query;

  if (error) {
    if (state) {
      desktopOAuthSessions.failDesktopOAuthSession(
        state as string,
        `Google login failed: ${error}`,
      );
    }
    return res.send(`
      <h1>로그인 실패</h1>
      <p>${error}</p>
      <p>이 창을 닫고 앱으로 돌아가주세요.</p>
    `);
  }

  try {
    const session = desktopOAuthSessions.getDesktopOAuthSessionByState(
      state as string,
    );

    if (!session) {
      return res.status(StatusCodes.BAD_REQUEST).send("Invalid or expired state.");
    }

    // Code 교환
    const { tokens } = await client.getToken({
      code: code as string,
      codeVerifier: session.codeVerifier,
      redirect_uri: DESKTOP_REDIRECT_URI,
    });

    if (!tokens.id_token) {
      desktopOAuthSessions.failDesktopOAuthSession(
        state as string,
        "No ID token received from Google.",
      );
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Login failed.");
    }

    // ID Token 검증
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      desktopOAuthSessions.failDesktopOAuthSession(
        state as string,
        "Invalid ID token payload.",
      );
      return res.status(StatusCodes.UNAUTHORIZED).send("Invalid token.");
    }

    const { sub: socialId, email, name } = payload;
    if (!email) {
      desktopOAuthSessions.failDesktopOAuthSession(
        state as string,
        "Email info missing from Google.",
      );
      return res.status(StatusCodes.BAD_REQUEST).send("Email required.");
    }

    const socialRepo = AppDataSource.getRepository(SocialAccount);
    const userRepo = AppDataSource.getRepository(User);

    let socialAccount = await socialRepo.findOne({
      where: { provider: "google", socialId },
      relations: ["user"],
    });

    let user: User;

    if (socialAccount) {
      user = socialAccount.user;
    } else {
      const existingUser = await userRepo.findOneBy({ email });
      if (existingUser) {
        user = existingUser;
        socialAccount = socialRepo.create({
          provider: "google",
          socialId,
          user,
        });
        await socialRepo.save(socialAccount);
      } else {
        // 신규 유저 흐름
        const signupToken = jwt.sign(
          { email, socialId, provider: "google", name: name || "User" },
          process.env.JWT_SECRET!,
          { expiresIn: "30m" },
        );

        desktopOAuthSessions.completeDesktopOAuthSession(state as string, {
          isNewUser: true,
          signupToken,
          profile: { email, name: name || "User" },
        });

        return res.send(`
          <div style="text-align: center; font-family: sans-serif; padding-top: 50px;">
            <h1>환영합니다!</h1>
            <p>회원가입을 완료하기 위해 앱으로 돌아가주세요.</p>
            <p>이 창은 이제 닫으셔도 됩니다.</p>
          </div>
        `);
      }
    }

    // 로그인 토큰 발급
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN ||
          "30m") as SignOptions["expiresIn"],
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN ||
          "7d") as SignOptions["expiresIn"],
      },
    );

    // Desktop 폴링 세션 완료 업데이트
    desktopOAuthSessions.completeDesktopOAuthSession(state as string, {
      accessToken,
      refreshToken,
      user: {
        username: user.username,
        email: user.email,
      },
    });

    // 참고: 리프레시 토큰은 데스크톱 폴링 응답으로 전달하거나 쿠키로 설정할 수 있음.
    // 여기서는 폴링 결과를 통해 accessToken을 전달하는 방식이므로 refreshToken도 결과에 포함하거나 세션에 담아야 할 수 있음.
    // 일단 계획서에 따라 accessToken과 user만 전달.

    res.send(`
      <div style="text-align: center; font-family: sans-serif; padding-top: 50px;">
        <h1>로그인 완료</h1>
        <p>로그인이 성공적으로 완료되었습니다. 앱으로 돌아가주세요.</p>
        <p>이 창은 이제 닫으셔도 됩니다.</p>
      </div>
    `);
  } catch (error) {
    console.error("Desktop Google Callback Error:", error);
    if (state) {
      desktopOAuthSessions.failDesktopOAuthSession(
        state as string,
        "Internal server error during callback processing.",
      );
    }
    next(error);
  }
}

/**
 * 3. Electron 앱 폴링용 상태 조회
 * GET /api/auth/google/desktop/session/:sessionId
 */
export async function getDesktopGoogleSessionStatus(
  req: Request,
  res: Response,
) {
  const { sessionId } = req.params;
  const session = desktopOAuthSessions.getDesktopOAuthSession(sessionId as string);

  if (!session) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: "expired",
      message: "Session not found or expired.",
    });
  }

  res.status(StatusCodes.OK).json(
    desktopOAuthSessions.serializeDesktopOAuthSession(session),
  );
}
