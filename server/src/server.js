import dotenv from "dotenv";
dotenv.config();

import http from 'http';
import app from './app.js';
import connectDB from './config/mongodb.js';
import { initializeSocketIO } from './components/sockets/parking.socket.js';
import { seedParking } from './data/seedParking.js';
import { pingRedis } from './config/redis.js';

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

// Initialize socket.io
initializeSocketIO(server);

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check Redis connection (non-blocking)
    console.log('Checking Redis connection…');
    const redisConnected = await pingRedis();
    
    if (redisConnected) {
      console.log('✅ Redis is operational');
    } else {
      console.log('⚠️ Redis not available - using MongoDB fallback');
    }
    
    // Seed parking data
    await seedParking();

    // Start server regardless of Redis status
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO enabled for real-time updates`);
      console.log(`🌐 API URL: ${process.env.NODE_ENV === 'production' ? 'https://smartpark-tl0l.onrender.com' : `http://localhost:${PORT}`}/api/parking`);
      console.log(`✅ System ready - ${redisConnected ? 'with Redis caching' : 'MongoDB only mode'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();