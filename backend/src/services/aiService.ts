import OpenAI from 'openai';
import { Project } from '../entity/Projects';
import { Paragraph } from '../entity/Paragraphs';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContextOptions {
    includeSynopsis: boolean;
    includeLorebook: boolean;
    includeDescription: boolean;
    maxParagraphs: number;
    loreFocusTags?: string[];
}

// AI 생성 옵션 인터페이스
interface GenerationOptions {
    temperature?: number;
    maxTokens?: number;
}

// 다음 단락 생성
export async function generateNextParagraph(
    project: Project,
    paragraphs: Paragraph[],
    options?: GenerationOptions
) {
    const prompt = buildContext(project, paragraphs, {
        includeSynopsis: true,
        includeLorebook: true,
        includeDescription: true,
        maxParagraphs: 5,   // 최근 5개 단락만 참조
    });

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: '당신은 협업 소설 작가입니다.' },
            { role: 'user', content: prompt }
        ],
        temperature: options?.temperature ?? 0.8,   // 창의성 (기본값: 0.8)
        max_tokens: options?.maxTokens ?? 500, // 출력 길이 제한 (기본값: 500)
    });

    return response.choices[0].message.content;
}

// 프로젝트 컨텍스트 생성
function buildContext(project: Project, paragraphs: Paragraph[], options: ContextOptions) {
    let context = ''

    if (options.includeSynopsis && project.synopsis) {
        context += `[Synopsis]\n${project.synopsis}\n\n`;
    }
    if (options.includeLorebook && project.lorebook) {
        const notes = project.lorebook;
        context += `[Lorebook]\n${formatLore(notes, options.loreFocusTags)}\n\n`;
    }
    if (options.includeDescription && project.description) {
        context += `[Background]\n${project.description}\n\n`;
    }

    const recent = paragraphs.slice(-options.maxParagraphs).map((p) =>
        `${p.writtenBy.toUpperCase()}: ${p.content}`
    );
    context += recent.join('\n\n');

    context += '\n\nAI, 다음 단락을 작성해 주세요.';
    return context;
}

// 설정집 포맷팅 (태그 필터링 포함)
function formatLore(notes: any[], tags?: string[]) {
    return notes
        .filter((note) => (!tags || tags.length === 0 ? true :
            note.tags.some((tag: string) => tags.includes(tag))))
        .map((note) => `- [${note.category}] ${note.title}: ${note.content}`)
        .join('\n');
}
