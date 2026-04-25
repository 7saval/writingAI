export type DesktopOAuthUser = {
  username: string;
  email?: string;
};

export type DesktopOAuthResult = {
  isNewUser?: boolean;
  signupToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: DesktopOAuthUser;
  profile?: {
    email: string;
    name: string;
  };
};

export type DesktopOAuthSessionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "expired";

export type DesktopOAuthSession = {
  sessionId: string;
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  status: DesktopOAuthSessionStatus;
  createdAt: number;
  expiresAt: number;
  result?: DesktopOAuthResult;
  message?: string;
};
