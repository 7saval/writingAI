export interface Project {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    genre: string | null;
    synopsis: string | null;
    lorebook: any[] | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Paragraph {
    id: number;
    project_id: number;
    content: string;
    writtenBy: 'user' | 'ai';
    orderIndex: number;
    createdAt: Date;
    updatedAt: Date;
}

export type ParagraphWrite = Pick<Paragraph, "id" | "content" | "writtenBy">;

export interface LoreNote {
    id: string;
    category: string;
    title: string;
    content: string;
    tags: string[];
    includeInPrompt?: boolean;
}

export type ProjectSynopsis = Pick<Project, "id" | "synopsis">;
export type ProjectLorebook = Pick<Project, "id" | "lorebook">;