import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { WritingState, VariantResult } from "../state";

export const VARIANT_CONFIGS = [
  { id: "A", temperature: 0.6, label: "정석형" },
  { id: "B", temperature: 0.8, label: "균형형" },
  { id: "C", temperature: 1.0, label: "창의형" },
] as const;

async function generateSingleVariant(
  state: WritingState,
  config: (typeof VARIANT_CONFIGS)[number],
): Promise<VariantResult> {
  const feedbackMessage = state.qualityFeedback?.[config.id];

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: config.temperature,
    maxTokens: state.maxTokens ?? 500,
  });

  const messages = feedbackMessage
    ? [
        ...state.contextMessages,
        new HumanMessage(
          `이전 생성 피드백: ${feedbackMessage}\n위 피드백을 반영해 다시 작성해 주세요.`,
        ),
      ]
    : state.contextMessages;

  const response = await model.invoke(messages);

  return {
    id: config.id,
    content:
      typeof response.content === "string" ? response.content.trim() : "",
    temperature: config.temperature,
    label: config.label,
  };
}

export async function generateVariantsNode(
  state: WritingState,
): Promise<Partial<WritingState>> {
  // 재시도 시 이미 통과한 변형은 보존, 미통과 변형만 재생성
  const passingVariants = state.variants.filter((v) => v.qualityPassed);
  const passingIds = new Set(passingVariants.map((v) => v.id));

  const configsToGenerate = VARIANT_CONFIGS.filter(
    (config) => !passingIds.has(config.id),
  );

  const results = await Promise.allSettled(
    configsToGenerate.map((config) => generateSingleVariant(state, config)),
  );

  const newVariants = results
    .filter(
      (r): r is PromiseFulfilledResult<VariantResult> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((v) => v.content.length > 0);

  const allVariants = [...passingVariants, ...newVariants];

  if (allVariants.length === 0) {
    return { error: "모든 변형 생성에 실패했습니다." };
  }

  return { variants: allVariants };
}
