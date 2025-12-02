import { Router } from "express";
import { projectRouter } from "./projectRoutes";
import { writingRouter } from "./writingRoutes";

export const router = Router();

router.use('/projects', projectRouter);
router.use('/writing', writingRouter);