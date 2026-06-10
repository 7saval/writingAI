import { ChatOpenAI } from "@langchain/openai";
import { WritingState } from "../state";

export async function checkSingleVariant(
  variantContent: string,
  loreNotes: any[],
): Promise<string | null> {
  const relevantNotes = loreNotes.filter((n) => n.includeInPrompt);
  if (relevantNotes.length === 0) return null;

  const checker = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const loreText = relevantNotes
    .map((n) => `[${n.category}] ${n.title}: ${n.content}`)
    .join("\n");

  const prompt = `다음 소설 단락이 설정집과 충돌하는 내용이 있는지 확인해 주세요.

설정집:
${loreText}

작성된 단락:
${variantContent}

충돌이 없으면 "없음"만 응답하고, 충돌이 있으면 구체적인 충돌 내용을 한 문장으로 설명해 주세요.`;

  const response = await checker.invoke([{ role: "user", content: prompt }]);
  const result = (response.content as string).trim();

  return result === "없음" ? null : result;
}

export async function loreConsistencyCheckerNode(
  state: WritingState,
): Promise<Partial<WritingState>> {
  const loreNotes = state.project.lorebook ?? [];

  const checkResults = await Promise.all(
    state.variants.map(async (variant) => {
      const warning = await checkSingleVariant(variant.content, loreNotes);
      return { id: variant.id, warning };
    }),
  );

  const newLoreWarnings: Record<string, string> = {};
  const updatedVariants = state.variants.map((variant) => {
    const result = checkResults.find((r) => r.id === variant.id)!;
    if (result.warning) {
      newLoreWarnings[variant.id] = result.warning;
      return { ...variant, loreWarning: result.warning };
    }
    return variant;
  });

  return {
    variants: updatedVariants,
    loreWarnings: newLoreWarnings,
  };
}
