import { Router } from "express";
import {
  writeWithAi,
  writeWithAiStream,
  generateVariantsController,
  generateVariantsStreamController,
  selectVariantController,
} from "../controllers/writingController";
import { ensureAuth } from "../middleware/authMiddleware";
import { checkProjectOwnership } from "../middleware/authorizationMiddleware";

export const writingRouter = Router();
writingRouter.post("/:id/write", ensureAuth, checkProjectOwnership, writeWithAi);
writingRouter.post("/:id/write/stream", ensureAuth, checkProjectOwnership, writeWithAiStream);
writingRouter.post("/:id/write/variants", ensureAuth, checkProjectOwnership, generateVariantsController);
writingRouter.post("/:id/write/variants/stream", ensureAuth, checkProjectOwnership, generateVariantsStreamController);
writingRouter.post("/:id/write/select", ensureAuth, checkProjectOwnership, selectVariantController);
