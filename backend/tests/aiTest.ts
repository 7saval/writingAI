import OpenAI from "openai";
import { Project } from "../src/entity/Projects";
import { Paragraph } from "../src/entity/Paragraphs";
import * as aiService from "../src/services/aiService";

// Mock 데이터 생성
const mockProject: Partial<Project> = {
  id: 1,
  title: "테스트 프로젝트",
  synopsis: "이것은 테스트 시놉시스입니다.",
  description: "테스트 배경 설명입니다.",
  genre: "판타지",
  lorebook: [
    {
      category: "인물",
      title: "용사",
      content: "성검을 휘두르는 소년.",
      tags: ["용사", "성검"],
    },
  ],
};

const mockParagraphs: Partial<Paragraph>[] = [
  { id: 1, content: "옛날 옛적에 용사가 살았습니다.", writtenBy: "user" },
  { id: 2, content: "그 용사는 성검을 찾아 떠났습니다.", writtenBy: "ai" },
  { id: 3, content: "길을 가다 마왕을 만났습니다.", writtenBy: "user" },
];

async function runTest() {
  console.log("=== AI Context Build Test ===");

  const result: OpenAI.Chat.ChatCompletionMessageParam[] =
    aiService.buildContext(
      mockProject as Project,
      mockParagraphs as Paragraph[],
      {
        includeSynopsis: true,
        includeLorebook: true,
        includeDescription: true,
        maxParagraphs: 10,
      },
    );

  console.log("Generated Messages Structure:");
  result.forEach((msg, index: number) => {
    console.log(`[${index}] Role: ${msg.role}`);
    const content = typeof msg.content === "string" ? msg.content : "";
    console.log(
      `Content: ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`,
    );
    console.log("-".repeat(20));
  });

  // 2. 역할 순서 검증
  const roles = result.map((m) => m.role);
  console.log("\nRole Sequence:", roles.join(" -> "));

  if (roles[1] === "user" && roles[2] === "assistant" && roles[3] === "user") {
    console.log("✅ Role mapping (user/assistant) is correct!");
  } else {
    console.error("❌ Role mapping failed!");
  }

  // 3. Lorebook 포함 여부 확인
  const firstMsg = result[0];
  const firstMsgContent =
    typeof firstMsg.content === "string" ? firstMsg.content : "";
  if (
    firstMsgContent.includes("[Lorebook]") &&
    firstMsgContent.includes("용사")
  ) {
    console.log("✅ Lorebook filtering and inclusion is working!");
  } else {
    console.error("❌ Lorebook missing or filtering failed!");
  }
}

runTest().catch(console.error);
