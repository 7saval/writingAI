import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./Project";

@Entity()
export class Paragraph {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    content!: string;

    @Column({ type: 'enum', enum: ['user', 'ai'] })
    writtenBy!: 'user' | 'ai';

    @Column()
    orderIndex!: number;

    @Column()
    createdAt!: Date;

    @Column()
    updatedAt!: Date;

    @ManyToOne(() => Project, (project) => project.paragraphs,
        { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })  // 조인컬럼 설정(생략 가능)
    project!: Project;
}
