import { Router } from "express";
import { checkEmail, forgotPassword, login, logout, resetPassword, signup, verifyUser, googleLogin } from "../controllers/authController";
import { ensureAuth } from "../middleware/authMiddleware";

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/google', googleLogin);
authRouter.get('/verify-user', ensureAuth, verifyUser);
authRouter.post('/check-email', checkEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);