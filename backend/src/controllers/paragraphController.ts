import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Paragraph } from '../entity/Paragraphs';
import { Project } from '../entity/Projects';
import { generateNextParagraph } from '../services/aiService';
import { StatusCodes } from 'http-status-codes';

// 단락 수정
export async function updateParagraph(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Paragraph);
        const paragraph = await repo.findOneBy({ id: Number(req.params.id) });

        if (!paragraph) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Paragraph not found' });
        }

        // 내용만 수정 가능 (writtenBy, orderIndex는 수정 불가)
        if (req.body.content !== undefined) {
            paragraph.content = req.body.content;
        }

        await repo.save(paragraph);
        res.json(paragraph);
    } catch (error) {
        next(error);
    }
}

// 단락 삭제
export async function deleteParagraph(req: Request, res: Response, next: NextFunction) {
    try {
        const repo = AppDataSource.getRepository(Paragraph);
        const paragraph = await repo.findOneBy({ id: Number(req.params.id) });

        if (!paragraph) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Paragraph not found' });
        }

        await repo.remove(paragraph);
        res.json({
            message: 'Paragraph deleted successfully',
            deletedId: Number(req.params.id)
        });
    } catch (error) {
        next(error);
    }
}

// AI 단락 재생성
export async function regenerateAiParagraph(req: Request, res: Response, next: NextFunction) {
    try {
        const paragraphRepo = AppDataSource.getRepository(Paragraph);
        const projectRepo = AppDataSource.getRepository(Project);

        // 재생성할 단락 조회
        const paragraph = await paragraphRepo.findOne({
            where: {
                id: Number(req.params.id)
            },
            relations: ['project']
        })

        if (!paragraph) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Paragraph not found' });
        }

        // AI가 작성한 단락만 재생성 가능
        if (paragraph.writtenBy !== 'ai') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Only AI paragraphs can be regenerated' });
        }

        // 프로젝트와 이전 단락들 조회
        const project = await projectRepo.findOne({
            where: {
                id: paragraph.project.id
            },
            relations: ['paragraphs']
        })

        if (!project) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' });
        }

        // 재생성할 단락 이전의 단락들만 컨텍스트로 사용
        const previousParagraphs = project.paragraphs
            .filter(p => (p.orderIndex ?? 0) < (paragraph.orderIndex ?? 0))
            .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

        // AI 텍스트 재생성 (옵션 파라미터 지원)
        const temperature = req.body.temperature || 0.8;
        const maxTokens = req.body.maxTokens || 500;

        const aiText = await generateNextParagraph(
            project,
            previousParagraphs,
            { temperature, maxTokens }  // 추가 옵션 전달
        );

        // 단락 내용 업데이트
        paragraph.content = aiText?.trim();
        await paragraphRepo.save(paragraph);

        res.status(StatusCodes.OK).json(paragraph);
    } catch (error) {
        next(error);
    }

}