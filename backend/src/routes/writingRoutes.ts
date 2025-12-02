import { Router } from "express";
import { writeWithAi } from "../controllers/writingController";

export const writingRouter = Router();
writingRouter.post('/:id/write', writeWithAi);