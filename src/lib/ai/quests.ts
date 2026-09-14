import { GoogleGenAI } from "@google/genai";

export interface GeneratedQuestData {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  estimatedMinutes: number;
  xpReward: number;
  skillTag: string;
}

export async function generateQuestsForGoal(
  goalTitle: string,
  pillarName: string,
  goalDescription?: string
): Promise<GeneratedQuestData[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are the Quest Master AI in LIFEQUEST, a real-life RPG operating system.
The user has set the following real-life goal in the pillar "${pillarName}":
Goal: "${goalTitle}"
${goalDescription ? `Description: "${goalDescription}"` : ""}

Decompose this real-life goal into 3 practical, actionable, gamified quests:
1. One EASY quest (15-30 minutes, 50 XP, low friction, momentum builder)
2. One MEDIUM quest (30-60 minutes, 120 XP, core skill practice)
3. One HARD quest (90-180 minutes, 300 XP, significant project chunk or milestone)

Return ONLY valid JSON as an array of 3 objects with these exact keys:
[
  {
    "title": "Short punchy quest name",
    "description": "Clear step-by-step actionable instruction",
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "estimatedMinutes": number,
    "xpReward": number,
    "skillTag": "Short skill label (e.g. TypeScript, Deep Work, Endurance)"
  }
]
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text) as GeneratedQuestData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini API quest generation fallback triggered:", err);
    }
  }

  // Intelligent Procedural Fallback Engine
  return generateProceduralQuests(goalTitle, pillarName);
}

function generateProceduralQuests(
  goalTitle: string,
  pillarName: string
): GeneratedQuestData[] {
  const normalized = goalTitle.toLowerCase();

  if (normalized.includes("code") || normalized.includes("javascript") || normalized.includes("next") || normalized.includes("web") || normalized.includes("app") || pillarName.toLowerCase().includes("career")) {
    return [
      {
        title: `Setup environment & define spec for ${goalTitle.slice(0, 24)}`,
        description: "Initialize the repository or module, sketch the feature components, and write the first test or component outline.",
        difficulty: "EASY",
        estimatedMinutes: 25,
        xpReward: 50,
        skillTag: "Architecture",
      },
      {
        title: `Implement core functionality for ${goalTitle.slice(0, 24)}`,
        description: "Complete 45 minutes of focused, distraction-free coding on the primary logic.",
        difficulty: "MEDIUM",
        estimatedMinutes: 45,
        xpReward: 120,
        skillTag: "Full-Stack",
      },
      {
        title: `Ship and test first working prototype`,
        description: "Verify responsive layout, handle edge cases, and commit clean, documented code.",
        difficulty: "HARD",
        estimatedMinutes: 120,
        xpReward: 300,
        skillTag: "Craftsmanship",
      },
    ];
  }

  if (normalized.includes("fitness") || normalized.includes("run") || normalized.includes("exercise") || normalized.includes("gym") || pillarName.toLowerCase().includes("fitness")) {
    return [
      {
        title: "Dynamic warmup & mobility drill",
        description: "15 minutes of joint mobilization, stretching, and deep breathing.",
        difficulty: "EASY",
        estimatedMinutes: 15,
        xpReward: 50,
        skillTag: "Mobility",
      },
      {
        title: "High-intensity endurance session",
        description: "Complete 35 minutes of steady cardio or strength training intervals.",
        difficulty: "MEDIUM",
        estimatedMinutes: 35,
        xpReward: 120,
        skillTag: "Stamina",
      },
      {
        title: "Personal record challenge",
        description: "Push past previous limit: add +5% weight or an extra interval set.",
        difficulty: "HARD",
        estimatedMinutes: 60,
        xpReward: 300,
        skillTag: "Peak Power",
      },
    ];
  }

  if (normalized.includes("read") || normalized.includes("book") || normalized.includes("learn") || pillarName.toLowerCase().includes("knowledge")) {
    return [
      {
        title: "Read 10 pages with active note-taking",
        description: "Focus on comprehension without looking at your phone. Highlight core principles.",
        difficulty: "EASY",
        estimatedMinutes: 20,
        xpReward: 50,
        skillTag: "Focus",
      },
      {
        title: "Synthesize 3 actionable takeaways",
        description: "Write down 3 concrete mental models or applications from today's study in your personal notebook.",
        difficulty: "MEDIUM",
        estimatedMinutes: 40,
        xpReward: 120,
        skillTag: "Synthesis",
      },
      {
        title: "Teach or apply a newly learned concept",
        description: "Explain the idea in simple terms or apply it directly to a problem you are facing.",
        difficulty: "HARD",
        estimatedMinutes: 90,
        xpReward: 300,
        skillTag: "Mastery",
      },
    ];
  }

  // Default fallback for any goal
  return [
    {
      title: `Sprint kickoff for: ${goalTitle.slice(0, 30)}`,
      description: "Spend 20 minutes clearing your workspace, gathering resources, and executing the immediate first step.",
      difficulty: "EASY",
      estimatedMinutes: 20,
      xpReward: 50,
      skillTag: "Discipline",
    },
    {
      title: `45-Minute Deep Focus block`,
      description: "Eliminate all notifications and make tangible progress on the core milestone.",
      difficulty: "MEDIUM",
      estimatedMinutes: 45,
      xpReward: 120,
      skillTag: "Deep Work",
    },
    {
      title: `Major breakthrough checkpoint`,
      description: "Review work completed, solve bottlenecks, and record your accomplishment.",
      difficulty: "HARD",
      estimatedMinutes: 90,
      xpReward: 300,
      skillTag: "Execution",
    },
  ];
}
