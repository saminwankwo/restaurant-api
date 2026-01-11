
import { Router } from "express";
import { Reservation, Table } from "../models";
import dayjs from "dayjs";
import { Op } from "sequelize";

const router = Router();

router.post("/:restaurantId", async (req, res) => {
  const { customerName, phone, partySize, startTime, durationMinutes } = req.body;

  const start = dayjs(startTime);
  const end = start.add(durationMinutes, "minute");

  const tables = await Table.findAll({
    where: { capacity: { [Op.gte]: partySize } },
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
        partySize,
        startTime: start.toDate(),
        endTime: end.toDate(),
        TableId: table.get("id")
      });
      console.log("Reservation confirmed:", reservation.get("id"));
      return res.status(201).json(reservation);
    }
  }

  res.status(400).json({ error: "No available table" });
});

router.patch("/:id/cancel", async (req, res) => {
  const r = await Reservation.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  await r.update({ status: "cancelled" });
  res.json(r);
});

export default router;
