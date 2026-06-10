import { Response } from "express";

export function initSseResponse(res: Response): (data: object) => void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  return (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
}
