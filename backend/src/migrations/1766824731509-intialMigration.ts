import { MigrationInterface, QueryRunner } from "typeorm";

export class IntialMigration1766824731509 implements MigrationInterface {
    name = 'IntialMigration1766824731509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`content\` \`content\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`orderIndex\` \`orderIndex\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_bd55b203eb9f92b0c8390380010\``);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`genre\` \`genre\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`synopsis\` \`synopsis\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetCode\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetCode\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetCodeExpires\` \`resetCodeExpires\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_bd55b203eb9f92b0c8390380010\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_bd55b203eb9f92b0c8390380010\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`resetCodeExpires\` \`resetCodeExpires\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetCode\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`user_id\` \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`synopsis\` \`synopsis\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`genre\` \`genre\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`projects\` ADD CONSTRAINT \`FK_bd55b203eb9f92b0c8390380010\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`orderIndex\` \`orderIndex\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`paragraphs\` CHANGE \`content\` \`content\` text NULL DEFAULT 'NULL'`);
    }

}
