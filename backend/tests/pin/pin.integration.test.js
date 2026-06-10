process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");

jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");

  return {
    ...actualFs,
    promises: {
      ...actualFs.promises,
      mkdir: jest.fn(),
      writeFile: jest.fn()
    }
  };
});

jest.mock("country-reverse-geocoding", () => ({
  country_reverse_geocoding: jest.fn(() => ({
    get_country: jest.fn(() => ({ code: "JPN" }))
  }))
}));

jest.mock("../../services/anilistApi.js", () => ({
  fetchAnimeData: jest.fn(),
  animeService: jest.fn()
}));

const fs = require("fs");
const anilistApi = require("../../services/anilistApi.js");
const app = require("../../app");
const db = require("../../models");

const BASE64_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";

const createPinPayload = (title, overrides = {}) => ({
  anime: "Naruto",
  animeImage: BASE64_IMAGE,
  description: "A ninja adventure",
  latitude: "35.6895",
  longitude: "139.6917",
  realImage: BASE64_IMAGE,
  title,
  ...overrides
});

const registerAndLogin = async (agent, username, email) => {
  await agent.post("/api/auth/register").send({
    username,
    email,
    password: "password123",
    confirmPassword: "password123"
  });

  await agent.post("/api/auth/login").send({
    email,
    password: "password123"
  });

  return agent;
};

describe("Pin integration", () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
    await db.Region.create({ id: 1, name: "Japan" });
    anilistApi.fetchAnimeData.mockResolvedValue(["Naruto"]);
    fs.promises.mkdir.mockResolvedValue(undefined);
    fs.promises.writeFile.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test("creates a pin, returns it by id, and lists it for the signed-in user", async () => {
    const agent = await registerAndLogin(request.agent(app), "OwnerUser", "owner@example.com");

    const createRes = await agent.post("/api/pins").send(createPinPayload("Naruto Pin"));
    expect(createRes.status).toBe(201);
    expect(createRes.body.message).toBe("Pin created successfully");

    const createdPinId = createRes.body.pin.id;
    const storedPin = await db.Pin.findByPk(createdPinId);

    expect(storedPin).not.toBeNull();
    expect(storedPin.title).toBe("Naruto Pin");
    expect(storedPin.animeName).toBe("Naruto");
    expect(storedPin.regionId).toBe(1);

    const listRes = await agent.get("/api/pins");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toEqual({
      count: 1,
      pins: expect.arrayContaining([
        expect.objectContaining({
          id: createdPinId,
          title: "Naruto Pin"
        })
      ])
    });

    const byIdRes = await agent.get(`/api/pins/${createdPinId}`);
    expect(byIdRes.status).toBe(200);
    expect(byIdRes.body).toEqual(expect.objectContaining({
      id: createdPinId,
      title: "Naruto Pin",
      animeName: "Naruto"
    }));

    const byUserRes = await agent.post("/api/pins/userPins");
    expect(byUserRes.status).toBe(200);
    expect(byUserRes.body.pins).toHaveLength(1);
    expect(byUserRes.body.pins[0].id).toBe(createdPinId);
  });

  test("filters pins by date range", async () => {
    const agent = await registerAndLogin(request.agent(app), "FilterUser", "filter@example.com");

    const oldPinRes = await agent.post("/api/pins").send(createPinPayload("Old Pin", {
      description: "Old pin"
    }));
    const recentPinRes = await agent.post("/api/pins").send(createPinPayload("Recent Pin", {
      description: "Recent pin"
    }));

    expect(oldPinRes.status).toBe(201);
    expect(recentPinRes.status).toBe(201);

    const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await db.Pin.update(
      { createdAt: oldDate, updatedAt: oldDate },
      { where: { id: oldPinRes.body.pin.id } }
    );

    const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    const filteredRes = await agent.get(`/api/pins?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);

    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.count).toBe(1);
    expect(filteredRes.body.pins).toHaveLength(1);
    expect(filteredRes.body.pins[0].title).toBe("Recent Pin");
  });

  test("updates and deletes owned pins while blocking other users", async () => {
    const owner = await registerAndLogin(request.agent(app), "OwnerUser", "owner@example.com");
    const intruder = await registerAndLogin(request.agent(app), "OtherUser", "other@example.com");

    const createRes = await owner.post("/api/pins").send(createPinPayload("Editable Pin", {
      description: "To be edited"
    }));
    expect(createRes.status).toBe(201);

    const pinId = createRes.body.pin.id;

    const editRes = await owner.put(`/api/pins/${pinId}`).send({ title: "Edited Pin" });
    expect(editRes.status).toBe(200);
    expect(editRes.body).toEqual(expect.objectContaining({
      message: "Pin updated successfully",
      updatedPin: expect.objectContaining({
        id: pinId,
        title: "Edited Pin"
      })
    }));

    const forbiddenRes = await intruder.put(`/api/pins/${pinId}`).send({ title: "Illegal Update" });
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body).toEqual({
      message: "Not authorized to edit this pin"
    });

    const deleteRes = await owner.delete(`/api/pins/${pinId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({
      message: "Pin deleted successfully"
    });

    const deletedPin = await db.Pin.findByPk(pinId);
    expect(deletedPin).toBeNull();
  });
});
