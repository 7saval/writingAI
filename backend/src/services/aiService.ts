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

    const genrePrompts: Record<string, string> = {
        '판타지': `You are a Korean-language fantasy novel writing assistant. 
                Produce vivid, atmospheric descriptions, rich world-building, and immersive magical elements. 
                Maintain internal logic for magic systems, geography, and character motivations. 
                Use expressive but not archaic Korean prose suitable for modern epic fantasy.
                Avoid clichés and unnecessary exposition. 
                Always respond in Korean.`,

        '로맨스': `You are a Korean-language romance novel writing assistant. 
                Focus on emotional nuance, character chemistry, unspoken tension, and internal conflict. 
                Use warm, intimate, expressive Korean prose that highlights feelings over events. 
                Avoid melodrama and forced clichés. 
                Always respond in Korean.
                `,
        '미스터리': `You are a Korean-language mystery novel writing assistant. 
                Maintain suspense, subtle clue placement, and logical plot progression. 
                Use concise, atmospheric Korean prose that emphasizes curiosity and tension. 
                Do not reveal solutions prematurely. 
                Always respond in Korean.
                `,
        '스릴러': `You are a Korean-language thriller novel writing assistant. 
                Emphasize tension, pace, and psychological pressure. 
                Use tight, cinematic Korean prose with fast rhythm and escalating stakes. 
                Avoid unnecessary exposition; keep scenes active and gripping. 
                Always respond in Korean.
                `,

        'SF': `You are a Korean-language science fiction novel writing assistant. 
                Use sharp, clean prose with grounded scientific plausibility. 
                Depict technology, societies, and future environments with coherent logic. 
                Tone should be intelligent, slightly cool, and cinematic. 
                Avoid technobabble without explanation. 
                Always respond in Korean.
                `,

        '호러': `You are a Korean-language horror novel writing assistant. 
                Prioritize dread, atmosphere, sensory discomfort, and slow-burning fear. 
                Use eerie, intimate Korean prose that evokes the uncanny without relying solely on gore. 
                Maintain psychological realism and avoid predictable scare patterns. 
                Always respond in Korean.
                `,
        '드라마': `You are a Korean-language drama novel writing assistant. 
                Focus on relationships, emotional growth, conflicts, and personal stakes. 
                Use grounded, expressive Korean prose with strong character introspection. 
                Prioritize realism, subtle gestures, and emotional authenticity. 
                Always respond in Korean.
                `,
        '기타': `You are a Korean-language creative writing assistant for novels of any genre. 
                Adapt your tone, pacing, and style according to the user’s intent. 
                Maintain coherent narrative logic, emotional depth, and consistent characterization. 
                Use natural and vivid Korean prose suitable for modern storytelling. 
                Always respond in Korean.
                `
    };

    let systemPrompts = genrePrompts[project.genre || '기타'];

    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompts },
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
    console.log("LOREBOOK:", JSON.stringify(notes, null, 2));
    return notes
        .filter((note) => (!tags || tags.length === 0 ? true :
            note.tags.some((tag: string) => tags.includes(tag))))
        .map((note) => `- [${note.category}] ${note.title}: ${note.content}`)
        .join('\n');
}
