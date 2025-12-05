import { Router } from "express";
import { deleteParagraph, regenerateAiParagraph, updateParagraph } from "../controllers/paragraphController";

export const paragraphRouter = Router();

// 단락 수정
paragraphRouter.put('/:id', updateParagraph);

// 단락 삭제
paragraphRouter.delete('/:id', deleteParagraph);

// AI 단락 재생성
paragraphRouter.post('/:id/regernerate', regenerateAiParagraph);