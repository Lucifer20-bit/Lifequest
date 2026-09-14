import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuestsForGoal } from "@/lib/ai/quests";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goalId, goalTitle, pillarId } = body;

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let targetGoalTitle = goalTitle;
    let targetGoalDescription = "";
    let targetPillarId = pillarId;
    let targetPillarName = "General";

    if (goalId) {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { pillar: true },
      });
      if (goal) {
        targetGoalTitle = goal.title;
        targetGoalDescription = goal.description || "";
        targetPillarId = goal.pillarId;
        targetPillarName = goal.pillar.name;
      }
    } else if (pillarId) {
      const pillar = await prisma.lifePillar.findUnique({
        where: { id: pillarId },
      });
      if (pillar) {
        targetPillarName = pillar.name;
      }
    }

    if (!targetGoalTitle) {
      return NextResponse.json(
        { error: "Goal title is required for quest generation" },
        { status: 400 }
      );
    }

    // Call AI Quest decomposition engine
    const generatedQuests = await generateQuestsForGoal(
      targetGoalTitle,
      targetPillarName,
      targetGoalDescription
    );

    // Persist quests directly into database
    const createdQuests = [];
    for (const q of generatedQuests) {
      const created = await prisma.quest.create({
        data: {
          userId: user.id,
          goalId: goalId || null,
          pillarId: targetPillarId,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          estimatedMinutes: q.estimatedMinutes,
          xpReward: q.xpReward,
          skillTag: q.skillTag,
          isDaily: q.difficulty === "EASY" || q.difficulty === "MEDIUM",
          status: "PENDING",
        },
        include: {
          pillar: true,
          goal: true,
        },
      });
      createdQuests.push(created);
    }

    return NextResponse.json({
      success: true,
      quests: createdQuests,
      message: `Generated ${createdQuests.length} new quests from "${targetGoalTitle}"`,
    });
  } catch (error) {
    console.error("Error generating quests with AI:", error);
    return NextResponse.json(
      { error: "Failed to generate quests" },
      { status: 500 }
    );
  }
}
