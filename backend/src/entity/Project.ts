import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Paragraph } from "./Paragraph";
import { User } from "./User";


@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    genre!: string;

    @Column()
    synopsis!: string;

    @Column()
    lorebook!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => User, (user) => user.projects,
        { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })  // 조인컬럼 설정(생략 가능)
    user!: User;

    @OneToMany(() => Paragraph, (paragraph) => paragraph.project)   // OneToMany 연결(생략 가능)
    paragraphs!: Paragraph[];

    // constructor(
    //     id: number,
    //     title: string,
    //     description: string,
    //     genre: string,
    //     synopsis: string,
    //     lorebook: string,
    //     createdAt: Date,
    //     updatedAt: Date,
    //     paragraphs: Paragraph[]
    // ) {
    //     this.id = id;
    //     this.title = title;
    //     this.description = description;
    //     this.genre = genre;
    //     this.synopsis = synopsis;
    //     this.lorebook = lorebook;
    //     this.createdAt = createdAt;
    //     this.updatedAt = updatedAt;
    //     this.paragraphs = paragraphs;
    // }
}