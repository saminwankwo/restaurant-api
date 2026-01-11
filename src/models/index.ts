
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME || "",
  process.env.DB_USER || "",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST,
    dialect: process.env.NODE_ENV === "test" ? "sqlite" : "mysql",
    storage: process.env.NODE_ENV === "test" ? ":memory:" : undefined
  }
);

import { Restaurant } from "./restaurant";
import { Table } from "./table";
import { Reservation } from "./reservation";

Restaurant.hasMany(Table, { foreignKey: "RestaurantId", onDelete: "CASCADE" });
Table.belongsTo(Restaurant, { foreignKey: "RestaurantId" });

Table.hasMany(Reservation, { foreignKey: "TableId", onDelete: "CASCADE" });
Reservation.belongsTo(Table, { foreignKey: "TableId" });

export { Restaurant, Table, Reservation };
