import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreatePromotions1730076000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "promotions",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "product_id", type: "int", isNullable: false },
          { name: "description", type: "varchar", isNullable: false },
          {
            name: "promotional_price",
            type: "decimal",
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          { name: "days_of_week", type: "int[]", isNullable: false },
          { name: "start_time", type: "time", isNullable: false },
          { name: "end_time", type: "time", isNullable: false },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "promotions",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "products",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("promotions");
  }
}
