import { WritingState, VariantResult } from "../state";

function isValidVariant(variant: VariantResult): boolean {
  const content = variant.content.trim();
  if (content.length < 50) return false;
  if (content === "undefined") return false;

  const koreanChars = (content.match(/[가-힣]/g) || []).length;
  const totalChars = content.replace(/\s/g, "").length;
  if (totalChars > 0 && koreanChars / totalChars < 0.3) return false;

  return true;
}

export async function basicQualityFilterNode(
  state: WritingState,
): Promise<Partial<WritingState>> {
  const validVariants = state.variants.filter(isValidVariant);
  if (validVariants.length === 0) {
    return { error: "생성된 변형이 품질 기준을 통과하지 못했습니다." };
  }
  return { variants: validVariants };
}
