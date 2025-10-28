import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddRestaurantTimezoneToProducts1730082000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "products",
      new TableColumn({
        name: "restaurant_timezone",
        type: "varchar",
        isNullable: true, // pode ser nulo se não for obrigatório
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("products", "restaurant_timezone");
  }
}
