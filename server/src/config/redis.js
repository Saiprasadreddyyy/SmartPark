import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 63712,  // double-check your port number
  tls: {},  // RedisLabs cloud requires TLS even without password
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export default redis;
