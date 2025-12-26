import { Router } from "express";
import { projectRouter } from "./projectRoutes";
import { writingRouter } from "./writingRoutes";
import { contextRouter } from "./contextRoutes";
import { paragraphRouter } from "./paragraphRoutes";
import { authRouter } from "./authRoutes";

export const router = Router();

router.use('/projects', projectRouter);
router.use('/projects', contextRouter);
router.use('/paragraphs', paragraphRouter);
router.use('/writing', writingRouter);
router.use('/auth', authRouter);