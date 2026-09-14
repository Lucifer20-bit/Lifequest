import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateXpGain, calculateNewStreak } from "@/lib/xp/engine";
import { evaluateAchievements } from "@/lib/achievements/checker";

export async function POST(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    const quest = await prisma.quest.findUnique({
      where: { id },
      include: {
        user: true,
        goal: true,
        pillar: true,
      },
    });

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    if (quest.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Quest is already completed" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const user = quest.user;

    // 1. Calculate XP and Level progression
    const progress = calculateXpGain(user.level, user.xp, quest.xpReward);

    // 2. Calculate Streak
    const { newStreak } = calculateNewStreak(user.lastActiveDate, user.currentStreak);

    // 3. Update Quest status
    const updatedQuest = await prisma.quest.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        pillar: true,
        goal: true,
      },
    });

    // 4. Update User stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        level: progress.currentLevel,
        xp: progress.currentXp,
        currentStreak: newStreak,
        lastActiveDate: today,
      },
    });

    // 5. Record XP History
    await prisma.xpHistory.create({
      data: {
        userId: user.id,
        amount: quest.xpReward,
        source: "QUEST_COMPLETED",
        questId: quest.id,
      },
    });

    // 6. Increment goal progress if linked
    if (quest.goalId) {
      const increment = quest.difficulty === "HARD" || quest.difficulty === "EPIC" ? 15 : 5;
      await prisma.goal.update({
        where: { id: quest.goalId },
        data: {
          progress: Math.min(100, (quest.goal?.progress || 0) + increment),
        },
      });
    }

    // 7. Check for unlocked achievements
    const newlyUnlockedAchievements = await evaluateAchievements(
      user.id,
      progress.currentLevel,
      newStreak,
      quest.id
    );

    return NextResponse.json({
      success: true,
      quest: updatedQuest,
      user: {
        id: updatedUser.id,
        level: updatedUser.level,
        xp: updatedUser.xp,
        xpNeeded: progress.xpNeeded,
        xpPercentage: progress.percentage,
        currentStreak: updatedUser.currentStreak,
      },
      leveledUp: progress.leveledUp,
      newLevel: progress.newLevel,
      xpGained: quest.xpReward,
      newlyUnlockedAchievements,
    });
  } catch (error) {
    console.error("Error completing quest:", error);
    return NextResponse.json(
      { error: "Failed to complete quest" },
      { status: 500 }
    );
  }
}
