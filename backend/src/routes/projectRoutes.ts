import { Router } from "express";
import { createProject, getProjectDetail, getProjects, updateProject } from "../controllers/projectController";

export const projectRouter = Router();

projectRouter.post('/', createProject);
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectDetail);
projectRouter.put('/:id', updateProject);