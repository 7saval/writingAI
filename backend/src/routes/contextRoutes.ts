import { Router } from "express";
import { getContext, updateContext } from "../controllers/contextController";
import { ensureAuth } from "../middleware/authMiddleware";
import { checkContextOwnership } from "../middleware/authorizationMiddleware";

export const contextRouter = Router();
contextRouter.get("/:id/context", ensureAuth, checkContextOwnership, getContext);
contextRouter.put(
  "/:id/context",
  ensureAuth,
  checkContextOwnership,
  updateContext,
);
