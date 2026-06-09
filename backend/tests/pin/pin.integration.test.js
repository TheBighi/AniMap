process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const app = require("../../app");
const db = require("../../models");

describe("Pin integration - filtering/edit/delete", () => {
    let agent;

    beforeAll(async () => {
        await db.sequelize.sync({ force: true });

        agent = request.agent(app);

        await agent.post("/api/auth/register").send({
            username: "TestUser",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123"
        });
        await agent.post("/api/auth/login").send({
            email: "test@example.com",
            password: "password123"
        });
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    test("Filtering pins by date", async () => {
        const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";

        const res1 = await agent.post("/api/pins").send({
            anime: "Naruto",
            animeImage: base64,
            description: "Old pin",
            latitude: "35.6895",
            longitude: "139.6917",
            realImage: base64,
            title: "Old Pin"
        });

        const res2 = await agent.post("/api/pins").send({
            anime: "Naruto",
            animeImage: base64,
            description: "Recent pin",
            latitude: "35.6895",
            longitude: "139.6917",
            realImage: base64,
            title: "Recent Pin"
        });

        expect(res1.status).toBe(201);
        expect(res2.status).toBe(201);

        // Set the first pin to an older date
        const oldDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        await db.Pin.update({ createdAt: oldDate }, { where: { id: res1.body.pin.id } });

        const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
        const endDate = new Date().toISOString();

        const filtered = await agent.get(`/api/pins?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
        expect(filtered.status).toBe(200);
        expect(filtered.body.pins.length).toBe(1);
        expect(filtered.body.pins[0].title).toBe("Recent Pin");
    });

    test("Editing your own pin", async () => {
        const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";

        const createRes = await agent.post("/api/pins").send({
            anime: "Naruto",
            animeImage: base64,
            description: "To be edited",
            latitude: "35.6895",
            longitude: "139.6917",
            realImage: base64,
            title: "Editable Pin"
        });

        expect(createRes.status).toBe(201);

        const pinId = createRes.body.pin.id;

        const editRes = await agent.put(`/api/pins/${pinId}`).send({ title: "Edited Pin" });
        expect(editRes.status).toBe(200);
        expect(editRes.body.updatedPin.title).toBe("Edited Pin");
    });

    test("Cannot edit another user's pin", async () => {
        const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";

        const createRes = await agent.post("/api/pins").send({
            anime: "Naruto",
            animeImage: base64,
            description: "Owner pin",
            latitude: "35.6895",
            longitude: "139.6917",
            realImage: base64,
            title: "Owner Pin"
        });

        expect(createRes.status).toBe(201);

        const pinId = createRes.body.pin.id;

        const otherAgent = request.agent(app);
        await otherAgent.post("/api/auth/register").send({
            username: "OtherUser",
            email: "other@example.com",
            password: "password123",
            confirmPassword: "password123"
        });
        await otherAgent.post("/api/auth/login").send({
            email: "other@example.com",
            password: "password123"
        });

        const editRes = await otherAgent.put(`/api/pins/${pinId}`).send({ title: "Illegal Update" });
        expect(editRes.status).toBe(403);
        expect(editRes.body).toEqual({ message: "Not authorized to edit this pin" });

        const pinRes = await agent.get(`/api/pins/${pinId}`);
        expect(pinRes.status).toBe(200);
        expect(pinRes.body.title).toBe("Owner Pin");
    });

    test("Deleting your own pin", async () => {
        const base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA";

        const createRes = await agent.post("/api/pins").send({
            anime: "Naruto",
            animeImage: base64,
            description: "To be deleted",
            latitude: "35.6895",
            longitude: "139.6917",
            realImage: base64,
            title: "Deletable Pin"
        });

        expect(createRes.status).toBe(201);

        const pinId = createRes.body.pin.id;

        const delRes = await agent.delete(`/api/pins/${pinId}`);
        expect(delRes.status).toBe(200);

        const found = await db.Pin.findByPk(pinId);
        expect(found).toBeNull();
    });
});
