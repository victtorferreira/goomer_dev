jest.mock("../../config/database", () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import request from "supertest";
import app from "../../app";

const poolMock = require("../../config/database").default;

describe("Promotions API - Integration (mocked DB)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    poolMock.query.mockResolvedValue({ rows: [] });
  });

  it("deve criar promoção com desconto válido", async () => {
    const newPromo = {
      product_id: "prod-1",
      description: "Happy Hour",
      discount_percentage: 50,
      days_of_week: [1],
      start_time: "18:00",
      end_time: "20:00",
    };

    poolMock.query.mockImplementation((sql: string, params: any[]) => {
      console.log("SQL no mock:", sql);
      console.log("Params no mock:", params);

      if (
        sql.includes("SELECT") &&
        sql.includes("products") &&
        sql.includes("id = $1")
      ) {
        return Promise.resolve({
          rows: [
            {
              id: "prod-1",
              name: "Produto Teste",
              price: 50,
              restaurant_id: "rest-1",
              description: "Descrição do produto",
              category: "ENTRADAS",
              visible: true,
            },
          ],
        });
      }

      if (sql.includes("INSERT") && sql.includes("promotions")) {
        return Promise.resolve({
          rows: [
            {
              id: "promo-1",
              product_id: newPromo.product_id,
              description: newPromo.description,
              promotional_price: 25,
              days_of_week: newPromo.days_of_week,
              start_time: newPromo.start_time,
              end_time: newPromo.end_time,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        });
      }

      return Promise.resolve({ rows: [] });
    });

    const res = await request(app).post("/api/promotions").send(newPromo);
    console.log("Status:", res.status);
    console.log("Resposta:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body.data.promotional_price).toBe(25);
  });
});
