import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Project } from "./Projects";
import { SocialAccount } from "./SocialAccounts";


@Entity('users')   // 이 클래스가 DB 테이블임을 명시
export class User {
    @PrimaryGeneratedColumn()   // 자동 증가하는 PK (id)
    id!: number;

    @Column({ unique: true, nullable: false })   // nullable 디폴트 옵션은 false
    email!: string;

    @Column({ nullable: true })   // 일반 컬럼
    password?: string;

    @Column()
    username!: string;

    @Column({ type: 'varchar', nullable: true })
    resetCode?: string | null;

    @Column({ type: 'datetime', nullable: true })
    resetCodeExpires?: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @OneToMany(() => Project, (project) => project.user)
    projects!: Project[];

    @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
    socialAccounts!: SocialAccount[];
}