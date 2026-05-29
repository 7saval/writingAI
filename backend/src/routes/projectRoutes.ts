import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectDetail,
  getProjectParagraphs,
  getProjects,
  updateProject,
} from "../controllers/projectController";
import { ensureAuth } from "../middleware/authMiddleware";

export const projectRouter = Router();

projectRouter.post("/", ensureAuth, createProject);
projectRouter.get("/", ensureAuth, getProjects);
projectRouter.get("/:id", ensureAuth, getProjectDetail);
projectRouter.get("/:id/paragraphs", ensureAuth, getProjectParagraphs); // 프로젝트 단락 조회
projectRouter.put("/:id", ensureAuth, updateProject);
projectRouter.delete("/:id", ensureAuth, deleteProject); // 프로젝트 삭제
