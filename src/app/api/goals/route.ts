import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        pillar: true,
        quests: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pillars = await prisma.lifePillar.findMany();

    return NextResponse.json({ goals, pillars });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, pillarId, targetDate } = body;

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

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        pillarId,
        title,
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        progress: 0,
        status: "ACTIVE",
      },
      include: {
        pillar: true,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
