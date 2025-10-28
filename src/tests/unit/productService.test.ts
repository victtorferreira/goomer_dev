import ProductService from "../../services/ProductService";
import ProductRepository from "../../repositories/ProductRepository";
import { ProductCategory } from "../../models/enums/product-category.enum";

jest.mock("../../repositories/ProductRepository");

describe("ProductService", () => {
  it("cria um produto válido", async () => {
    (ProductRepository.create as jest.Mock).mockResolvedValue({
      id: "uuid-123",
      name: "Pizza",
      price: 30,
      category: ProductCategory.PRATOS_PRINCIPAIS, // 👈 aqui usamos o enum real
    });

    const product = await ProductService.createProduct({
      name: "Pizza",
      price: 30,
      category: ProductCategory.PRATOS_PRINCIPAIS, // 👈 idem
    });

    expect(product).toHaveProperty("id");
    expect(product.name).toBe("Pizza");
  });

  it("lança erro se preço for inválido", async () => {
    await expect(
      ProductService.createProduct({
        name: "Pizza",
        price: -10,
        category: ProductCategory.PRATOS_PRINCIPAIS, // 👈 idem
      })
    ).rejects.toThrow("Preço deve ser positivo");
  });
});
