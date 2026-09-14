import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

export interface CoachAdvice {
  headline: string;
  message: string;
  suggestedAction: string;
  targetGoalId?: string;
  urgent: boolean;
}

export async function generateContextualAdvice(userId: string): Promise<CoachAdvice> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      goals: { include: { pillar: true, quests: true } },
      quests: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { pillar: true },
      },
      achievements: { include: { achievement: true } },
    },
  });

  if (!user) {
    return {
      headline: "Welcome to LifeQuest",
      message: "Ready your mind and choose your first real-world quest.",
      suggestedAction: "View Quests",
      urgent: false,
    };
  }

  // Check for neglected goals (active goals with no quests completed recently)
  const completedQuestGoalIds = new Set(
    user.quests
      .filter((q) => q.status === "COMPLETED" && q.goalId)
      .map((q) => q.goalId)
  );

  const neglectedGoal = user.goals.find(
    (g) => g.status === "ACTIVE" && (!completedQuestGoalIds.has(g.id) || g.progress < 75)
  );

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contextSummary = {
        name: user.name,
        level: user.level,
        currentStreak: user.currentStreak,
        archetype: user.archetype,
        goals: user.goals.map((g) => ({ title: g.title, pillar: g.pillar.name, progress: g.progress })),
        pendingQuests: user.quests.filter((q) => q.status === "PENDING").map((q) => q.title),
        neglectedGoal: neglectedGoal ? neglectedGoal.title : null,
      };

      const prompt = `
You are the personal RPG Life Coach in LIFEQUEST.
The user's context:
${JSON.stringify(contextSummary, null, 2)}

Provide a sharp, encouraging, context-aware 2-sentence advice.
If there is a neglected goal, remind them directly (e.g. "You haven't worked on your JavaScript goal for four days. You only need 30 minutes today to keep your weekly target.").
Respond in JSON:
{
  "headline": "Short title (e.g. Tactical Advisory or Momentum Alert)",
  "message": "The 2-sentence context-aware message",
  "suggestedAction": "Button label (e.g. Start 30m Quest)",
  "urgent": true/false
}
`;

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const text = res.text?.trim();
      if (text) {
        const parsed = JSON.parse(text) as CoachAdvice;
        return {
          ...parsed,
          targetGoalId: neglectedGoal?.id,
        };
      }
    } catch (e) {
      console.warn("AI Coach Gemini call fallback:", e);
    }
  }

  // Fallback tailored context-aware coaching logic
  if (neglectedGoal) {
    return {
      headline: "Tactical Advisory",
      message: `You haven't completed a quest for "${neglectedGoal.title}" recently. You only need 30 minutes today to keep your weekly target on track.`,
      suggestedAction: "Focus on this Goal",
      targetGoalId: neglectedGoal.id,
      urgent: true,
    };
  }

  return {
    headline: "Momentum High",
    message: `You're on a ${user.currentStreak}-day streak! Clear today's daily quest log to push toward Level ${user.level + 1}.`,
    suggestedAction: "Review Daily Quests",
    urgent: false,
  };
}
