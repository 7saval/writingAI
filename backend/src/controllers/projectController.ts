/// <reference path="../types/express.d.ts" />

import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { StatusCodes } from "http-status-codes";
import { Paragraph } from "../entity/Paragraphs";

// 프로젝트 생성
export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = repo.create({
      title: req.body.title,
      genre: req.body.genre ?? "fantasy",
      description: req.body.description,
      synopsis: req.body.synopsis ?? "",
      lorebook: req.body.lorebook ?? [],
      user: req.user!,
    });
    await repo.save(project);
    res.status(StatusCodes.CREATED).json(project);
  } catch (error) {
    next(error);
  }
}

// 프로젝트 목록 조회
export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;

    const repo = AppDataSource.getRepository(Project);
    const list = await repo.find({
      where: {
        user: { id: userId },
      },
      order: {
        createdAt: "DESC",
      },
    });
    res.status(StatusCodes.OK).json(list);
  } catch (error) {
    next(error);
  }
}

// 프로젝트 상세 조회
export async function getProjectDetail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkProjectOwnership 미들웨어에서 처리됨
    let project: Project | null = req.project ?? null;

    if (!project || !project.paragraphs) {
      const projectRepo = AppDataSource.getRepository(Project);
      project = await projectRepo.findOne({
        where: { id: Number(req.params.id) },
        relations: ["paragraphs", "user"],
        order: { paragraphs: { orderIndex: "ASC" } },
      });
    }

    if (!project) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
      return;
    }

    res.status(StatusCodes.OK).json(project);
  } catch (error) {
    next(error);
  }
}

// 프로젝트 수정
export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkProjectOwnership 미들웨어에서 처리됨
    const project = req.project!;

    // 업데이트할 필드만 수정
    if (req.body.title !== undefined) project.title = req.body.title;
    if (req.body.genre !== undefined) project.genre = req.body.genre;
    if (req.body.description !== undefined)
      project.description = req.body.description;
    if (req.body.synopsis !== undefined) project.synopsis = req.body.synopsis;

    if (req.body.lorebook !== undefined) {
      let lorebookData = req.body.lorebook;
      if (typeof lorebookData === "string") {
        try {
          const parsed = JSON.parse(lorebookData);
          lorebookData = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn("Failed to parse lorebook JSON string:", e);
          lorebookData = [];
        }
      } else if (!Array.isArray(lorebookData)) {
        lorebookData = [];
      }
      project.lorebook = lorebookData;
    }

    const repo = AppDataSource.getRepository(Project);
    await repo.save(project);
    res.status(StatusCodes.OK).json(project);
  } catch (error) {
    next(error);
  }
}

// 프로젝트 삭제
export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkProjectOwnership 미들웨어에서 처리됨
    const project = req.project!;

    const repo = AppDataSource.getRepository(Project);
    await repo.remove(project);
    res
      .status(StatusCodes.OK)
      .json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// 프로젝트 단락 조회
export async function getProjectParagraphs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 프로젝트 소유권은 checkProjectOwnership 미들웨어에서 검증됨
    const projectId = Number(req.params.id);

    const paragraphRepo = AppDataSource.getRepository(Paragraph);
    const paragraphs = await paragraphRepo.find({
      where: {
        project: { id: projectId },
      },
      order: {
        orderIndex: "ASC",
      },
    });

    if (!paragraphs || paragraphs.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Paragraphs not found" });
      return;
    }

    res.status(StatusCodes.OK).json(paragraphs);
  } catch (error) {
    next(error);
  }
}
