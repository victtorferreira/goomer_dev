const poolMock = {
  query: jest.fn(),
};

jest.mock("../config/database", () => ({
  __esModule: true,
  default: poolMock,
}));

export { poolMock };
