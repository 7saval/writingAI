import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { StatusCodes } from "http-status-codes";

export const getContext = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const repo = AppDataSource.getRepository(Project);
        const project = await repo.findOneBy({ id: Number(req.params.id) });
        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }

        res.status(StatusCodes.OK).json({
            synopsis: project.synopsis ?? '',
            lorebook: project.lorebook ? project.lorebook : '',
        });

    } catch (error) {
        next(error);
    }
}

export async function updateContext(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const project = await repo.findOneBy({ id: Number(req.params.id) });
        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }

        project.synopsis = req.body.synopsis ?? null;
        let lorebookData = req.body.lorebook;
        if (typeof lorebookData === 'string') {
            try {
                lorebookData = JSON.parse(lorebookData);
            } catch (e) {
                console.warn('Failed to parse lorebook JSON string:', e);
                lorebookData = [];
            }
        }
        project.lorebook = lorebookData ?? [];
        await repo.save(project);

        res.status(StatusCodes.OK).json({
            message: 'Context updated successfully',
            projectId: project.id
        });
    } catch (error) {
        next(error);
    }
}