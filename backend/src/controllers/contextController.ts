/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { StatusCodes } from "http-status-codes";

export const getContext = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 소유권 검증은 checkContextOwnership 미들웨어에서 처리됨
    const project = req.project!;

    res.status(StatusCodes.OK).json({
      synopsis: project.synopsis ?? "",
      lorebook: project.lorebook ? project.lorebook : "",
    });
  } catch (error) {
    next(error);
  }
};

export async function updateContext(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 소유권 검증은 checkContextOwnership 미들웨어에서 처리됨
    const project = req.project!;

    // 업데이트할 필드만 수정
    if (req.body.synopsis !== undefined) {
      project.synopsis = req.body.synopsis;
    }

    if (req.body.lorebook !== undefined) {
      let lorebookData = req.body.lorebook;
      if (typeof lorebookData === "string") {
        try {
          lorebookData = JSON.parse(lorebookData);
        } catch (e) {
          console.warn("Failed to parse lorebook JSON string:", e);
          lorebookData = [];
        }
      }
      project.lorebook = lorebookData;
    }

    const repo = AppDataSource.getRepository(Project);
    await repo.save(project);

    res.status(StatusCodes.OK).json({
      message: "Context updated successfully",
      projectId: project.id,
    });
  } catch (error) {
    next(error);
  }
}
