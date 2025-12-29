import { Router } from "express";
import { checkEmail, forgotPassword, login, resetPassword, signup } from "../controllers/authController";

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/check-email', checkEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);