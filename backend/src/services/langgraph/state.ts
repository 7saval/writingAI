import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Project } from "../../entity/Projects";
import { Paragraph } from "../../entity/Paragraphs";

export interface VariantResult {
  id: string;
  content: string;
  temperature: number;
  label: string;
  qualityScore?: number;
  loreWarning?: string;
}

// 단순 덮어쓰기 reducer
const overwrite = <T>(_: T, next: T) => next;

export const WritingStateAnnotation = Annotation.Root({
  // 입력 (invoke 시 항상 제공)
  project: Annotation<Project>({
    reducer: overwrite<Project>,
    default: () => ({} as Project),
  }),
  paragraphs: Annotation<Paragraph[]>({
    reducer: overwrite<Paragraph[]>,
    default: () => [],
  }),
  userInput: Annotation<string>({
    reducer: overwrite<string>,
    default: () => "",
  }),
  customPrompt: Annotation<string | undefined>({
    reducer: overwrite<string | undefined>,
    default: () => undefined,
  }),
  stage: Annotation<string | undefined>({
    reducer: overwrite<string | undefined>,
    default: () => undefined,
  }),

  // 컨텍스트 빌드 결과
  contextMessages: Annotation<BaseMessage[]>({
    reducer: overwrite<BaseMessage[]>,
    default: () => [],
  }),

  // D. 변형 생성 결과
  variants: Annotation<VariantResult[]>({
    reducer: overwrite<VariantResult[]>,
    default: () => [],
  }),
  selectedVariant: Annotation<VariantResult | undefined>({
    reducer: overwrite<VariantResult | undefined>,
    default: () => undefined,
  }),

  // A. 품질 루프 제어
  retryCount: Annotation<Record<string, number>>({
    reducer: overwrite<Record<string, number>>,
    default: () => ({}),
  }),
  qualityFeedback: Annotation<Record<string, string>>({
    reducer: overwrite<Record<string, string>>,
    default: () => ({}),
  }),

  // B. 로어북 검증 결과
  loreWarnings: Annotation<Record<string, string>>({
    reducer: overwrite<Record<string, string>>,
    default: () => ({}),
  }),

  // 메타
  temperature: Annotation<number | undefined>({
    reducer: overwrite<number | undefined>,
    default: () => undefined,
  }),
  maxTokens: Annotation<number | undefined>({
    reducer: overwrite<number | undefined>,
    default: () => undefined,
  }),
  error: Annotation<string | undefined>({
    reducer: overwrite<string | undefined>,
    default: () => undefined,
  }),
});

export type WritingState = typeof WritingStateAnnotation.State;
