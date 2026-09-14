import { prisma } from "@/lib/db";

export interface UnlockedAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  xpBonus: number;
}

export async function evaluateAchievements(
  userId: string,
  newLevel: number,
  newStreak: number,
  justCompletedQuestId?: string
): Promise<UnlockedAchievement[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: { include: { achievement: true } },
      quests: { where: { status: "COMPLETED" }, include: { pillar: true } },
    },
  });

  if (!user) return [];

  const alreadyUnlockedCodes = new Set(
    user.achievements.map((ua) => ua.achievement.code)
  );

  const completedQuestsCount = user.quests.length;
  const completedCareerQuests = user.quests.filter(
    (q) => q.pillar.slug === "career"
  ).length;
  const completedKnowledgeQuests = user.quests.filter(
    (q) => q.pillar.slug === "knowledge"
  ).length;

  const newlyUnlocked: UnlockedAchievement[] = [];

  const allAchievements = await prisma.achievement.findMany();

  for (const ach of allAchievements) {
    if (alreadyUnlockedCodes.has(ach.code)) continue;

    let qualifies = false;

    if (ach.code === "FIRST_BLOOD" && completedQuestsCount >= 1) {
      qualifies = true;
    } else if (ach.code === "BUILDER_INIT" && completedCareerQuests >= 1) {
      qualifies = true;
    } else if (ach.code === "STREAK_3" && newStreak >= 3) {
      qualifies = true;
    } else if (ach.code === "STREAK_7" && newStreak >= 7) {
      qualifies = true;
    } else if (ach.code === "LEVEL_5" && newLevel >= 5) {
      qualifies = true;
    } else if (ach.code === "MINDFUL_SCHOLAR" && completedKnowledgeQuests >= 3) {
      qualifies = true;
    }

    if (qualifies) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
        },
      });

      // Award achievement XP bonus
      if (ach.xpBonus > 0) {
        await prisma.xpHistory.create({
          data: {
            userId,
            amount: ach.xpBonus,
            source: "ACHIEVEMENT_BONUS",
            questId: justCompletedQuestId,
          },
        });
      }

      newlyUnlocked.push({
        id: ach.id,
        code: ach.code,
        title: ach.title,
        description: ach.description,
        badgeIcon: ach.badgeIcon,
        xpBonus: ach.xpBonus,
      });
    }
  }

  return newlyUnlocked;
}
