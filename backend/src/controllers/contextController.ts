import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { StatusCodes } from "http-status-codes";

export const getContext = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    });

    if (!project) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
    }

    // 소유권 검증
    if (project.user.id !== req.user!.id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden" });
    }

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
) {
  try {
    const repo = AppDataSource.getRepository(Project);
    const project = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    });

    if (!project) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found" });
    }

    // 소유권 검증
    if (project.user.id !== req.user!.id) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden" });
    }

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
    await repo.save(project);

    res.status(StatusCodes.OK).json({
      message: "Context updated successfully",
      projectId: project.id,
    });
  } catch (error) {
    next(error);
  }
}
