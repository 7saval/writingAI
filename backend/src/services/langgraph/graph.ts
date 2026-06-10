import { StateGraph, START, END } from "@langchain/langgraph";
import { WritingStateAnnotation } from "./state";
import { buildContextNode } from "./nodes/buildContext";
import { generateVariantsNode } from "./nodes/generateVariants";
import {
  qualityEvaluatorNode,
  shouldRetryGeneration,
} from "./nodes/qualityEvaluator";
import { basicQualityFilterNode } from "./nodes/basicQualityFilter";
import { loreConsistencyCheckerNode } from "./nodes/loreConsistencyChecker";

const graph = new StateGraph(WritingStateAnnotation)
  .addNode("buildContext", buildContextNode)
  .addNode("generateVariants", generateVariantsNode)
  .addNode("qualityEvaluator", qualityEvaluatorNode)
  .addNode("basicQualityFilter", basicQualityFilterNode)
  .addNode("loreConsistencyChecker", loreConsistencyCheckerNode)
  .addEdge(START, "buildContext")
  .addEdge("buildContext", "generateVariants")
  .addEdge("generateVariants", "qualityEvaluator")
  // 품질 미달 시 재생성 사이클 (최대 2회)
  .addConditionalEdges("qualityEvaluator", shouldRetryGeneration, {
    retry: "generateVariants",
    proceed: "basicQualityFilter",
  })
  .addEdge("basicQualityFilter", "loreConsistencyChecker")
  .addEdge("loreConsistencyChecker", END);

export const writingGraph = graph.compile();
