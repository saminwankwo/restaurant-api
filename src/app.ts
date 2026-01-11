import express, { Request, Response } from "express";
import restaurantRoutes from "./routes/restaurants";
import reservationRoutes from "./routes/reservations";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());

app.get("/", (req:Request, res:Response) => {
    res.send("Welcome to the Restaurant Reservation System API");
});

app.use("/restaurants", restaurantRoutes);
app.use("/reservations", reservationRoutes);

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Restaurant Reservation API",
    version: "1.0.0",
    description: "Simple REST API for restaurant table reservations"
  },
  servers: [{ url: "/" }],
  paths: {
    "/restaurants": {
      post: {
        summary: "Create a restaurant",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  openTime: { type: "string", example: "10:00:00" },
                  closeTime: { type: "string", example: "22:00:00" },
                  totalTables: { type: "integer", example: 10 }
                },
                required: ["name","openTime","closeTime","totalTables"]
              }
            }
          }
        },
        responses: { "201": { description: "Created" }, "400": { description: "Bad Request" } }
      }
    },
    "/restaurants/{id}/tables": {
      post: {
        summary: "Add table to restaurant",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tableNumber: { type: "string" },
                  capacity: { type: "integer" }
                },
                required: ["tableNumber","capacity"]
              }
            }
          }
        },
        responses: { "201": { description: "Created" }, "400": { description: "Bad Request" }, "404": { description: "Not Found" } }
      }
    },
    "/restaurants/{id}": {
      get: {
        summary: "Get restaurant details",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not Found" } }
      }
    },
    "/restaurants/{id}/reservations": {
      get: {
        summary: "Get reservations by date",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "date", in: "query", required: true, schema: { type: "string", example: "2026-01-11" } }
        ],
        responses: { "200": { description: "OK" }, "400": { description: "Bad Request" }, "404": { description: "Not Found" } }
      }
    },
    "/restaurants/{id}/availability": {
      get: {
        summary: "Check availability slots",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "date", in: "query", required: true, schema: { type: "string", example: "2026-01-11" } },
          { name: "partySize", in: "query", required: true, schema: { type: "integer", example: 4 } },
          { name: "durationMinutes", in: "query", required: true, schema: { type: "integer", example: 120 } }
        ],
        responses: { "200": { description: "OK" }, "400": { description: "Bad Request" }, "404": { description: "Not Found" } }
      }
    },
    "/reservations/{restaurantId}": {
      post: {
        summary: "Create reservation",
        parameters: [{ name: "restaurantId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  customerName: { type: "string" },
                  phone: { type: "string" },
                  partySize: { type: "integer" },
                  startTime: { type: "string", format: "date-time" },
                  durationMinutes: { type: "integer" }
                },
                required: ["customerName","phone","partySize","startTime","durationMinutes"]
              }
            }
          }
        },
        responses: { "201": { description: "Created" }, "400": { description: "Bad Request" }, "404": { description: "Not Found" } }
      }
    },
    "/reservations/{id}/cancel": {
      patch: {
        summary: "Cancel reservation",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "404": { description: "Not Found" } }
      }
    },
    "/reservations/{id}": {
      patch: {
        summary: "Modify reservation time",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  startTime: { type: "string", format: "date-time" },
                  durationMinutes: { type: "integer" }
                }
              }
            }
          }
        },
        responses: { "200": { description: "OK" }, "400": { description: "Bad Request" }, "404": { description: "Not Found" } }
      }
    }
  }
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
