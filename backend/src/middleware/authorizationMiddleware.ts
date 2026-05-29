/// <reference path="../types/express.d.ts" />

import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";

/**
 * 프로젝트 소유권 검증 미들웨어
 * 현재 사용자가 요청한 프로젝트의 소유자인지 확인
 */
export async function checkProjectOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const projectId = Number(req.params.id);

    if (isNaN(projectId)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid project ID" });
      return;
    }

    const projectRepo = AppDataSource.getRepository(Project);
    const project = await projectRepo.findOne({
      where: { id: projectId },
      relations: ["user"],
    });

    if (!project) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
      return;
    }

    // 소유권 검증
    if (!req.user || project.user.id !== req.user.id) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden" });
      return;
    }

    // 다음 미들웨어/핸들러에서 사용할 수 있도록 req에 저장
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * 단락 소유권 검증 미들웨어
 * 현재 사용자가 단락이 속한 프로젝트의 소유자인지 확인
 */
export async function checkParagraphOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const paragraphId = Number(req.params.id);

    if (isNaN(paragraphId)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid paragraph ID" });
      return;
    }

    const paragraphRepo = AppDataSource.getRepository(Paragraph);
    const paragraph = await paragraphRepo.findOne({
      where: { id: paragraphId },
      relations: ["project", "project.user"],
    });

    if (!paragraph) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Paragraph not found" });
      return;
    }

    // 단락이 속한 프로젝트의 소유권 검증
    if (!req.user || paragraph.project.user.id !== req.user.id) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden" });
      return;
    }

    // 다음 미들웨어/핸들러에서 사용할 수 있도록 req에 저장
    req.paragraph = paragraph;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * 컨텍스트(시놉시스, 로어북) 소유권 검증 미들웨어
 * 현재 사용자가 컨텍스트가 속한 프로젝트의 소유자인지 확인
 */
export async function checkContextOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const projectId = Number(req.params.id);

    if (isNaN(projectId)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid project ID" });
      return;
    }

    const projectRepo = AppDataSource.getRepository(Project);
    const project = await projectRepo.findOne({
      where: { id: projectId },
      relations: ["user"],
    });

    if (!project) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
      return;
    }

    // 소유권 검증
    if (!req.user || project.user.id !== req.user.id) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden" });
      return;
    }

    // 다음 미들웨어/핸들러에서 사용할 수 있도록 req에 저장
    req.project = project;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * 일반 리소스 소유권 검증 미들웨어 팩토리
 * 리소스 타입을 동적으로 지정할 수 있는 함수형 미들웨어
 *
 * 사용 예시:
 * router.put('/:id', ensureAuth, checkResourceOwnership('Project', 'id'), updateProject);
 */
export function checkResourceOwnership(
  resourceType: "Project" | "Paragraph",
  paramName: string = "id",
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const resourceId = Number(req.params[paramName]);

      if (isNaN(resourceId)) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `Invalid ${resourceType} ID` });
        return;
      }

      let resource: Project | Paragraph | null;

      if (resourceType === "Project") {
        const repo = AppDataSource.getRepository(Project);
        resource = await repo.findOne({
          where: { id: resourceId },
          relations: ["user"],
        });
      } else if (resourceType === "Paragraph") {
        const repo = AppDataSource.getRepository(Paragraph);
        resource = await repo.findOne({
          where: { id: resourceId },
          relations: ["project", "project.user"],
        });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Invalid resource type" });
        return;
      }

      if (!resource) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: `${resourceType} not found` });
        return;
      }

      // 소유권 검증 (Paragraph는 project.user, Project는 user 확인)
      const ownerId =
        resourceType === "Paragraph"
          ? (resource as Paragraph).project.user.id
          : (resource as Project).user.id;

      if (!req.user || ownerId !== req.user.id) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Forbidden" });
        return;
      }

      // 다음 미들웨어/핸들러에서 사용할 수 있도록 req에 저장
      req.resource = resource;

      next();
    } catch (error) {
      next(error);
    }
  };
}
