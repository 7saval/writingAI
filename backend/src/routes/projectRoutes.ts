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
import { checkProjectOwnership } from "../middleware/authorizationMiddleware";

export const projectRouter = Router();

projectRouter.post("/", ensureAuth, createProject);
projectRouter.get("/", ensureAuth, getProjects);
projectRouter.get("/:id", ensureAuth, checkProjectOwnership, getProjectDetail);
projectRouter.get(
  "/:id/paragraphs",
  ensureAuth,
  checkProjectOwnership,
  getProjectParagraphs,
);
projectRouter.put("/:id", ensureAuth, checkProjectOwnership, updateProject);
projectRouter.delete(
  "/:id",
  ensureAuth,
  checkProjectOwnership,
  deleteProject,
);
