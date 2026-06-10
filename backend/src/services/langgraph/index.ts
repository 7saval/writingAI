import { Project } from "../../entity/Projects";
import { Paragraph } from "../../entity/Paragraphs";
import { writingGraph } from "./graph";

export { writingGraph };
export type { WritingState, VariantResult } from "./state";
export { WritingStateAnnotation } from "./state";

export async function runVariantsGraph(
  project: Project,
  paragraphs: Paragraph[],
  options?: {
    prompt?: string;
    stage?: string;
    temperature?: number;
    maxTokens?: number;
  },
): Promise<import("./state").VariantResult[]> {
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

  return result.variants ?? [];
}

// 균형형(B) 우선 선택하는 backward-compat 래퍼
export async function runWritingGraph(
  project: Project,
  paragraphs: Paragraph[],
  options?: {
    prompt?: string;
    stage?: string;
    temperature?: number;
    maxTokens?: number;
  },
): Promise<string | null> {
  const variants = await runVariantsGraph(project, paragraphs, options);
  const selected = variants.find((v) => v.id === "B") ?? variants[0];
  return selected?.content ?? null;
}
