import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";
import { StatusCodes } from "http-status-codes";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { generateNextParagraphStream, buildContext, buildSystemPrompt } from "../services/aiService";
import { runWritingGraph, runVariantsGraph } from "../services/langgraph";
import {
  createVariantSession,
  getVariantSession,
  deleteVariantSession,
} from "../services/variantSessionStore";
import { initSseResponse } from "../utils/sseHelpers";
import { VARIANT_CONFIGS } from "../services/langgraph/nodes/generateVariants";
import { evaluateSingleVariant } from "../services/langgraph/nodes/qualityEvaluator";
import { checkSingleVariant } from "../services/langgraph/nodes/loreConsistencyChecker";

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
    // 2. AI가 다음 단락 생성 (LangGraph 파이프라인)
    const aiText = await runWritingGraph(
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

export async function generateVariantsStreamController(
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const projectRepo = AppDataSource.getRepository(Project);
  const paragraphRepo = AppDataSource.getRepository(Paragraph);

  const send = initSseResponse(res);

  try {
    const project = await projectRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["paragraphs"],
    });

    if (!project) {
      send({ type: "error", message: "Project not found" });
      return res.end();
    }

    // 1. 유저 단락 저장
    const userParagraph = paragraphRepo.create({
      project,
      content: req.body.content,
      writtenBy: "user",
      orderIndex: project.paragraphs.length,
    });
    await paragraphRepo.save(userParagraph);
    send({ type: "user_paragraph", paragraph: userParagraph });

    // 2. 컨텍스트 메시지 빌드
    const rawMessages = buildContext(
      project,
      [...project.paragraphs, userParagraph],
      { includeSynopsis: true, includeLorebook: true, includeDescription: true, maxParagraphs: 10, stage: req.body.stage },
    );
    const finalUserContent = req.body.prompt
      ? `[사용자 지시사항]\n${req.body.prompt}\n\n위 지시사항을 반영하여 다음 단락을 이어서 작성해 주세요.`
      : "AI, 다음 단락을 작성해 주세요.";
    const langchainMessages = [
      new SystemMessage(buildSystemPrompt(project.genre)),
      ...rawMessages.map((msg) => {
        const content = typeof msg.content === "string" ? msg.content : "";
        return msg.role === "assistant"
          ? new AIMessage(content)
          : new HumanMessage(content);
      }),
      new HumanMessage(finalUserContent),
    ];

    // 3. 3개 변형 병렬 스트리밍
    const streamVariant = async (config: (typeof VARIANT_CONFIGS)[number]) => {
      const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: config.temperature,
        maxTokens: 500,
        streaming: true,
      });

      let content = "";
      for await (const chunk of await model.stream(langchainMessages)) {
        const text = typeof chunk.content === "string" ? chunk.content : "";
        if (text) {
          content += text;
          send({ type: "chunk", variantId: config.id, content: text });
        }
      }
      send({ type: "variant_done", variantId: config.id });
      return { id: config.id, content: content.trim(), temperature: config.temperature, label: config.label };
    };

    const results = await Promise.allSettled(
      VARIANT_CONFIGS.map((config) => streamVariant(config)),
    );

    const variants = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v) => v.content.length >= 50);

    if (variants.length === 0) {
      send({ type: "error", message: "모든 변형 생성에 실패했습니다." });
      return res.end();
    }

    // 4. 품질 평가 + 로어북 검증 (병렬)
    send({ type: "evaluating" });

    const allParagraphs = [...project.paragraphs, userParagraph];
    const contextSummary = allParagraphs.slice(-3).map((p) => p.content).join(" ");
    const genre = project.genre ?? "기타";
    const loreNotes = project.lorebook ?? [];

    const [evaluations, loreChecks] = await Promise.all([
      Promise.all(variants.map((v) => evaluateSingleVariant(v, contextSummary, genre))),
      Promise.all(variants.map((v) => checkSingleVariant(v.content, loreNotes))),
    ]);

    const finalVariants = variants.map((v, i) => ({
      ...v,
      qualityScore: evaluations[i].score,
      ...(loreChecks[i] ? { loreWarning: loreChecks[i] } : {}),
    }));

    // 5. 세션 저장 후 완료 이벤트
    const sessionId = createVariantSession({
      variants: finalVariants,
      projectId: project.id,
      userParagraphId: userParagraph.id,
      nextOrderIndex: project.paragraphs.length + 1,
    });

    send({ type: "done", sessionId, variants: finalVariants });
    res.end();
  } catch (error) {
    console.error("generateVariantsStreamController error:", error);
    send({ type: "error", message: error instanceof Error ? error.message : "Unknown error" });
    res.end();
  }
}

export async function generateVariantsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const projectRepo = AppDataSource.getRepository(Project);
    const paragraphRepo = AppDataSource.getRepository(Paragraph);

    const project = await projectRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["paragraphs"],
    });

    if (!project) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
    }

    // 1. 유저 단락 저장
    const userParagraph = paragraphRepo.create({
      project,
      content: req.body.content,
      writtenBy: "user",
      orderIndex: project.paragraphs.length,
    });
    await paragraphRepo.save(userParagraph);

    // 2. LangGraph 파이프라인으로 변형 생성
    const variants = await runVariantsGraph(
      project,
      [...project.paragraphs, userParagraph],
      {
        prompt: req.body.prompt,
        stage: req.body.stage,
      },
    );

    // 3. 세션 저장 (5분 TTL)
    const sessionId = createVariantSession({
      variants,
      projectId: project.id,
      userParagraphId: userParagraph.id,
      nextOrderIndex: project.paragraphs.length + 1,
    });

    return res.status(StatusCodes.OK).json({ sessionId, variants, userParagraph });
  } catch (error) {
    next(error);
  }
}

export async function selectVariantController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const paragraphRepo = AppDataSource.getRepository(Paragraph);
    const projectRepo = AppDataSource.getRepository(Project);

    const { sessionId, variantId } = req.body;

    const session = getVariantSession(sessionId);
    if (!session) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Session expired or not found" });
    }

    if (session.projectId !== Number(req.params.id)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Session does not belong to this project" });
    }

    const selectedVariant = session.variants.find((v) => v.id === variantId);
    if (!selectedVariant) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Variant not found" });
    }

    const project = await projectRepo.findOne({
      where: { id: session.projectId },
    });

    if (!project) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
    }

    // AI 단락 저장
    const aiParagraph = paragraphRepo.create({
      project,
      content: selectedVariant.content,
      writtenBy: "ai",
      orderIndex: session.nextOrderIndex,
    });
    await paragraphRepo.save(aiParagraph);

    deleteVariantSession(sessionId);

    return res.status(StatusCodes.OK).json({ aiParagraph });
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

    const send = initSseResponse(res);

    // 1. 유저가 작성한 단락 저장
    const userParagraph = paragraphRepo.create({
      project,
      content: req.body.content,
      writtenBy: "user",
      orderIndex: project.paragraphs.length,
    });
    await paragraphRepo.save(userParagraph);
    send({ type: "user", paragraph: userParagraph });

    // 2. AI 단락 생성 (빈 content로 먼저 저장)
    let aiParagraph = paragraphRepo.create({
      project,
      content: "",
      writtenBy: "ai",
      orderIndex: project.paragraphs.length + 1,
    });
    await paragraphRepo.save(aiParagraph);
    send({ type: "ai_start", paragraph: aiParagraph });

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
        send({ type: "chunk", content: chunk });
      }

      aiParagraph.content = fullContent.trim();
      await paragraphRepo.save(aiParagraph);
      send({ type: "done", paragraph: aiParagraph });
      res.end();
    } catch (streamError) {
      console.error("writeWithAiStream error during streaming:", streamError);
      if (fullContent.trim() === "") {
        await paragraphRepo.remove(aiParagraph);
      }
      send({ type: "error", message: streamError instanceof Error ? streamError.message : "Stream error" });
      res.end();
    } finally {
      req.off("close", handleClose);
    }
  } catch (error) {
    console.error("writeWithAiStream error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : "Unknown error" })}\n\n`);
    res.end();
  }
}
