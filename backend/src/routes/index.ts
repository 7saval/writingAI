import { Router } from "express";
import { projectRouter } from "./projectRoutes";
import { writingRouter } from "./writingRoutes";
import { contextRouter } from "./contextRoutes";

export const router = Router();

router.use('/projects', projectRouter);
router.use('/projects', contextRouter);
router.use('/writing', writingRouter);