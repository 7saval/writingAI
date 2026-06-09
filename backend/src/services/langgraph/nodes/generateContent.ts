import { ChatOpenAI } from "@langchain/openai";
import { WritingState } from "../state";

export async function generateContentNode(
  state: WritingState
): Promise<Partial<WritingState>> {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: state.temperature ?? 0.8,
    maxTokens: state.maxTokens ?? 500,
  });

  const response = await model.invoke(state.contextMessages);
  const content =
    typeof response.content === "string" ? response.content.trim() : "";

  if (!content) {
    return { error: "AI 단락 생성에 실패했습니다." };
  }

  return {
    variants: [
      {
        id: "default",
        content,
        temperature: state.temperature ?? 0.8,
        label: "기본",
      },
    ],
  };
}
