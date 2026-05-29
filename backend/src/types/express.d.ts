import { Request } from "express";
import { Project } from "../entity/Projects";
import { Paragraph } from "../entity/Paragraphs";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
      resource?: Project | Paragraph;
      project?: Project | null;
      paragraph?: Paragraph | null;
    }
  }
}

export {};
