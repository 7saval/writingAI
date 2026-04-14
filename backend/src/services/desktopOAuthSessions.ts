import crypto from "crypto";
import { DesktopOAuthResult, DesktopOAuthSession } from "../types/desktopOAuth";

const SESSION_TTL_MS = 5 * 60 * 1000;

const sessions = new Map<string, DesktopOAuthSession>();
const stateToSessionId = new Map<string, string>();

// OAuth session, state, PKCE verifier에 쓸 URL-safe random token을 만든다.
function createRandomToken() {
  return crypto.randomBytes(32).toString("base64url");
}

// PKCE verifier를 Google OAuth 요청에 보낼 SHA-256 challenge로 변환한다.
function createCodeChallenge(codeVerifier: string) {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
}

// session의 만료 시간을 현재 시각과 비교한다.
function isExpired(session: DesktopOAuthSession) {
  return Date.now() > session.expiresAt;
}

// 조회 시점에 pending session이 만료되어 있으면 expired 상태로 바꾼다.
function markExpired(session: DesktopOAuthSession) {
  if (session.status === "pending" && isExpired(session)) {
    session.status = "expired";
    session.message = "Google login session expired.";
  }

  return session;
}

// sessionId/state 양쪽 index에서 session을 제거한다.
function deleteSession(session: DesktopOAuthSession) {
  sessions.delete(session.sessionId);
  stateToSessionId.delete(session.state);
}

// 오래된 session이 메모리에 계속 쌓이지 않도록 만료된 항목을 정리한다.
export function cleanupExpiredDesktopOAuthSessions() {
  for (const session of sessions.values()) {
    if (isExpired(session)) {
      deleteSession(session);
    }
  }
}

// Electron Google 로그인 시작 시 호출해서 polling용 session과 PKCE 값을 만든다.
export function createDesktopOAuthSession() {
  cleanupExpiredDesktopOAuthSessions();

  const sessionId = createRandomToken();
  const state = createRandomToken();
  const codeVerifier = createRandomToken();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const createdAt = Date.now();

  const session: DesktopOAuthSession = {
    sessionId,
    state,
    codeVerifier,
    codeChallenge,
    status: "pending",
    createdAt,
    expiresAt: createdAt + SESSION_TTL_MS,
  };

  sessions.set(sessionId, session);
  stateToSessionId.set(state, sessionId);

  return session;
}

// Electron 앱이 sessionId로 polling할 때 현재 session 상태를 조회한다.
export function getDesktopOAuthSession(sessionId: string) {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  return markExpired(session);
}

// Google callback에서 state 값으로 원래 OAuth session을 찾는다.
export function getDesktopOAuthSessionByState(state: string) {
  const sessionId = stateToSessionId.get(state);

  if (!sessionId) {
    return null;
  }

  return getDesktopOAuthSession(sessionId);
}

// Google code 교환과 앱 로그인 토큰 발급이 끝났을 때 session을 완료 상태로 바꾼다.
export function completeDesktopOAuthSession(
  state: string,
  result: DesktopOAuthResult,
) {
  const session = getDesktopOAuthSessionByState(state);

  if (!session || session.status === "expired") {
    return null;
  }

  session.status = "completed";
  session.result = result;
  session.message = undefined;

  return session;
}

// Google callback 처리 중 오류가 났을 때 Electron polling에 실패 상태를 전달한다.
export function failDesktopOAuthSession(state: string, message: string) {
  const session = getDesktopOAuthSessionByState(state);

  if (!session || session.status === "expired") {
    return null;
  }

  session.status = "failed";
  session.message = message;

  return session;
}

// polling API 응답에 노출해도 되는 값만 골라 반환한다.
export function serializeDesktopOAuthSession(session: DesktopOAuthSession) {
  return {
    status: session.status,
    message: session.message,
    ...(session.status === "completed" ? session.result : {}),
  };
}
