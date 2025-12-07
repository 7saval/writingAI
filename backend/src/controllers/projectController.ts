import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { StatusCodes } from "http-status-codes";
import { Paragraph } from "../entity/Paragraphs";

// 프로젝트 생성
export async function createProject(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const project = repo.create({
            title: req.body.title,
            genre: req.body.genre ?? 'fantasy',
            description: req.body.description,
            synopsis: req.body.synopsis ?? '',
            lorebook: req.body.lorebook ?? [],
        });
        await repo.save(project);
        res.status(StatusCodes.CREATED).json(project);
    } catch (error) {
        next(error);    // 에러 핸들러로 전달
    }
}

// 프로젝트 목록 조회
export async function getProjects(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const list = await repo.find({
            order: {
                createdAt: 'DESC'
            }   // 최신순 정렬
        });
        res.status(StatusCodes.OK).json(list);
    } catch (error) {
        next(error);    // 에러 핸들러로 전달
    }
}

// 프로젝트 상세 조회
export async function getProjectDetail(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const projectId = Number(req.params.id);

        if (isNaN(projectId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid project ID' });
        }

        const project = await repo.findOne({
            where: {
                id: projectId
            },
            relations: ['paragraphs'],   // 연관된 단락들도 함께 조회
            order: {
                paragraphs: {
                    orderIndex: 'ASC'
                }
            },
        });

        if (!project) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        res.status(StatusCodes.OK).json(project);
    } catch (error) {
        next(error);    // 에러 핸들러로 전달
    }
}

// 프로젝트 수정
export async function updateProject(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const project = await repo.findOneBy({ id: Number(req.params.id) });

        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }

        // 업데이트할 필드만 수정
        if (req.body.title !== undefined) project.title = req.body.title;
        if (req.body.genre !== undefined) project.genre = req.body.genre;
        if (req.body.description !== undefined) project.description = req.body.description;
        if (req.body.synopsis !== undefined) project.synopsis = req.body.synopsis;

        if (req.body.lorebook !== undefined) {
            let lorebookData = req.body.lorebook;
            if (typeof lorebookData === 'string') {
                try {
                    lorebookData = JSON.parse(lorebookData);
                } catch (e) {
                    console.warn('Failed to parse lorebook JSON string:', e);
                    lorebookData = [];
                }
            }
            project.lorebook = lorebookData;
        }

        await repo.save(project);
        res.status(StatusCodes.OK).json(project);
    } catch (error) {
        next(error);
    }
}

// 프로젝트 삭제
export async function deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const projectId = Number(req.params.id);

        if (isNaN(projectId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid project ID' });
        }

        const project = await repo.findOneBy({ id: projectId });

        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }

        await repo.remove(project);
        res.status(StatusCodes.OK).json({ message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
}

// 프로젝트 단락 조회
export async function getProjectParagraphs(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Paragraph);
        const projectId = Number(req.params.id);

        if (isNaN(projectId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid project ID' });
        }

        const paragraphs = await repo.find({
            where: {
                project: { id: projectId }
            },
            order: {
                orderIndex: 'ASC'
            }
        });

        if (!paragraphs) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Paragraphs not found' });
        }

        res.status(StatusCodes.OK).json(paragraphs);
    } catch (error) {
        next(error);
    }
}