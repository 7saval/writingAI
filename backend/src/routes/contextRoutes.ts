import { Router } from "express";
import { getContext, updateContext } from "../controllers/contextController";

export const contextRouter = Router();
contextRouter.get('/:id/context', getContext);
contextRouter.put('/:id/context', updateContext);