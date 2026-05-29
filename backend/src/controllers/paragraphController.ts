/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Paragraph } from "../entity/Paragraphs";
import { Project } from "../entity/Projects";
import { generateNextParagraph } from "../services/aiService";
import { StatusCodes } from "http-status-codes";

// 단락 수정
export async function updateParagraph(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkParagraphOwnership 미들웨어에서 처리됨
    const paragraph = req.paragraph!;

    // 내용만 수정 가능
    if (req.body.content !== undefined) {
      paragraph.content = req.body.content;
    }

    const repo = AppDataSource.getRepository(Paragraph);
    await repo.save(paragraph);

    res.json(paragraph);
  } catch (error) {
    next(error);
  }
}

// 단락 삭제
export async function deleteParagraph(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkParagraphOwnership 미들웨어에서 처리됨
    const paragraph = req.paragraph!;

    const repo = AppDataSource.getRepository(Paragraph);
    await repo.remove(paragraph);
    res.json({
      message: "Paragraph deleted successfully",
      deletedId: paragraph.id,
    });
  } catch (error) {
    next(error);
  }
}

// AI 단락 재생성
export async function regenerateAiParagraph(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkParagraphOwnership 미들웨어에서 처리됨
    const paragraph = req.paragraph!;

    // AI가 작성한 단락만 재생성 가능
    if (paragraph.writtenBy !== "ai") {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Only AI paragraphs can be regenerated" });
      return;
    }

    // 프로젝트와 이전 단락들 조회
    const projectRepo = AppDataSource.getRepository(Project);
    const project = await projectRepo.findOne({
      where: {
        id: paragraph.project.id,
      },
      relations: ["paragraphs"],
    });

    if (!project) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
      return;
    }

    // 재생성할 단락 이전의 단락들만 컨텍스트로 사용
    const previousParagraphs = project.paragraphs
      .filter((p) => (p.orderIndex ?? 0) < (paragraph.orderIndex ?? 0))
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

    // AI 텍스트 재생성 (옵션 파라미터 지원)
    const temperature = req.body?.temperature || 0.9;
    const maxTokens = req.body?.maxTokens || 500;

    const aiText = await generateNextParagraph(
      project,
      previousParagraphs,
      { temperature, maxTokens },
    );

    // 단락 내용 업데이트
    paragraph.content = aiText?.trim();
    const paragraphRepo = AppDataSource.getRepository(Paragraph);
    await paragraphRepo.save(paragraph);

    res.status(StatusCodes.OK).json(paragraph);
  } catch (error) {
    next(error);
  }
}
