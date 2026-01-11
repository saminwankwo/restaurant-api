
import { DataTypes } from "sequelize";
import { sequelize } from ".";

export const Restaurant = sequelize.define("Restaurant", {
  name: DataTypes.STRING,
  openTime: DataTypes.TIME,
  closeTime: DataTypes.TIME
});
