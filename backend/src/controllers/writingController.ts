import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";
import { StatusCodes } from "http-status-codes";
import { generateNextParagraph, generateNextParagraphStream } from "../services/aiService";

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

export async function writeWithAiStream(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.log("writeWithAiStream called", req.body);

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

    // SSE 헤더 설정
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // 1. 유저가 작성한 단락 저장
    const userParagraph = paragraphRepo.create({
      project,
      content: req.body.content,
      writtenBy: "user",
      orderIndex: project.paragraphs.length,
    });
    await paragraphRepo.save(userParagraph);

    // 유저 단락 이벤트 전송
    res.write(
      `data: ${JSON.stringify({
        type: "user",
        paragraph: userParagraph,
      })}\n\n`,
    );

    // 2. AI 단락 생성 (빈 content로 먼저 저장)
    let aiParagraph = paragraphRepo.create({
      project,
      content: "",
      writtenBy: "ai",
      orderIndex: project.paragraphs.length + 1,
    });
    await paragraphRepo.save(aiParagraph);

    // AI 시작 이벤트 전송
    res.write(
      `data: ${JSON.stringify({
        type: "ai_start",
        paragraph: aiParagraph,
      })}\n\n`,
    );

    // 3. AI 단락 생성 및 스트리밍
    let fullContent = "";
    const abortController = new AbortController();

    const handleClose = () => {
      abortController.abort();
      if (fullContent.trim() === "") {
        paragraphRepo.remove(aiParagraph).catch(console.error);
      } else {
        aiParagraph.content = fullContent.trim();
        paragraphRepo.save(aiParagraph).catch(console.error);
      }
    };

    req.on("close", handleClose);

    try {
      const stream = generateNextParagraphStream(
        project,
        [...project.paragraphs, userParagraph],
        {
          prompt: req.body.prompt,
          stage: req.body.stage,
          signal: abortController.signal,
        },
      );

      for await (const chunk of stream) {
        fullContent += chunk;
        res.write(
          `data: ${JSON.stringify({
            type: "chunk",
            content: chunk,
          })}\n\n`,
        );
      }

      // 4. 완료 후 AI 단락 content 업데이트
      aiParagraph.content = fullContent.trim();
      await paragraphRepo.save(aiParagraph);

      // 완료 이벤트 전송
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          paragraph: aiParagraph,
        })}\n\n`,
      );

      res.end();
    } catch (streamError) {
      // 스트림 중 에러 발생 시 처리
      console.error("writeWithAiStream error during streaming:", streamError);
      if (fullContent.trim() === "") {
        await paragraphRepo.remove(aiParagraph);
      }
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: streamError instanceof Error ? streamError.message : "Stream error",
        })}\n\n`,
      );
      res.end();
    } finally {
      req.off("close", handleClose);
    }
  } catch (error) {
    console.error("writeWithAiStream error:", error);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })}\n\n`,
    );
    res.end();
  }
}
