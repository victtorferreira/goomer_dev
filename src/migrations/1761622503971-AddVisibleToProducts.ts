import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVisibleToProducts1730080000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "visible",
        type: "boolean",
        default: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "visible");
  }
}
