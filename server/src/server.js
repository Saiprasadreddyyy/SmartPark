import http from 'http';
import app from './app.js';
import connectDB from './config/mongodb.js';
import { initializeSocketIO } from './components/sockets/parking.socket.js';
import { seedParking } from './data/seedParking.js';
import dotenv from "dotenv";

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

initializeSocketIO(server);

const startServer = async () => {
  try {
    await connectDB();
    
    await seedParking();
    dotenv.config();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO enabled for real-time updates`);
      console.log(`API available at http://localhost:${PORT}/api/parking`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
