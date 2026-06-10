import { useAuthStore } from "@/store/authStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchSsePost(
  path: string,
  body: object,
  onEvent: (event: Record<string, any>) => void,
): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines[lines.length - 1];

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("data: ")) continue;
      try {
        onEvent(JSON.parse(line.substring(6)));
      } catch (e) {
        console.error("Failed to parse SSE event:", line, e);
      }
    }
  }
}
