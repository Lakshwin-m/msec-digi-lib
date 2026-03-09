/**
 * Gamification utility functions for leveling and XP
 */

export const XP_PER_LEVEL = 500;

/**
 * Calculates user level based on total points (XP)
 */
export const calculateLevel = (points: number = 0): number => {
  return Math.floor(points / XP_PER_LEVEL) + 1;
};

/**
 * Calculates progress percentage towards the next level
 */
export const calculateLevelProgress = (points: number = 0): number => {
  const currentLevelXP = (calculateLevel(points) - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = points - currentLevelXP;
  return Math.min(Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100), 100);
};

/**
 * Gets XP remaining for the next level
 */
export const getXPForNextLevel = (points: number = 0): number => {
  const nextLevel = calculateLevel(points) + 1;
  const totalXPRequired = (nextLevel - 1) * XP_PER_LEVEL;
  return totalXPRequired - points;
};
