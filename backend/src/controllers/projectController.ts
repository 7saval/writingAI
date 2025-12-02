import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { StatusCodes } from "http-status-codes";

// 프로젝트 생성
export async function createProject(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Project);
        const project = repo.create({
            title: req.body.title,
            genre: req.body.genre ?? 'fantasy',
            description: req.body.description,
            synopsis: req.body.synopsis ?? '',
            lorebook: req.body.lorebook ?? '',
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
        const project = await repo.findOne({
            where: {
                id: Number(req.params.id)
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