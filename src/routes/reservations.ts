import { Router } from "express";
import { Reservation, Table, Restaurant } from "../models";
import dayjs from "dayjs";
import { Op } from "sequelize";

const router = Router();

router.post("/:restaurantId", async (req, res) => {
  try {
    const { customerName, phone, partySize, startTime, durationMinutes } = req.body;
    if (!customerName || !phone || !partySize || !startTime || !durationMinutes) {
      return res.status(400).json({ error: "customerName, phone, partySize, startTime, durationMinutes are required" });
    }
    const restaurant = await Restaurant.findByPk(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    const start = dayjs(startTime);
    const end = start.add(Number(durationMinutes), "minute");
    const openParts = String(restaurant.get("openTime")).split(":");
    const closeParts = String(restaurant.get("closeTime")).split(":");
    const open = start.startOf("day").hour(Number(openParts[0])).minute(Number(openParts[1]));
    const close = start.startOf("day").hour(Number(closeParts[0])).minute(Number(closeParts[1]));
    if (start.isBefore(open) || end.isAfter(close)) {
      return res.status(400).json({ error: "Reservation outside operating hours" });
    }

    const tables = await Table.findAll({
      where: { RestaurantId: req.params.restaurantId, capacity: { [Op.gte]: Number(partySize) } },
      order: [["capacity","ASC"]]
    });

    for (const table of tables) {
      const overlap = await Reservation.findOne({
        where: {
          TableId: table.get("id"),
          startTime: { [Op.lt]: end.toDate() },
          endTime: { [Op.gt]: start.toDate() }
        }
      });

      if (!overlap) {
        const reservation = await Reservation.create({
          customerName,
          phone,
          partySize: Number(partySize),
          startTime: start.toDate(),
          endTime: end.toDate(),
          TableId: table.get("id")
        });
        console.log("Reservation confirmed:", reservation.get("id"));
        return res.status(201).json(reservation);
      }
    }
    res.status(400).json({ error: "No available table" });
  } catch (e) {
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const r = await Reservation.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    await r.update({ status: "cancelled" });
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const r = await Reservation.findByPk(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    const { startTime, durationMinutes } = req.body;
    if (!startTime && !durationMinutes) return res.status(400).json({ error: "Provide startTime or durationMinutes" });

    const start = dayjs(startTime ?? r.get("startTime") as Date);
    const duration = Number(durationMinutes ?? dayjs(r.get("endTime") as Date).diff(dayjs(r.get("startTime") as Date), "minute"));
    const end = start.add(duration, "minute");

    const tableId = r.get("TableId") as number;
    const overlap = await Reservation.findOne({
      where: {
        TableId: tableId,
        id: { [Op.ne]: r.get("id") },
        startTime: { [Op.lt]: end.toDate() },
        endTime: { [Op.gt]: start.toDate() }
      }
    });
    if (overlap) return res.status(400).json({ error: "Overlapping reservation" });

    await r.update({ startTime: start.toDate(), endTime: end.toDate() });
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: "Failed to modify reservation" });
  }
});

export default router;
