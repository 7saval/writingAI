import { Router } from "express";
import { checkEmail, forgotPassword, login, logout, resetPassword, signup, verifyUser, googleLogin, completeSocialSignup, refresh } from "../controllers/authController";
import {
  createDesktopGoogleSession,
  getDesktopGoogleSessionStatus,
  handleDesktopGoogleCallback,
} from "../controllers/desktopGoogleAuthController";
import { ensureAuth } from "../middleware/authMiddleware";

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
authRouter.post('/google', googleLogin);
authRouter.post('/google/desktop/session', createDesktopGoogleSession);
authRouter.get('/google/desktop/callback', handleDesktopGoogleCallback);
authRouter.get('/google/desktop/session/:sessionId', getDesktopGoogleSessionStatus);
authRouter.post('/social-signup', completeSocialSignup);
authRouter.get('/verify-user', ensureAuth, verifyUser);
authRouter.post('/check-email', checkEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);