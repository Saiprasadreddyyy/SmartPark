import dotenv from "dotenv";
dotenv.config(); // <-- LOAD .env FIRST

import http from 'http';
import app from './app.js';
import connectDB from './config/mongodb.js';
import { initializeSocketIO } from './components/sockets/parking.socket.js';
import { seedParking } from './data/seedParking.js';

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

// Initialize socket.io
initializeSocketIO(server);

const startServer = async () => {
  try {
    await connectDB();
    await seedParking();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO enabled for real-time updates`);
      console.log(`API URL: https://smartpark-tl0l.onrender.com/api/parking`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
