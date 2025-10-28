import request from "supertest";
import app from "../../app";
import { ProductCategory } from "../../models";

describe("Products API", () => {
  it("cria e lista produtos", async () => {
    const createRes = await request(app).post("/api/products").send({
      name: "Pizza",
      price: 35,
      category: ProductCategory.PRATOS_PRINCIPAIS,
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data).toHaveProperty("id");

    const listRes = await request(app).get("/api/products");
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
  });
});
