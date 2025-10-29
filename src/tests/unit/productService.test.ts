import ProductService from "../../services/ProductService";
import ProductRepository from "../../repositories/ProductRepository";
import { ProductCategory } from "../../models/enums/product-category.enum";
import PromotionRepository from "../../repositories/PromotionRepository";

jest.mock("../../repositories/ProductRepository");
jest.mock("../../repositories/PromotionRepository");

describe("ProductService - Unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("deve criar um produto válido", async () => {
      const mockProduct = {
        id: "uuid-123",
        name: "Pizza Margherita",
        price: 35.9,
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ProductRepository.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await ProductService.createProduct({
        name: "Pizza Margherita",
        price: 35.9,
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
        display_order: 1,
      });

      expect(result).toEqual(mockProduct);
      expect(ProductRepository.create).toHaveBeenCalledTimes(1);
      expect(ProductRepository.create).toHaveBeenCalledWith({
        name: "Pizza Margherita",
        price: 35.9,
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
        display_order: 1,
      });
    });

    it("deve lançar erro se preço for negativo", async () => {
      await expect(
        ProductService.createProduct({
          name: "Pizza",
          price: -10,
          category: ProductCategory.PRATOS_PRINCIPAIS,
        })
      ).rejects.toThrow("Preço deve ser positivo");

      expect(ProductRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro se preço for zero", async () => {
      await expect(
        ProductService.createProduct({
          name: "Pizza",
          price: 0,
          category: ProductCategory.PRATOS_PRINCIPAIS,
        })
      ).rejects.toThrow("Preço deve ser positivo");
    });

    it("deve lançar erro se nome estiver vazio", async () => {
      await expect(
        ProductService.createProduct({
          name: "",
          price: 30,
          category: ProductCategory.PRATOS_PRINCIPAIS,
        })
      ).rejects.toThrow("Nome é obrigatório");
    });

    it("deve lançar erro se preço for undefined", async () => {
      await expect(
        ProductService.createProduct({
          name: "Pizza",
          price: undefined as any,
          category: ProductCategory.PRATOS_PRINCIPAIS,
        })
      ).rejects.toThrow("Preço é obrigatório");
    });
  });

  describe("getAllProducts", () => {
    it("deve retornar lista de produtos sem filtros", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Pizza",
          price: 30,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "2",
          name: "Salada",
          price: 15,
          category: ProductCategory.ENTRADAS,
          visible: true,
          display_order: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (ProductRepository.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts();

      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
      expect(ProductRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it("deve filtrar por categoria", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Pizza",
          price: 30,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (ProductRepository.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts({
        category: ProductCategory.PRATOS_PRINCIPAIS,
      });

      expect(ProductRepository.findAll).toHaveBeenCalledWith({
        category: ProductCategory.PRATOS_PRINCIPAIS,
      });
      expect(result).toEqual(mockProducts);
    });

    it("deve filtrar por visibilidade", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Pizza Visível",
          price: 30,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (ProductRepository.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts({
        visible: true,
      });

      expect(ProductRepository.findAll).toHaveBeenCalledWith({
        visible: true,
      });
      expect(result).toEqual(mockProducts);
    });

    it("deve filtrar por categoria e visibilidade", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Pizza",
          price: 30,
          category: ProductCategory.PRATOS_PRINCIPAIS,
          visible: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (ProductRepository.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const result = await ProductService.getAllProducts({
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
      });

      expect(ProductRepository.findAll).toHaveBeenCalledWith({
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getProductById", () => {
    it("deve retornar produto existente", async () => {
      const mockProduct = {
        id: "uuid-123",
        name: "Pizza",
        price: 30,
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ProductRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await ProductService.getProductById("uuid-123");

      expect(result).toEqual(mockProduct);
      expect(ProductRepository.findById).toHaveBeenCalledWith("uuid-123");
    });

    it("deve lançar erro se produto não existir", async () => {
      (ProductRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        ProductService.getProductById("uuid-inexistente")
      ).rejects.toThrow("Produto com ID uuid-inexistente não encontrado");
    });
  });

  describe("updateProduct", () => {
    it("deve atualizar produto existente", async () => {
      const mockUpdated = {
        id: "uuid-123",
        name: "Pizza Atualizada",
        price: 40,
        category: ProductCategory.PRATOS_PRINCIPAIS,
        visible: true,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);
      (ProductRepository.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await ProductService.updateProduct("uuid-123", {
        name: "Pizza Atualizada",
        price: 40,
      });

      expect(result).toEqual(mockUpdated);
      expect(ProductRepository.update).toHaveBeenCalledWith("uuid-123", {
        name: "Pizza Atualizada",
        price: 40,
      });
    });

    it("deve lançar erro se produto não existir", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(false);

      await expect(
        ProductService.updateProduct("uuid-inexistente", { name: "Novo Nome" })
      ).rejects.toThrow("Produto com ID uuid-inexistente não encontrado");

      expect(ProductRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro se tentar atualizar com preço negativo", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);

      await expect(
        ProductService.updateProduct("uuid-123", { price: -10 })
      ).rejects.toThrow("Preço deve ser positivo");

      expect(ProductRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteProduct", () => {
    it("deve deletar produto existente", async () => {
      (ProductRepository.exists as jest.Mock).mockResolvedValue(true);
      (ProductRepository.delete as jest.Mock).mockResolvedValue(true);

      (PromotionRepository.deleteByProductId as jest.Mock).mockResolvedValue(
        undefined
      );

      await ProductService.deleteProduct("uuid-123");

      expect(PromotionRepository.deleteByProductId).toHaveBeenCalledWith(
        "uuid-123"
      );
      expect(ProductRepository.delete).toHaveBeenCalledWith("uuid-123");
    });
  });
});
