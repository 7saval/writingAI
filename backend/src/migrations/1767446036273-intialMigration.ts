import { MigrationInterface, QueryRunner } from "typeorm";

export class IntialMigration1767446036273 implements MigrationInterface {
    name = 'IntialMigration1767446036273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`paragraphs\` DROP FOREIGN KEY \`FK_ab7168bfa0247ce139e7d578306\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_bd55b203eb9f92b0c8390380010\``);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`project_id\` \`projectId\` int NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`social_accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`provider\` varchar(255) NOT NULL, \`socialId\` varchar(255) NOT NULL, \`userId\` int NOT NULL, \`connectedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`userId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`content\` \`content\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`orderIndex\` \`orderIndex\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`genre\` \`genre\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`synopsis\` \`synopsis\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetCode\` \`resetCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetCodeExpires\` \`resetCodeExpires\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` ADD CONSTRAINT \`FK_1c14848a0fbc75132ac24c4c212\` FOREIGN KEY (\`projectId\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_361a53ae58ef7034adc3c06f09f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD CONSTRAINT \`FK_7de933c3670ec71c68aca0afd56\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_7de933c3670ec71c68aca0afd56\``);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_361a53ae58ef7034adc3c06f09f\``);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` DROP FOREIGN KEY \`FK_1c14848a0fbc75132ac24c4c212\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetCodeExpires\` \`resetCodeExpires\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetCode\` \`resetCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`synopsis\` \`synopsis\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`genre\` \`genre\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`orderIndex\` \`orderIndex\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`content\` \`content\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`social_accounts\``);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`projectId\` \`project_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_bd55b203eb9f92b0c8390380010\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` ADD CONSTRAINT \`FK_ab7168bfa0247ce139e7d578306\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
