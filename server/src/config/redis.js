// server/config/redis.js
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

let redis;
let isRedisAvailable = false;

// Use REDIS_TOKEN first (has full connection string), fallback to REDIS_URL
const redisConnection = process.env.REDIS_TOKEN || process.env.REDIS_URL;

if (redisConnection) {
  console.log('🔗 Connecting to Redis...');
  
  redis = new Redis(redisConnection, {
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false, // Fail fast if Redis is down
    retryStrategy: (times) => {
      if (times > 3) {
        console.error('❌ Redis max retries reached');
        isRedisAvailable = false;
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: false,
    family: 4, // Force IPv4
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected successfully");
    isRedisAvailable = true;
  });

  redis.on("ready", () => {
    console.log("✅ Redis is ready to accept commands");
    isRedisAvailable = true;
  });

  redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
    isRedisAvailable = false;
    
    if (err.message.includes('NOAUTH')) {
      console.error('🔑 Redis authentication failed!');
      console.error('💡 Check your REDIS_TOKEN or REDIS_URL in environment variables');
      console.error('💡 Expected format: redis://default:PASSWORD@host:port');
    }
  });

  redis.on("close", () => {
    console.warn("⚠️ Redis connection closed");
    isRedisAvailable = false;
  });

  redis.on("reconnecting", () => {
    console.log("🔄 Redis reconnecting...");
  });
} else {
  console.warn('⚠️ No Redis configuration found (REDIS_TOKEN or REDIS_URL)');
  console.warn('⚠️ System will work with MongoDB only (slower performance)');
  
  // Create mock Redis client
  redis = createMockRedis();
}

// Mock Redis for fallback
function createMockRedis() {
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    zadd: async () => 1,
    zrem: async () => 1,
    zpopmin: async () => [],
    zcard: async () => 0,
    pipeline: () => ({
      zadd: () => {},
      zrem: () => {},
      del: () => {},
      exec: async () => []
    }),
    ping: async () => 'PONG',
    on: () => {},
    quit: async () => {},
  };
}

// Helper function to check if Redis is available
export function isRedisConnected() {
  return isRedisAvailable && redis.status === 'ready';
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (redis && redis.quit) {
    console.log('🔄 Closing Redis connection...');
    await redis.quit();
  }
});

export default redis;