process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const app = require("../../app");
const db = require("../../models");

describe("Auth integration", () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  const register = (agent, username, email) => agent.post("/api/auth/register").send({
    username,
    email,
    password: "password123",
    confirmPassword: "password123"
  });

  const login = (agent, email, password) => agent.post("/api/auth/login").send({
    email,
    password
  });

  test("registers, logs in, reads the session, and logs out", async () => {
    const agent = request.agent(app);

    const registerRes = await register(agent, "TestUser", "test@example.com");
    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toEqual({ message: "user reg successful" });

    const loginRes = await login(agent, "test@example.com", "password123");
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toEqual({
      message: "Logged in successfully",
      username: "TestUser"
    });

    const meRes = await agent.get("/api/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body).toEqual({
      username: "TestUser",
      email: "test@example.com"
    });

    const healthRes = await agent.get("/api/auth/health");
    expect(healthRes.status).toBe(200);
    expect(healthRes.body).toEqual({
      message: "ok",
      userCount: 1
    });

    const logoutRes = await agent.post("/api/auth/logout");
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toEqual({ message: "Logged out successfully" });

    const blockedRes = await agent.get("/api/auth/me");
    expect(blockedRes.status).toBe(401);
    expect(blockedRes.body).toEqual({ message: "No token given" });
  });

  test("rejects duplicate registration and keeps the original user intact", async () => {
    const agent = request.agent(app);

    const firstRegister = await register(agent, "TestUser", "test@example.com");
    expect(firstRegister.status).toBe(201);

    const duplicateRegister = await register(agent, "OtherUser", "test@example.com");
    expect(duplicateRegister.status).toBe(400);
    expect(duplicateRegister.body).toEqual({ msg: "User already exists" });

    const users = await db.User.findAll();
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe("test@example.com");
  });

  test("rejects invalid login but still allows a valid session flow", async () => {
    const agent = request.agent(app);

    const registerRes = await register(agent, "TestUser", "test@example.com");
    expect(registerRes.status).toBe(201);

    const badLogin = await login(agent, "test@example.com", "wrong-password");
    expect(badLogin.status).toBe(400);
    expect(badLogin.body).toEqual({ message: "Invalid creds" });

    const goodLogin = await login(agent, "test@example.com", "password123");
    expect(goodLogin.status).toBe(200);

    const healthRes = await agent.get("/api/auth/health");
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.userCount).toBe(1);
  });
});
