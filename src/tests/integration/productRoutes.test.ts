

const poolMock = { query: jest.fn() };

jest.mock("../../config/database", () => ({
  __esModule: true,
  default: poolMock,
}));

import request from "supertest";
import app from "../../app";

describe("Products API - Integration (mocked DB)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deve retornar produtos visíveis", async () => {
    poolMock.query.mockResolvedValueOnce({
      rows: [
        {
          id: "prod-1",
          name: "Produto 1",
          price: 50,
          category: "ENTRADAS",
          visible: true,
        },
        {
          id: "prod-2",
          name: "Produto 2",
          price: 60,
          category: "PRATOS",
          visible: true,
        },
      ],
    });

    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});
