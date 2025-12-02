import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";
import { StatusCodes } from "http-status-codes";
import { generateNextParagraph } from "../services/aiService";

export async function writeWithAi(req: Request, res: Response, next: NextFunction) {
    try {
        const projectRepo = AppDataSource.getRepository(Project);
        const paragraphRepo = AppDataSource.getRepository(Paragraph);

        // 프로젝트와 기존 단락 조회
        const project = await projectRepo.findOne({
            where: {
                id: Number(req.params.id)
            },
            relations: ['paragraphs'],
        });

        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }

        // 1. 유저가 작성한 단락 저장
        const userParagraph = paragraphRepo.create({
            project,
            content: req.body.content,
            writtenBy: 'user',
            orderIndex: project.paragraphs.length,
        });
        await paragraphRepo.save(userParagraph);

        // 2. AI가 다음 단락 생성
        const aiText = await generateNextParagraph(project, [...project.paragraphs, userParagraph]);

        // 3. AI 단락 저장
        const aiParagraph = paragraphRepo.create({
            project,
            content: aiText?.trim(),
            writtenBy: 'ai',
            orderIndex: project.paragraphs.length + 1,
        });
        await paragraphRepo.save(aiParagraph);
        return res.status(StatusCodes.OK).json({ userParagraph, aiParagraph });
    } catch (error) {
        next(error);
    }
}