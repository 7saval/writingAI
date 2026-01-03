import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./Users";

@Entity('social_accounts')
export class SocialAccount {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    provider!: string; // google, kakao, naver

    @Column()
    socialId!: string; // provider specific id

    @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @CreateDateColumn()
    connectedAt!: Date;
}
