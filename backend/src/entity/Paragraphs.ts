import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Project } from "./Projects";

@Entity('paragraphs')
export class Paragraph {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({ type: 'enum', enum: ['user', 'ai'] })
    writtenBy!: 'user' | 'ai';

    @Column({ nullable: true })
    orderIndex?: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updatedAt?: Date;

    @ManyToOne(() => Project, (project) => project.paragraphs,
        { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })  // 조인컬럼 설정(생략 가능)
    project!: Project;
}
