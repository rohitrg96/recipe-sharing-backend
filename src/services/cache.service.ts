import logger from '../config/logger';
import redisClient from '../config/redis';

/**
 * Set a value in the Redis cache with an optional expiration time.
 * @param key - The cache key.
 * @param value - The value to store.
 * @param expireInSeconds - Expiration time in seconds (optional).
 */
export const setCache = async (
  key: string,
  value: string,
  expireInSeconds?: number,
): Promise<void> => {
  try {
    await redisClient.set(key, value);
    if (expireInSeconds) {
      await redisClient.expire(key, expireInSeconds);
    }
  } catch (err) {
    logger.error(`Error setting cache for key "${key}":`, err);
  }
};

/**
 * Retrieve a value from the Redis cache by key.
 * @param key - The cache key.
 * @returns The cached value, or null if the key does not exist.
 */
export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (err) {
    logger.error(`Error getting cache for key "${key}":`, err);
    return null;
  }
};

/**
 * Delete a specific key from the Redis cache.
 * @param key - The cache key to delete.
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.error(`Error deleting cache for key "${key}":`, err);
  }
};
