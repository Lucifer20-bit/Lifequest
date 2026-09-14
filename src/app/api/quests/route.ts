import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DIFFICULTY_CONFIG } from "@/lib/xp/engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "daily" | "all" | pillarSlug

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whereClause: Record<string, unknown> = {
      userId: user.id,
    };

    if (filter === "daily") {
      whereClause.isDaily = true;
    } else if (filter && filter !== "all") {
      whereClause.pillar = { slug: filter };
    }

    const quests = await prisma.quest.findMany({
      where: whereClause,
      include: {
        pillar: true,
        goal: true,
      },
      orderBy: [
        { status: "asc" }, // PENDING first, then COMPLETED
        { createdAt: "desc" },
      ],
    });

    const pendingDaily = quests.filter(
      (q) => q.isDaily && q.status === "PENDING"
    );
    const availableXp = pendingDaily.reduce((acc, q) => acc + q.xpReward, 0);

    return NextResponse.json({
      quests,
      availableXp,
      pendingCount: pendingDaily.length,
    });
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, pillarId, goalId, difficulty, estimatedMinutes } =
      body;

    if (!title || !pillarId) {
      return NextResponse.json(
        { error: "Title and Life Pillar are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const diff = difficulty || "MEDIUM";
    const xpReward = DIFFICULTY_CONFIG[diff]?.defaultXp || 120;

    const quest = await prisma.quest.create({
      data: {
        userId: user.id,
        title,
        description: description || "Complete this quest to earn XP and level up.",
        pillarId,
        goalId: goalId || null,
        difficulty: diff,
        estimatedMinutes: estimatedMinutes || 30,
        xpReward,
        skillTag: "Focus",
        isDaily: true,
        status: "PENDING",
      },
      include: {
        pillar: true,
        goal: true,
      },
    });

    return NextResponse.json({ quest }, { status: 201 });
  } catch (error) {
    console.error("Error creating quest:", error);
    return NextResponse.json(
      { error: "Failed to create quest" },
      { status: 500 }
    );
  }
}
