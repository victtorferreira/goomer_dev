import request from "supertest";
import app from "../../app";
import { ProductCategory } from "../../models";

describe("Promotions API", () => {
  it("cria promoção para produto", async () => {
    const productRes = await request(app).post("/api/products").send({
      name: "Pizza",
      price: 50,
      category: ProductCategory.PRATOS_PRINCIPAIS,
    });
    console.log(productRes.body);

    const promoRes = await request(app)
      .post("/api/promotions")
      .send({
        product_id: productRes.body.data.id,
        description: "Promoção de teste",
        promotional_price: 30,
        days_of_week: [1],
        start_time: "10:00",
        end_time: "12:00",
      });

    expect(promoRes.status).toBe(201);
    expect(promoRes.body.data.promotional_price).toBe(30);
  });
});
