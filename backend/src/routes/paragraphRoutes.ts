import { Router } from "express";
import {
  deleteParagraph,
  regenerateAiParagraph,
  updateParagraph,
} from "../controllers/paragraphController";
import { ensureAuth } from "../middleware/authMiddleware";
import { checkParagraphOwnership } from "../middleware/authorizationMiddleware";

export const paragraphRouter = Router();

paragraphRouter.put("/:id", ensureAuth, checkParagraphOwnership, updateParagraph);
paragraphRouter.delete(
  "/:id",
  ensureAuth,
  checkParagraphOwnership,
  deleteParagraph,
);
paragraphRouter.post(
  "/:id/regenerate",
  ensureAuth,
  checkParagraphOwnership,
  regenerateAiParagraph,
);
