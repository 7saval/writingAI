import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";
import { StatusCodes } from "http-status-codes";
import { generateNextParagraph } from "../services/aiService";

export async function writeWithAi(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("writeWithAi called", req.body);

  try {
    const projectRepo = AppDataSource.getRepository(Project);
    const paragraphRepo = AppDataSource.getRepository(Paragraph);

    // 프로젝트와 기존 단락 조회
    const project = await projectRepo.findOne({
      where: {
        id: Number(req.params.id),
      },
      relations: ["paragraphs"],
    });

    if (!project) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
    }

    // 1. 유저가 작성한 단락 저장
    const userParagraph = paragraphRepo.create({
      project,
      content: req.body.content,
      writtenBy: "user",
      orderIndex: project.paragraphs.length,
    });
    await paragraphRepo.save(userParagraph);

    console.log("Before AI:", project, project.paragraphs);
    // 2. AI가 다음 단락 생성
    // 프론트엔드에서 보낸 prompt(지시사항)와 stage(집필 단계)를 함께 전달
    const aiText = await generateNextParagraph(
      project,
      [...project.paragraphs, userParagraph],
      {
        prompt: req.body.prompt,
        stage: req.body.stage,
      },
    );

    console.log("After AI:", aiText);
    if (!aiText || aiText.trim() === "") {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "AI paragraph generation failed" });
    }

    // 3. AI 단락 저장
    const aiParagraph = paragraphRepo.create({
      project,
      content: aiText.trim(),
      writtenBy: "ai",
      orderIndex: project.paragraphs.length + 1,
    });
    await paragraphRepo.save(aiParagraph);
    return res.status(StatusCodes.OK).json({ userParagraph, aiParagraph });
  } catch (error) {
    next(error);
  }
}
