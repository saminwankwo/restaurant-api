import express, { Request, Response } from "express";
// import restaurantRoutes from "./routes/restaurants";
// import reservationRoutes from "./routes/reservations";

const app = express();
app.use(express.json());

app.get("/", (req:Request, res:Response) => {
    res.send("Welcome to the Restaurant Reservation System API");
});

// app.use("/restaurants", restaurantRoutes);
// app.use("/reservations", reservationRoutes);

export default app;
