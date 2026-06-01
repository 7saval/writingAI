import { Router } from "express";
import { writeWithAi, writeWithAiStream } from "../controllers/writingController";

export const writingRouter = Router();
writingRouter.post('/:id/write', writeWithAi);
writingRouter.post('/:id/write/stream', writeWithAiStream);