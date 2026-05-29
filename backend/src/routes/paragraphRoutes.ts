import { Router } from "express";
import {
  deleteParagraph,
  regenerateAiParagraph,
  updateParagraph,
} from "../controllers/paragraphController";
import { ensureAuth } from "../middleware/authMiddleware";

export const paragraphRouter = Router();

// 단락 수정
paragraphRouter.put("/:id", ensureAuth, updateParagraph);

// 단락 삭제
paragraphRouter.delete("/:id", ensureAuth, deleteParagraph);

// AI 단락 재생성
paragraphRouter.post("/:id/regenerate", ensureAuth, regenerateAiParagraph);
