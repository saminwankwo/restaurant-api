
import { Router } from "express";
import { Restaurant, Table } from "../models";

const router = Router();

router.post("/", async (req, res) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json(restaurant);
});

router.post("/:id/tables", async (req, res) => {
  const table = await Table.create({ ...req.body, RestaurantId: req.params.id });
  res.status(201).json(table);
});

router.get("/:id", async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id, { include: [Table] });
  res.json(restaurant);
});

export default router;
