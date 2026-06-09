import { Project } from "../../entity/Projects";
import { Paragraph } from "../../entity/Paragraphs";
import { writingGraph } from "./graph";

export { writingGraph };
export type { WritingState, VariantResult } from "./state";
export { WritingStateAnnotation } from "./state";

export async function runWritingGraph(
  project: Project,
  paragraphs: Paragraph[],
  options?: {
    prompt?: string;
    stage?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string | null> {
  const result = await writingGraph.invoke({
    project,
    paragraphs,
    customPrompt: options?.prompt,
    stage: options?.stage,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result.variants?.[0]?.content ?? null;
}
