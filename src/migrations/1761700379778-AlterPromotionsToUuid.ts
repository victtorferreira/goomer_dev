import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterPromotionsToUuid1730150000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `ALTER TABLE promotions DROP CONSTRAINT fk_promotions_product`
    );

    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN id DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN id TYPE uuid USING uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN id SET DEFAULT uuid_generate_v4()`
    );

    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN product_id TYPE uuid USING product_id::uuid`
    );

    await queryRunner.query(`
      ALTER TABLE promotions
      ADD CONSTRAINT promotions_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE promotions DROP CONSTRAINT promotions_product_id_fkey`
    );

    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN product_id TYPE int USING product_id::int`
    );

    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN id DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN id TYPE serial USING id::int`
    );
    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN id SET DEFAULT nextval('promotions_id_seq')`
    );

    await queryRunner.query(`
      ALTER TABLE promotions
      ADD CONSTRAINT promotions_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);
  }
}
