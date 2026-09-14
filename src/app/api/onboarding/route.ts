import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateQuestsForGoal } from "@/lib/ai/quests";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, archetype, primaryGoal, pillarSlug } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Find or create user
    const user = await prisma.user.upsert({
      where: { email: `${name.toLowerCase().replace(/\s+/g, "")}@lifequest.app` },
      update: {
        name,
        archetype: archetype || "Architect",
        avatar: (archetype || "architect").toLowerCase(),
      },
      create: {
        email: `${name.toLowerCase().replace(/\s+/g, "")}@lifequest.app`,
        name,
        archetype: archetype || "Architect",
        avatar: (archetype || "architect").toLowerCase(),
        level: 1,
        xp: 0,
        currentStreak: 1,
        lastActiveDate: today,
      },
    });

    // If initial goal provided, attach it
    if (primaryGoal) {
      const pillar = await prisma.lifePillar.findFirst({
        where: { slug: pillarSlug || "career" },
      });

      if (pillar) {
        const goal = await prisma.goal.create({
          data: {
            userId: user.id,
            pillarId: pillar.id,
            title: primaryGoal,
            description: "Onboarding starter goal.",
            progress: 0,
            status: "ACTIVE",
          },
        });

        // Auto-generate starter quests
        const starterQuests = await generateQuestsForGoal(
          primaryGoal,
          pillar.name
        );

        for (const q of starterQuests) {
          await prisma.quest.create({
            data: {
              userId: user.id,
              goalId: goal.id,
              pillarId: pillar.id,
              title: q.title,
              description: q.description,
              difficulty: q.difficulty,
              estimatedMinutes: q.estimatedMinutes,
              xpReward: q.xpReward,
              skillTag: q.skillTag,
              isDaily: true,
              status: "PENDING",
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
