import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDisplayOrderToProducts1730081000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "display_order",
        type: "int",
        isNullable: true, // pode ser nulo, já que nem todo produto precisa de ordem
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "display_order");
  }
}
