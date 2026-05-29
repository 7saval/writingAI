import { Router } from "express";
import { getContext, updateContext } from "../controllers/contextController";
import { ensureAuth } from "../middleware/authMiddleware";

export const contextRouter = Router();
contextRouter.get("/:id/context", ensureAuth, getContext);
contextRouter.put("/:id/context", ensureAuth, updateContext);
