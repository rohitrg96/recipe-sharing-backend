import { createClient } from 'redis';

/**
 * Initialize and configure the Redis client.
 */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Handle connection events
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

// Connect to Redis server
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

export default redisClient;
