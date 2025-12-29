import { Router } from "express";
import { checkEmail, forgotPassword, login, logout, resetPassword, signup, verifyUser } from "../controllers/authController";

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/verify-user', verifyUser);
authRouter.post('/check-email', checkEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);