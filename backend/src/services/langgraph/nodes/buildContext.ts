import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { WritingState } from "../state";
import { buildContext, buildSystemPrompt } from "../../aiService";

export async function buildContextNode(
  state: WritingState
): Promise<Partial<WritingState>> {
  const rawMessages = buildContext(state.project, state.paragraphs, {
    includeSynopsis: true,
    includeLorebook: true,
    includeDescription: true,
    maxParagraphs: 10,
    stage: state.stage,
  });

  const finalUserContent = state.customPrompt
    ? `[사용자 지시사항]\n${state.customPrompt}\n\n위 지시사항을 반영하여 다음 단락을 이어서 작성해 주세요.`
    : "AI, 다음 단락을 작성해 주세요.";

  const contextMessages = [
    new SystemMessage(buildSystemPrompt(state.project.genre)),
    ...rawMessages.map((msg) => {
      const content = typeof msg.content === "string" ? msg.content : "";
      return msg.role === "assistant"
        ? new AIMessage(content)
        : new HumanMessage(content);
    }),
    new HumanMessage(finalUserContent),
  ];

  return { contextMessages };
}
