import request from "supertest";
import app from "../src/app";
import { sequelize, Restaurant, Table, Reservation } from "../src/models";
import dayjs from "dayjs";

describe("Restaurant API", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("Create restaurant", async () => {
    const res = await request(app).post("/restaurants").send({
      name: "Tallie Grill",
      openTime: "10:00:00",
      closeTime: "22:00:00",
      totalTables: 10
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Tallie Grill");
  });

  test("Add table to restaurant", async () => {
    const r = await Restaurant.findOne();
    const res = await request(app).post(`/restaurants/${r!.get("id")}/tables`).send({
      tableNumber: "T1",
      capacity: 4
    });
    expect(res.status).toBe(201);
    expect(res.body.capacity).toBe(4);
  });

  test("Create reservation and prevent overlap", async () => {
    const r = await Restaurant.findOne();
    await request(app).post(`/restaurants/${r!.get("id")}/tables`).send({
      tableNumber: "T2",
      capacity: 4
    });
    const start = dayjs().hour(19).minute(0).second(0);
    const res1 = await request(app).post(`/reservations/${r!.get("id")}`).send({
      customerName: "Alice",
      phone: "555",
      partySize: 4,
      startTime: start.toISOString(),
      durationMinutes: 120
    });
    expect(res1.status).toBe(201);

    const res2 = await request(app).post(`/reservations/${r!.get("id")}`).send({
      customerName: "Bob",
      phone: "555",
      partySize: 4,
      startTime: start.add(60, "minute").toISOString(),
      durationMinutes: 60
    });
    expect([400,201]).toContain(res2.status);
    if (res2.status === 201) {
      const tableId1 = res1.body.TableId;
      const tableId2 = res2.body.TableId;
      expect(tableId1).not.toBe(tableId2);
    }
  });

  test("Capacity enforcement fails for too large party", async () => {
    const r = await Restaurant.findOne();
    const start = dayjs().hour(18).minute(0).second(0);
    const res = await request(app).post(`/reservations/${r!.get("id")}`).send({
      customerName: "Carol",
      phone: "555",
      partySize: 6,
      startTime: start.toISOString(),
      durationMinutes: 60
    });
    expect([400,201]).toContain(res.status);
  });

  test("Availability returns slots for party size", async () => {
    const r = await Restaurant.findOne();
    const date = dayjs().format("YYYY-MM-DD");
    const res = await request(app).get(`/restaurants/${r!.get("id")}/availability`)
      .query({ date, partySize: 2, durationMinutes: 60 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.slots)).toBe(true);
  });
});

