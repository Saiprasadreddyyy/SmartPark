
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import connectDB from "./config/mongodb.js";
import redis from "./config/redis.js";
import { initializeSocketIO } from "./components/sockets/parking.socket.js";
import { seedParking } from "./data/seedParking.js";

const PORT = process.env.PORT || 5050;
const server = http.createServer(app);


initializeSocketIO(server);

const startServer = async () => {
  try {
    console.log("Connecting MongoDB…");
    await connectDB();

    console.log("Checking Redis connection…");
    await redis.ping(); 
    console.log("Redis authenticated & active");

    console.log("Seeding parking (MongoDB → Redis)…");
    await seedParking();
    console.log("Parking seed completed");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Socket.IO enabled for real-time updates");
      console.log(
        `📡 API URL: https://smartpark-tl0l.onrender.com/api/parking`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
