// A simple in-memory cache for storing server-side timestamps.
// Note: This cache is not persistent and will be cleared on server restart.
// For a production application, a more robust solution like Redis would be preferable.

interface TimestampCache {
  [key: string]: number; // key: userId, value: timestamp (milliseconds)
}

const userUpdateTimestamps: TimestampCache = {};

const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

/**
 * Checks if a user's game state can be updated based on the last update time.
 * @param userId The ID of the user.
 * @returns {boolean} `true` if the user should be updated, `false` otherwise.
 */
export function shouldUpdateUserState(userId: string): boolean {
  const now = Date.now();
  const lastUpdate = userUpdateTimestamps[userId];

  if (!lastUpdate || now - lastUpdate > CACHE_DURATION_MS) {
    return true;
  }

  return false;
}

/**
 * Records that a user's game state has just been updated.
 * @param userId The ID of the user.
 */
export function recordUserStateUpdate(userId: string): void {
  userUpdateTimestamps[userId] = Date.now();
}
