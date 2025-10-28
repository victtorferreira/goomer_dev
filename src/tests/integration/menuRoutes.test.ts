import request from "supertest";
import app from "../../app";

describe("Menu API", () => {
  it("retorna cardápio consolidado", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
