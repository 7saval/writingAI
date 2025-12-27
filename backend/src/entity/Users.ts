import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Project } from "./Projects";


@Entity('users')   // 이 클래스가 DB 테이블임을 명시
export class User {
    @PrimaryGeneratedColumn()   // 자동 증가하는 PK (id)
    id!: number;

    @Column({ unique: true, nullable: false })   // nullable 디폴트 옵션은 false
    email!: string;

    @Column()   // 일반 컬럼
    password!: string;

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

    // 생성자
    // strictPropertyInitialization 옵션이 true일 때, 
    // 클래스의 모든 필드가 반드시 초기화되어야 한다
    // constructor(
    //     id: number,
    //     email: string,
    //     password: string,
    //     username: string,
    //     createdAt: Date,
    //     projects: Project[]
    // ) {
    //     this.id = id;
    //     this.email = email;
    //     this.password = password;
    //     this.username = username;
    //     this.createdAt = createdAt;
    //     this.projects = projects;
    // }
}