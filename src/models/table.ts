
import { DataTypes } from "sequelize";
import { sequelize } from ".";

export const Table = sequelize.define("Table", {
  tableNumber: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
  RestaurantId: DataTypes.INTEGER
});
