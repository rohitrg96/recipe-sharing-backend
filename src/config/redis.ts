import { createClient } from 'redis';
import logger from './logger';

/**
 * Initialize and configure the Redis client.
 */
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Handle connection events
redisClient.on('connect', () => {
  logger.info('Successfully connected to Redis database.');
});

redisClient.on('error', (err) => {
  logger.error('Failed to connect to Redis database: ', err);
});

// Connect to Redis server
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error('Failed to connect to Redis:', err);
  }
})();

export default redisClient;
