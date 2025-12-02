import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Paragraph } from "./Paragraphs";
import { User } from "./Users";


@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    genre?: string;

    @Column({ type: 'text', nullable: true })
    synopsis?: string;

    @Column({ type: 'json', nullable: true, default: '[]' })
    lorebook?: any[] | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updatedAt?: Date;

    @ManyToOne(() => User, (user) => user.projects,
        { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })  // 조인컬럼 설정(생략 가능)
    user!: User;

    @OneToMany(() => Paragraph, (paragraph) => paragraph.project)   // OneToMany 연결(생략 가능)
    paragraphs!: Paragraph[];
}