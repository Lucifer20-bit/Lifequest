import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateContextualAdvice } from "@/lib/ai/coach";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const advice = await generateContextualAdvice(user.id);
    return NextResponse.json({ advice });
  } catch (error) {
    console.error("Error fetching AI coach advice:", error);
    return NextResponse.json(
      { error: "Failed to generate AI advice" },
      { status: 500 }
    );
  }
}
