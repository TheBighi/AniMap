process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const app = require("../../../app");
const db = require("../../../models");

describe("Auth integration", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    const agent = request.agent(app);

    const registerRes = await agent.post("/api/auth/register").send({
      username: "TestUser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123"
    });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("logging in with invalid password", async () => {
    const agent = request.agent(app);

    const loginRes = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "blablablabla"
    });

    expect(loginRes.status).toBe(400);
    expect(loginRes.body).toEqual({
      message: "Invalid creds"
    });
  });
});
