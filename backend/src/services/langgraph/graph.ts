import { StateGraph, START, END } from "@langchain/langgraph";
import { WritingStateAnnotation } from "./state";
import { buildContextNode } from "./nodes/buildContext";
import { generateContentNode } from "./nodes/generateContent";

const graph = new StateGraph(WritingStateAnnotation)
  .addNode("buildContext", buildContextNode)
  .addNode("generateContent", generateContentNode)
  .addEdge(START, "buildContext")
  .addEdge("buildContext", "generateContent")
  .addEdge("generateContent", END);

export const writingGraph = graph.compile();
