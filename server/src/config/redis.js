// server/config/redis.js
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

let redis;
let isRedisAvailable = false;

// Clean and validate Redis connection string
function getRedisConnection() {
  let connection = process.env.REDIS_TOKEN || process.env.REDIS_URL;
  
  if (!connection) {
    return null;
  }
  
  // Remove any whitespace and URL-encoded characters
  connection = connection.trim();
  
  // Remove any command flags that might have been accidentally copied
  connection = connection.replace(/\s+--tls.*$/gi, '').trim();
  connection = connection.replace(/\s+-u\s+/gi, '').trim();
  
  // Validate the URL format
  if (!connection.startsWith('redis://') && !connection.startsWith('rediss://')) {
    console.error('❌ Invalid Redis URL format. Must start with redis:// or rediss://');
    return null;
  }
  
  return connection;
}

const redisConnection = getRedisConnection();

if (redisConnection) {
  console.log('🔗 Connecting to Redis...');
  
  // Determine if we need TLS based on URL scheme
  const useTLS = redisConnection.startsWith('rediss://');
  
  const redisConfig = {
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error('❌ Redis max retries reached');
        isRedisAvailable = false;
        return null;
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true, // Changed to true - connect manually after setup
    family: 4,
  };
  
  // Add TLS config only if using rediss://
  if (useTLS) {
    redisConfig.tls = {
      rejectUnauthorized: false // Upstash requires this
    };
  }
  
  redis = new Redis(redisConnection, redisConfig);

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
    } else if (err.message.includes('ENOENT')) {
      console.error('🔧 Invalid Redis connection string detected');
      console.error('💡 Check for extra characters or spaces in your Redis URL');
    }
  });

  redis.on("close", () => {
    console.warn("⚠️ Redis connection closed");
    isRedisAvailable = false;
  });

  redis.on("reconnecting", () => {
    console.log("🔄 Redis reconnecting...");
  });
  
  // Attempt connection
  redis.connect().catch(err => {
    console.error('❌ Failed to connect to Redis:', err.message);
    console.log('⚠️ Continuing without Redis - using MongoDB fallback');
    isRedisAvailable = false;
  });
} else {
  console.warn('⚠️ No Redis configuration found (REDIS_TOKEN or REDIS_URL)');
  console.warn('⚠️ System will work with MongoDB only (slower performance)');
  
  // Create mock Redis client
  redis = createMockRedis();
}

// Mock Redis for fallback
function createMockRedis() {
  isRedisAvailable = false;
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    zadd: async () => 1,
    zrem: async () => {},
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
    connect: async () => {},
    status: 'mock'
  };
}

// Helper function to check if Redis is available
export function isRedisConnected() {
  return isRedisAvailable && redis.status === 'ready';
}

// Safe ping that won't throw if Redis is unavailable
export async function pingRedis() {
  if (!redis || redis.status === 'mock') {
    return false;
  }
  
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('❌ Redis ping failed:', error.message);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (redis && redis.quit && redis.status !== 'mock') {
    console.log('🔄 Closing Redis connection...');
    try {
      await redis.quit();
    } catch (err) {
      console.error('Error closing Redis:', err.message);
    }
  }
});

export default redis;