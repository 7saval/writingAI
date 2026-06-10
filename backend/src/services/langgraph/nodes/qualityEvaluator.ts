import { ChatOpenAI } from "@langchain/openai";
import { WritingState, VariantResult } from "../state";

const QUALITY_THRESHOLD = 7;
const MAX_RETRY = 2;

export interface QualityResult {
  variantId: string;
  score: number;
  feedback: string;
  passed: boolean;
}

export async function evaluateSingleVariant(
  variant: VariantResult,
  contextSummary: string,
  genre: string,
): Promise<QualityResult> {
  const evaluator = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

  const prompt = `다음 소설 단락을 0-10점으로 평가해 주세요.

장르: ${genre}
이전 문맥 요약: ${contextSummary}

평가할 단락:
${variant.content}

평가 기준:
1. 이전 문맥과의 자연스러운 연결성
2. 장르 톤 일치 여부
3. 완성도 및 문장 품질

JSON 형식으로만 응답: {"score": 숫자, "feedback": "개선 방향"}`;

  const response = await evaluator.invoke([{ role: "user", content: prompt }]);

  let score = QUALITY_THRESHOLD; // 파싱 실패 시 통과 처리
  let feedback = "";

  try {
    const text =
      typeof response.content === "string" ? response.content : "";
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      score =
        typeof result.score === "number" ? result.score : QUALITY_THRESHOLD;
      feedback = result.feedback ?? "";
    }
  } catch {
    // keep defaults
  }

  return {
    variantId: variant.id,
    score,
    feedback,
    passed: score >= QUALITY_THRESHOLD,
  };
}

export async function qualityEvaluatorNode(
  state: WritingState,
): Promise<Partial<WritingState>> {
  // 이미 통과한 변형은 재평가하지 않음
  const variantsToEvaluate = state.variants.filter((v) => !v.qualityPassed);

  if (variantsToEvaluate.length === 0) {
    return {};
  }

  const contextSummary = state.paragraphs
    .slice(-3)
    .map((p) => p.content)
    .join(" ");
  const genre = state.project.genre ?? "기타";

  const evaluations = await Promise.all(
    variantsToEvaluate.map((v) =>
      evaluateSingleVariant(v, contextSummary, genre),
    ),
  );

  const updatedVariants = state.variants.map((v) => {
    if (v.qualityPassed) return v;
    const evaluation = evaluations.find((e) => e.variantId === v.id)!;
    return {
      ...v,
      qualityScore: evaluation.score,
      qualityPassed: evaluation.passed,
    };
  });

  const newFeedback: Record<string, string> = { ...state.qualityFeedback };
  const newRetryCount: Record<string, number> = { ...state.retryCount };

  for (const evaluation of evaluations) {
    if (!evaluation.passed) {
      newFeedback[evaluation.variantId] = evaluation.feedback;
      newRetryCount[evaluation.variantId] =
        (newRetryCount[evaluation.variantId] ?? 0) + 1;
    }
  }

  return {
    variants: updatedVariants,
    qualityFeedback: newFeedback,
    retryCount: newRetryCount,
  };
}

export function shouldRetryGeneration(
  state: WritingState,
): "retry" | "proceed" {
  const failedVariants = state.variants.filter((v) => !v.qualityPassed);

  const canRetry = failedVariants.some(
    (v) => (state.retryCount?.[v.id] ?? 0) < MAX_RETRY,
  );

  return failedVariants.length > 0 && canRetry ? "retry" : "proceed";
}
