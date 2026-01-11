
import { DataTypes } from "sequelize";
import { sequelize } from ".";

export const Reservation = sequelize.define("Reservation", {
  customerName: DataTypes.STRING,
  phone: DataTypes.STRING,
  partySize: DataTypes.INTEGER,
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
  TableId: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM("pending","confirmed","completed","cancelled"),
    defaultValue: "confirmed"
  }
});
