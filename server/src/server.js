import http from 'http';
import app from './app.js';
import connectDB from './config/mongodb.js';
import { initializeSocketIO } from './components/sockets/parking.socket.js';
import { seedParking } from './data/seedParking.js';

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocketIO(server);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed parking data on startup
    await seedParking();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO enabled for real-time updates`);
      console.log(`🌐 API available at http://localhost:${PORT}/api/parking`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
// import http from "http";
// import app from "./app.js";
// import { initializeSocketIO } from "./components/sockets/parking.socket.js";
// import { seedParking } from "./data/seedParking.js";

// const PORT = process.env.PORT || 5050;

// const server = http.createServer(app);

// // Initialize Socket.IO
// initializeSocketIO(server);

// // Seed parking data on startup
// seedParking()
//   .then(() => {
//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`📡 Socket.IO enabled for real-time updates`);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to seed parking data:", err);
//     process.exit(1);
//   });
