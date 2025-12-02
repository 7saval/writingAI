import { Router } from "express";
import { createProject, getProjectDetail, getProjects } from "../controllers/projectController";

export const projectRouter = Router();

projectRouter.post('/', createProject);
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectDetail);