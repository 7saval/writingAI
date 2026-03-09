import OpenAI from "openai";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BASE_PROMPT = `당신은 소설 작법 전문가입니다. 
1. 반드시 한국어로 답변하세요.
2. 단순한 상황 설명이나 묘사를 장황하게 늘어놓는 것을 지양하세요.
3. 지나치게 감상적이고 감정적인 호소를 하지마세요.
4. 등장인물의 구체적인 행동이나 개연성 있는 사건을 단락마다 하나 이상 포함하세요.
5. 이전 문맥(본문)과 설정집(Lorebook)의 내용을 엄격히 준수하세요.`;

export interface ContextOptions {
  includeSynopsis: boolean;
  includeLorebook: boolean;
  includeDescription: boolean;
  maxParagraphs: number;
  loreFocusTags?: string[];
  stage?: string;
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
  options?: GenerationOptions & { prompt?: string; stage?: string },
) {
  const messages = buildContext(project, paragraphs, {
    includeSynopsis: true,
    includeLorebook: true,
    includeDescription: true,
    maxParagraphs: 10,
    stage: options?.stage,
  });

  const genrePrompts: Record<string, string> = {
    판타지: `You are a Korean-language fantasy novel writing assistant. Produce vivid, atmospheric descriptions, rich world-building, and immersive magical elements. Maintain internal logic for magic systems, geography, and character motivations.`,
    로맨스: `You are a Korean-language romance novel writing assistant. Focus on emotional nuance, character chemistry, unspoken tension, and internal conflict.`,
    미스터리: `You are a Korean-language mystery novel writing assistant. Maintain suspense, subtle clue placement, and logical plot progression.`,
    스릴러: `You are a Korean-language thriller novel writing assistant. Emphasize tension, pace, and psychological pressure.`,
    SF: `You are a Korean-language science fiction novel writing assistant. Use sharp, clean prose with grounded scientific plausibility.`,
    호러: `You are a Korean-language horror novel writing assistant. Prioritize dread, atmosphere, sensory discomfort, and slow-burning fear.`,
    드라마: `You are a Korean-language drama novel writing assistant. Focus on relationships, emotional growth, conflicts, and personal stakes.`,
    기타: `You are a Korean-language creative writing assistant for novels of any genre. Adapt your tone, pacing, and style according to the user’s intent.`,
  };

  const genrePrompt = genrePrompts[project.genre || "기타"];

  // System 메시지 결합
  const systemMessage: OpenAI.Chat.ChatCompletionMessageParam = {
    role: "system",
    content: `${BASE_PROMPT}\n\n[Genre Specific Guide]\n${genrePrompt}`,
  };

  // 대화 흐름 구성: [System, ...ContextMessages]
  const finalMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    systemMessage,
    ...messages,
  ];

  // 사용자 방향 지시사항이 있는 경우 마지막에 추가
  if (options?.prompt) {
    finalMessages.push({
      role: "user",
      content: `[사용자 지시사항]\n${options.prompt}\n\n위 지시사항을 반영하여 다음 단락을 이어서 작성해 주세요.`,
    });
  } else {
    finalMessages.push({
      role: "user",
      content: "AI, 다음 단락을 작성해 주세요.",
    });
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: finalMessages,
    temperature: options?.temperature ?? 0.8,
    max_tokens: options?.maxTokens ?? 500,
  });

  return response.choices[0].message.content;
}

// 프로젝트 컨텍스트 생성
export function buildContext(
  project: Project,
  paragraphs: Paragraph[],
  options: ContextOptions,
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  let headerContext = "";
  if (options.includeSynopsis && project.synopsis) {
    let synopsisText = project.synopsis;
    let stageGuide = "";

    try {
      // 5단계 시놉시스 JSON 파싱 시도
      const synopsisObj = JSON.parse(project.synopsis);
      const stageMap: Record<string, string> = {
        발단: "introduction",
        전개: "development",
        위기: "crisis",
        절정: "climax",
        결말: "conclusion",
      };

      const stageKey = options.stage ? stageMap[options.stage] : null;

      if (stageKey && synopsisObj[stageKey]) {
        // 현재 단계의 시놉시스를 강조하여 전달
        synopsisText = `[전체 개요]\n${Object.values(synopsisObj).join("\n")}\n\n[현재 집중 단계: ${options.stage}]\n${synopsisObj[stageKey]}`;
        stageGuide = `\n현재 이야기는 소설의 5단 구성 중 [${options.stage}] 단계에 해당합니다. 해당 단계의 시놉시스 내용을 중점적으로 반영하여 이야기를 전개해 주세요.`;
      } else {
        // 단계를 특정할 수 없거나 해당 내용이 없을 경우 전체 출력
        synopsisText = Object.entries(synopsisObj)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n");
      }
    } catch (e) {
      // 일반 텍스트인 경우 그대로 사용
      synopsisText = project.synopsis;
    }

    headerContext += `[Synopsis]\n${synopsisText}${stageGuide}\n\n`;
  }
  if (options.includeLorebook && project.lorebook) {
    const notes = project.lorebook;

    // 본문 전체 텍스트 수집 (시놉시스 + 배경 + 최근 단락)
    const fullContent = `${project.synopsis || ""} ${project.description || ""} ${paragraphs.map((p) => p.content).join(" ")}`;

    // 설정집에 등록된 모든 태그 추출
    const allTags = Array.from(
      new Set(notes.flatMap((note) => note.tags || [])),
    ) as string[];

    // 본문에 언급된 태그 필터링
    const mentionedTags = allTags.filter((tag) => fullContent.includes(tag));
    headerContext += `[Lorebook]\n${formatLore(notes, mentionedTags.length > 0 ? mentionedTags : undefined)}\n\n`;
  }
  if (options.includeDescription && project.description) {
    headerContext += `[Background]\n${project.description}\n\n`;
  }

  // 상단 컨텍스트(시놉시스 등)는 첫 번째 user 메시지에 포함
  if (headerContext) {
    messages.push({
      role: "user",
      content: headerContext,
    });
  }

  // 본문 단락들을 user/assistant 역할로 매핑
  const recentParagraphs = paragraphs.slice(-options.maxParagraphs);
  recentParagraphs.forEach((p) => {
    messages.push({
      role: (p.writtenBy === "ai" ? "assistant" : "user") as
        | "assistant"
        | "user",
      content: p.content || "",
    });
  });

  return messages;
}

// 설정집 포맷팅 (태그 필터링 포함)
function formatLore(notes: any[], tags?: string[]) {
  console.log("LOREBOOK:", JSON.stringify(notes, null, 2));
  return notes
    .filter((note) =>
      !tags || tags.length === 0
        ? true
        : note.tags.some((tag: string) => tags.includes(tag)),
    )
    .map((note) => `- [${note.category}] ${note.title}: ${note.content}`)
    .join("\n");
}
