import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterProductsIdToUuid1730085000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'promotions'::regclass
          AND contype = 'f'
          AND confrelid = 'products'::regclass;
        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE promotions DROP CONSTRAINT %I', constraint_name);
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'products'::regclass
          AND contype = 'p';
        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', constraint_name);
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `ALTER TABLE products ALTER COLUMN id DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE products ALTER COLUMN id TYPE uuid USING (uuid_generate_v4())`
    );
    await queryRunner.query(
      `ALTER TABLE products ALTER COLUMN id SET DEFAULT uuid_generate_v4()`
    );

    await queryRunner.query(`ALTER TABLE products ADD PRIMARY KEY (id)`);

    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN product_id TYPE uuid USING (uuid_generate_v4())`
    );

    await queryRunner.query(`
      ALTER TABLE promotions
      ADD CONSTRAINT fk_promotions_product
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'promotions'::regclass
          AND contype = 'f'
          AND confrelid = 'products'::regclass;
        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE promotions DROP CONSTRAINT %I', constraint_name);
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'products'::regclass
          AND contype = 'p';
        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', constraint_name);
        END IF;
      END
      $$;
    `);

    await queryRunner.query(
      `ALTER TABLE products ALTER COLUMN id DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE products ALTER COLUMN id TYPE integer USING (floor(random()*1000000)::int)`
    );
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS products_id_seq`);
    await queryRunner.query(
      `ALTER TABLE products ALTER COLUMN id SET DEFAULT nextval('products_id_seq')`
    );

    await queryRunner.query(`ALTER TABLE products ADD PRIMARY KEY (id)`);

    await queryRunner.query(
      `ALTER TABLE promotions ALTER COLUMN product_id TYPE integer USING (floor(random()*1000000)::int)`
    );

    await queryRunner.query(`
      ALTER TABLE promotions
      ADD CONSTRAINT fk_promotions_product
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    `);
  }
}
