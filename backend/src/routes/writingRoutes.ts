import { Router } from "express";
import { writeWithAi, writeWithAiStream } from "../controllers/writingController";
import { ensureAuth } from "../middleware/authMiddleware";
import { checkProjectOwnership } from "../middleware/authorizationMiddleware";

export const writingRouter = Router();
writingRouter.post('/:id/write', ensureAuth, checkProjectOwnership, writeWithAi);
writingRouter.post('/:id/write/stream', ensureAuth, checkProjectOwnership, writeWithAiStream);