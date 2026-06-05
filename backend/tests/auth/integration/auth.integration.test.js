process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const app = require("../../../app");
const db = require("../../../models");

describe("Auth integration", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("registers, logs in, and returns the current user", async () => {
    const agent = request.agent(app);

    const registerRes = await agent.post("/api/auth/register").send({
      username: "TestUser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123"
    });

    expect(registerRes.status).toBe(201);

    const loginRes = await agent.post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123"
    });

    expect(loginRes.status).toBe(200);

    const meRes = await agent.get("/api/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body).toEqual({
      username: "TestUser",
      email: "test@example.com"
    });

    const healthRes = await agent.get("/api/auth/health");
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.userCount).toBe(1);
  });
});
