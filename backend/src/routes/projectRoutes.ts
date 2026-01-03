import { Router } from "express";
import {
    createProject,
    deleteProject,
    getProjectDetail,
    getProjectParagraphs,
    getProjects,
    updateProject
} from "../controllers/projectController";
import { ensureAuth } from "../middleware/authMiddleware";

export const projectRouter = Router();

projectRouter.post('/', ensureAuth, createProject);
projectRouter.get('/', ensureAuth, getProjects);
projectRouter.get('/:id', getProjectDetail);
projectRouter.get('/:id/paragraphs', getProjectParagraphs); // 프로젝트 단락 조회
projectRouter.put('/:id', updateProject);
projectRouter.delete('/:id', deleteProject); // 프로젝트 삭제