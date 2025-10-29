const poolMock = { query: jest.fn() };

jest.mock("../../config/database", () => ({
  __esModule: true,
  default: poolMock,
}));

import request from "supertest";
import app from "../../app";
import { ProductCategory } from "../../models";

describe("Menu API - Integration (mocked DB)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deve retornar apenas produtos visíveis", async () => {
    poolMock.query.mockResolvedValueOnce({
      rows: [
        {
          id: "prod-1",
          restaurant_id: "rest-1",
          name: "Produto Visível",
          description: "Descrição do produto visível",
          price: 50,
          category: ProductCategory.ENTRADAS,
          visible: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "prod-2",
          restaurant_id: "rest-1",
          name: "Produto Invisível",
          description: "Descrição do produto invisível",
          price: 30,
          category: ProductCategory.ENTRADAS,
          visible: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });

    poolMock.query.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app).get("/api/menu");
    console.log("Resposta do menu:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("prod-1");
  });

  it("deve filtrar por categoria", async () => {
    poolMock.query.mockResolvedValueOnce({
      rows: [
        {
          id: "prod-1",
          restaurant_id: "rest-1",
          name: "Entrada 1",
          description: "Descrição entrada 1",
          price: 30,
          category: ProductCategory.ENTRADAS,
          visible: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "prod-2",
          restaurant_id: "rest-1",
          name: "Entrada 2",
          description: "Descrição entrada 2",
          price: 40,
          category: ProductCategory.ENTRADAS,
          visible: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    });

    poolMock.query.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app)
      .get("/api/menu")
      .query({ category: ProductCategory.ENTRADAS });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    res.body.data.forEach((item: any) => {
      expect(item.category).toBe(ProductCategory.ENTRADAS);
    });
  });
});
