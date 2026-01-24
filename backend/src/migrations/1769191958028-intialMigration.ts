import type { MigrationInterface, QueryRunner } from "typeorm";

export class IntialMigration1769191958028 implements MigrationInterface {
    name = 'IntialMigration1769191958028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."paragraphs_writtenby_enum" AS ENUM('user', 'ai')`);
        await queryRunner.query(`CREATE TABLE "paragraphs" ("id" SERIAL NOT NULL, "content" text, "writtenBy" "public"."paragraphs_writtenby_enum" NOT NULL, "orderIndex" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "projectId" integer NOT NULL, CONSTRAINT "PK_31041595073b54a7816865eba74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "genre" character varying, "synopsis" text, "lorebook" jsonb DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "social_accounts" ("id" SERIAL NOT NULL, "provider" character varying NOT NULL, "socialId" character varying NOT NULL, "userId" integer NOT NULL, "connectedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e9e58d2d8e9fafa20af914d9750" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying, "username" character varying NOT NULL, "resetCode" character varying, "resetCodeExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "paragraphs" ADD CONSTRAINT "FK_1c14848a0fbc75132ac24c4c212" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD CONSTRAINT "FK_7de933c3670ec71c68aca0afd56" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP CONSTRAINT "FK_7de933c3670ec71c68aca0afd56"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_361a53ae58ef7034adc3c06f09f"`);
        await queryRunner.query(`ALTER TABLE "paragraphs" DROP CONSTRAINT "FK_1c14848a0fbc75132ac24c4c212"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "social_accounts"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "paragraphs"`);
        await queryRunner.query(`DROP TYPE "public"."paragraphs_writtenby_enum"`);
    }

}
