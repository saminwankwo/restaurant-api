
import { Router } from "express";
import { Restaurant, Table, Reservation } from "../models";
import dayjs from "dayjs";
import { Op } from "sequelize";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, openTime, closeTime, totalTables } = req.body;
    if (!name || !openTime || !closeTime || totalTables == null) {
      return res.status(400).json({ error: "name, openTime, closeTime, totalTables are required" });
    }
    const restaurant = await Restaurant.create({ name, openTime, closeTime, totalTables });
    res.status(201).json(restaurant);
  } catch (e) {
    res.status(500).json({ error: "Failed to create restaurant" });
  }
});

router.post("/:id/tables", async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    if (!tableNumber || !capacity || capacity <= 0) {
      return res.status(400).json({ error: "Invalid tableNumber or capacity" });
    }
    const existing = await Table.findOne({ where: { RestaurantId: req.params.id, tableNumber } });
    if (existing) return res.status(400).json({ error: "Table number already exists" });
    const table = await Table.create({ tableNumber, capacity, RestaurantId: req.params.id });
    res.status(201).json(table);
  } catch (e) {
    res.status(500).json({ error: "Failed to add table" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, { include: [Table] });
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    res.json(restaurant);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
});

router.get("/:id/reservations", async (req, res) => {
  try {
    const { date } = req.query as { date?: string };
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    if (!date) return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
    const day = dayjs(date);
    const start = day.startOf("day").toDate();
    const end = day.endOf("day").toDate();
    const tables = await Table.findAll({ where: { RestaurantId: req.params.id } });
    const tableIds = tables.map(t => t.get("id"));
    const reservations = await Reservation.findAll({
      where: { 
        TableId: { [Op.in]: tableIds },
        startTime: { [Op.gte]: start },
        endTime: { [Op.lte]: end }
      }
    });
    res.json(reservations);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

router.get("/:id/availability", async (req, res) => {
  try {
    const { date, partySize, durationMinutes } = req.query as { date?: string; partySize?: string; durationMinutes?: string };
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    if (!date || !partySize || !durationMinutes) {
      return res.status(400).json({ error: "date, partySize, durationMinutes are required" });
    }
    const ps = Number(partySize);
    const dur = Number(durationMinutes);
    const day = dayjs(date);
    const open = day.hour(Number(String(restaurant.get("openTime")).split(":")[0])).minute(Number(String(restaurant.get("openTime")).split(":")[1]));
    const close = day.hour(Number(String(restaurant.get("closeTime")).split(":")[0])).minute(Number(String(restaurant.get("closeTime")).split(":")[1]));
    const tables = await Table.findAll({ where: { RestaurantId: req.params.id, capacity: { [Op.gte]: ps } }, order: [["capacity","ASC"]] });
    const stepMinutes = 30;
    const slots: string[] = [];
    let cursor = open;
    while (cursor.add(dur, "minute").isBefore(close) || cursor.add(dur, "minute").isSame(close)) {
      const slotStart = cursor;
      const slotEnd = cursor.add(dur, "minute");
      let available = false;
      for (const table of tables) {
        const overlap = await Reservation.findOne({
          where: {
            TableId: table.get("id"),
            startTime: { [Op.lt]: slotEnd.toDate() },
            endTime: { [Op.gt]: slotStart.toDate() }
          }
        });
        if (!overlap) {
          available = true;
          break;
        }
      }
      if (available) slots.push(slotStart.format("HH:mm"));
      cursor = cursor.add(stepMinutes, "minute");
    }
    res.json({ slots });
  } catch (e) {
    res.status(500).json({ error: "Failed to compute availability" });
  }
});

export default router;
