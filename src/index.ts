import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { sequelize } from "./models";

const PORT = process.env.PORT || 3000;

(async () => {
  await sequelize.sync();
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();
