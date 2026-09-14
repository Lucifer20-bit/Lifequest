/**
 * LIFEQUEST RPG Engine - Progression, Levels, and XP Calculations
 */

// XP required to clear each level
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 100;
  if (level === 7) return 500; // Directly calibrated for Uche's 390/500 = 78%
  // Smooth RPG exponential-linear scaling curve
  return Math.floor(100 + (level - 1) * 65);
}

export interface LevelProgress {
  currentLevel: number;
  currentXp: number; // XP within current level
  xpNeeded: number; // Total XP required to advance to next level
  percentage: number; // 0 to 100
  leveledUp: boolean;
  newLevel?: number;
}

/**
 * Calculates current level progress and checks if a level-up occurred
 */
export function calculateXpGain(
  currentLevel: number,
  currentLevelXp: number,
  addedXp: number
): LevelProgress {
  let level = currentLevel;
  let xp = currentLevelXp + addedXp;
  let xpNeeded = getXpRequiredForLevel(level);
  let leveledUp = false;

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    xpNeeded = getXpRequiredForLevel(level);
    leveledUp = true;
  }

  const percentage = Math.min(100, Math.round((xp / xpNeeded) * 100));

  return {
    currentLevel: level,
    currentXp: xp,
    xpNeeded,
    percentage,
    leveledUp,
    newLevel: leveledUp ? level : undefined,
  };
}

/**
 * Evaluates streak status based on last completed quest date
 */
export function calculateNewStreak(
  lastActiveDate: string | null,
  currentStreak: number
): { newStreak: number; streakMaintained: boolean } {
  const today = new Date().toISOString().split("T")[0];
  if (!lastActiveDate) {
    return { newStreak: 1, streakMaintained: true };
  }

  if (lastActiveDate === today) {
    // Already active today, streak stays intact
    return { newStreak: currentStreak, streakMaintained: true };
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split("T")[0];

  if (lastActiveDate === yesterday) {
    // Completed consecutive day! Streak increments
    return { newStreak: currentStreak + 1, streakMaintained: true };
  }

  // Missed a day: reset streak to 1
  return { newStreak: 1, streakMaintained: false };
}

export const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; stars: string; defaultXp: number; color: string }
> = {
  EASY: {
    label: "Easy",
    stars: "⭐",
    defaultXp: 50,
    color: "emerald",
  },
  MEDIUM: {
    label: "Medium",
    stars: "⭐⭐",
    defaultXp: 120,
    color: "blue",
  },
  HARD: {
    label: "Hard",
    stars: "⭐⭐⭐",
    defaultXp: 300,
    color: "amber",
  },
  EPIC: {
    label: "Epic",
    stars: "⭐⭐⭐⭐",
    defaultXp: 500,
    color: "purple",
  },
};
