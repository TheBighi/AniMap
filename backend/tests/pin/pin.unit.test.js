process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const app = require("../../app");
const db = require("../../models");

describe("Pin unit", () => {
    let agent;

    beforeAll(async () => {
        await db.sequelize.sync({ force: true });

        agent = request.agent(app);

        const registerRes = await agent.post("/api/auth/register").send({
            username: "TestUser",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123"
        });
        const loginRes = await agent.post("/api/auth/login").send({
            email: "test@example.com",
            password: "password123"
        });
    });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("Form with empty fields", async () => {
    const formRes = await agent.post("/api/pins").send({
        anime: "",
        animeImage: "",
        description: "",
        latitude: "",
        longitude: "",
        realImage: "",
        title: ""
    });

    expect(formRes.status).toBe(400);
    expect(formRes.body).toEqual({
        message: "Anime not found in Anilist",
        animes: []
    });
  });

  test("Missing latitude or longitude triggers 400 validation error", async () => {
    const formRes = await agent.post("/api/pins").send({
        anime: "Naruto",
        animeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        description: "Missing coordinates",
        latitude: "",
        longitude: "",
        realImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
        title: "Pin without location"
    });

    expect(formRes.status).toBe(400);
    expect(formRes.body).toEqual({
      message: "Latitude and longitude are required"
    });
  });

    test("Adding a new pin with valid data", async () => {
        const formRes = await agent.post("/api/pins").send({
            anime: "Naruto",
            animeImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
            description: "A ninja adventure",
            latitude: "35.6895",
            longitude: "139.6917",
            realImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
            title: "Naruto Pin"
        });
        expect(formRes.status).toBe(201);
        const pinsRes = await agent.get("/api/pins");
        expect(pinsRes.status).toBe(200);
        expect(pinsRes.body.pins.length).toBe(1);
        expect(pinsRes.body.pins[0].title).toBe("Naruto Pin");
    })
});
