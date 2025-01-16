import redisClient from '../config/redisClient';

/**
 * Set a value in the Redis cache with an optional expiration time.
 * @param key - The cache key.
 * @param value - The value to store.
 * @param expireInSeconds - Expiration time in seconds (optional).
 */
export const setCache = async (key: string, value: string, expireInSeconds?: number): Promise<void> => {
  try {
    await redisClient.set(key, value);
    if (expireInSeconds) {
      await redisClient.expire(key, expireInSeconds);
    }
  } catch (err) {
    console.error(`Error setting cache for key "${key}":`, err);
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
    console.error(`Error getting cache for key "${key}":`, err);
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
    console.error(`Error deleting cache for key "${key}":`, err);
  }
};
