import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getXpRequiredForLevel } from "@/lib/xp/engine";

export async function GET() {
  try {
    // For V1 MVP, use Uche or primary user
    let user = await prisma.user.findFirst({
      include: {
        goals: {
          include: {
            pillar: true,
            quests: true,
          },
        },
        quests: {
          include: {
            pillar: true,
          },
          orderBy: { createdAt: "desc" },
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: "desc" },
        },
        xpHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const xpNeeded = getXpRequiredForLevel(user.level);
    const xpPercentage = Math.min(100, Math.round((user.xp / xpNeeded) * 100));

    // Calculate Life Pillar metrics
    const pillars = await prisma.lifePillar.findMany({
      include: {
        goals: { where: { userId: user.id } },
        quests: { where: { userId: user.id } },
      },
    });

    const pillarStats = pillars.map((p) => {
      const completed = p.quests.filter((q) => q.status === "COMPLETED").length;
      const total = p.quests.length;
      // Derived progress from goals or quests
      const avgGoalProgress =
        p.goals.length > 0
          ? Math.round(
              p.goals.reduce((acc, g) => acc + g.progress, 0) / p.goals.length
            )
          : total > 0
          ? Math.round((completed / total) * 100)
          : 30;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        icon: p.icon,
        color: p.color,
        description: p.description,
        progress: avgGoalProgress,
        goalsCount: p.goals.length,
        questsCount: total,
        completedQuestsCount: completed,
      };
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        archetype: user.archetype,
        level: user.level,
        xp: user.xp,
        xpNeeded,
        xpPercentage,
        currentStreak: user.currentStreak,
        lastActiveDate: user.lastActiveDate,
      },
      pillars: pillarStats,
      achievements: user.achievements.map((ua) => ({
        id: ua.achievement.id,
        code: ua.achievement.code,
        title: ua.achievement.title,
        description: ua.achievement.description,
        badgeIcon: ua.achievement.badgeIcon,
        xpBonus: ua.achievement.xpBonus,
        unlockedAt: ua.unlockedAt,
      })),
      recentXp: user.xpHistory,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
