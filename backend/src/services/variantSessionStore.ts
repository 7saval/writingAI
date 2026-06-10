import { randomUUID } from "crypto";
import { VariantResult } from "./langgraph/state";

interface VariantSession {
  variants: VariantResult[];
  projectId: number;
  userParagraphId: number;
  nextOrderIndex: number;
  expiresAt: number;
}

const sessionStore = new Map<string, VariantSession>();
const SESSION_TTL_MS = 5 * 60 * 1000; // 5분

export function createVariantSession(
  data: Omit<VariantSession, "expiresAt">,
): string {
  const sessionId = randomUUID();
  sessionStore.set(sessionId, {
    ...data,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

export function getVariantSession(
  sessionId: string,
): VariantSession | undefined {
  const session = sessionStore.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    sessionStore.delete(sessionId);
    return undefined;
  }
  return session;
}

export function deleteVariantSession(sessionId: string): void {
  sessionStore.delete(sessionId);
}
