import { DataTypes } from "sequelize";
import { sequelize } from ".";

export const Waitlist = sequelize.define("Waitlist", {
  customerName: DataTypes.STRING,
  phone: DataTypes.STRING,
  partySize: DataTypes.INTEGER,
  desiredTime: DataTypes.DATE,
  RestaurantId: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM("pending","notified"),
    defaultValue: "pending"
  }
});

