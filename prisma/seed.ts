import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LIFEQUEST database...");

  // 1. Seed Life Pillars
  const pillars = [
    {
      slug: "career",
      name: "Career & Craft",
      icon: "Laptop",
      color: "#3B82F6",
      description: "Master technical skills, build real projects, and advance professionally.",
    },
    {
      slug: "finance",
      name: "Wealth & Finance",
      icon: "Coins",
      color: "#10B981",
      description: "Budgeting, investing, emergency funds, and financial freedom.",
    },
    {
      slug: "knowledge",
      name: "Knowledge & Mind",
      icon: "Brain",
      color: "#8B5CF6",
      description: "Deep reading, philosophy, system thinking, and mental clarity.",
    },
    {
      slug: "fitness",
      name: "Fitness & Health",
      icon: "Dumbbell",
      color: "#EF4444",
      description: "Physical strength, endurance, nutrition, and restorative sleep.",
    },
    {
      slug: "social",
      name: "Social & Community",
      icon: "Users",
      color: "#F59E0B",
      description: "Meaningful friendships, family bonds, networking, and giving back.",
    },
  ];

  const pillarMap = new Map<string, string>();
  for (const p of pillars) {
    const record = await prisma.lifePillar.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    pillarMap.set(p.slug, record.id);
  }

  // 2. Seed Achievements
  const achievements = [
    {
      code: "FIRST_BLOOD",
      title: "First Blood",
      description: "Completed your first real-world quest.",
      badgeIcon: "Sword",
      xpBonus: 100,
      category: "PROGRESSION",
    },
    {
      code: "BUILDER_INIT",
      title: "The Builder",
      description: "Shipped your first functional project or code module.",
      badgeIcon: "Hammer",
      xpBonus: 250,
      category: "CAREER",
    },
    {
      code: "STREAK_3",
      title: "Momentum Spark",
      description: "Maintained a 3-day active quest streak.",
      badgeIcon: "Flame",
      xpBonus: 150,
      category: "DISCIPLINE",
    },
    {
      code: "STREAK_7",
      title: "Relentless Focus",
      description: "Kept the fire burning for 7 consecutive days.",
      badgeIcon: "Zap",
      xpBonus: 350,
      category: "DISCIPLINE",
    },
    {
      code: "LEVEL_5",
      title: "Seasoned Adventurer",
      description: "Reached Character Level 5 in the real world.",
      badgeIcon: "Crown",
      xpBonus: 500,
      category: "PROGRESSION",
    },
    {
      code: "MINDFUL_SCHOLAR",
      title: "Sage of Knowledge",
      description: "Completed 3 deep learning and book study quests.",
      badgeIcon: "BookOpen",
      xpBonus: 200,
      category: "KNOWLEDGE",
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: a,
      create: a,
    });
  }

  // 3. Seed Default User (Uche - matching prompt mockups)
  const today = new Date().toISOString().split("T")[0];
  const user = await prisma.user.upsert({
    where: { email: "uche@lifequest.app" },
    update: {},
    create: {
      email: "uche@lifequest.app",
      name: "Uche",
      avatar: "architect",
      archetype: "Architect",
      level: 7,
      xp: 390, // 390 / 500 XP = 78% (matches prompt: LEVEL 7, 78%!)
      currentStreak: 12, // 12 DAY STREAK (matches prompt!)
      lastActiveDate: today,
    },
  });

  // 4. Seed Initial Goals for Uche
  const careerPillarId = pillarMap.get("career")!;
  const fitnessPillarId = pillarMap.get("fitness")!;
  const knowledgePillarId = pillarMap.get("knowledge")!;
  const financePillarId = pillarMap.get("finance")!;
  const socialPillarId = pillarMap.get("social")!;

  const goals = [
    {
      userId: user.id,
      pillarId: careerPillarId,
      title: "Master Full-Stack JavaScript & Next.js",
      description: "Build production-ready web apps, learn modern architecture, and deploy portfolio products.",
      progress: 70,
    },
    {
      userId: user.id,
      pillarId: fitnessPillarId,
      title: "Consistent Calisthenics & Cardio",
      description: "Exercise 4 times per week to build core strength and endurance.",
      progress: 50,
    },
    {
      userId: user.id,
      pillarId: knowledgePillarId,
      title: "Daily 30-minute Deep Reading",
      description: "Read books on systems thinking, psychology, and software engineering.",
      progress: 60,
    },
    {
      userId: user.id,
      pillarId: financePillarId,
      title: "Build 6-Month Emergency Reserve",
      description: "Automate monthly savings and track recurring expenses.",
      progress: 40,
    },
    {
      userId: user.id,
      pillarId: socialPillarId,
      title: "Deepen Friendships & Network",
      description: "Connect with one peer or mentor weekly.",
      progress: 70,
    },
  ];

  for (const g of goals) {
    const existing = await prisma.goal.findFirst({
      where: { userId: user.id, title: g.title },
    });
    if (!existing) {
      await prisma.goal.create({ data: g });
    }
  }

  // 5. Seed Quests for today (matching prompt: Study 30 mins, Exercise, Work on project = +180 XP available!)
  const webGoal = await prisma.goal.findFirst({
    where: { userId: user.id, title: "Master Full-Stack JavaScript & Next.js" },
  });
  const fitnessGoal = await prisma.goal.findFirst({
    where: { userId: user.id, title: "Consistent Calisthenics & Cardio" },
  });
  const readingGoal = await prisma.goal.findFirst({
    where: { userId: user.id, title: "Daily 30-minute Deep Reading" },
  });

  const dailyQuests = [
    {
      userId: user.id,
      goalId: readingGoal?.id,
      pillarId: knowledgePillarId,
      title: "Study 30 minutes",
      description: "Engage in focused reading with zero phone distractions. Take 3 key bullet takeaways.",
      difficulty: "EASY",
      estimatedMinutes: 30,
      xpReward: 50,
      skillTag: "Deep Focus",
      status: "PENDING",
      isDaily: true,
    },
    {
      userId: user.id,
      goalId: fitnessGoal?.id,
      pillarId: fitnessPillarId,
      title: "Exercise & Mobility",
      description: "Complete 20 minutes of bodyweight circuits or a brisk run.",
      difficulty: "EASY",
      estimatedMinutes: 25,
      xpReward: 50,
      skillTag: "Vitality",
      status: "PENDING",
      isDaily: true,
    },
    {
      userId: user.id,
      goalId: webGoal?.id,
      pillarId: careerPillarId,
      title: "Work on your project",
      description: "Code the next feature in your portfolio app. Commit clean code.",
      difficulty: "MEDIUM",
      estimatedMinutes: 45,
      xpReward: 80,
      skillTag: "Full-Stack",
      status: "PENDING",
      isDaily: true,
    },
    {
      userId: user.id,
      goalId: webGoal?.id,
      pillarId: careerPillarId,
      title: "Build your first website",
      description: "Assemble responsive layout components, connect interactive state, and deploy a live preview.",
      difficulty: "HARD",
      estimatedMinutes: 300,
      xpReward: 500,
      skillTag: "Web Craft",
      status: "PENDING",
      isDaily: false,
    },
  ];

  for (const q of dailyQuests) {
    const existing = await prisma.quest.findFirst({
      where: { userId: user.id, title: q.title },
    });
    if (!existing) {
      await prisma.quest.create({ data: q });
    }
  }

  // 6. Give user initial achievements
  const firstBlood = await prisma.achievement.findUnique({ where: { code: "FIRST_BLOOD" } });
  const streak3 = await prisma.achievement.findUnique({ where: { code: "STREAK_3" } });
  const builder = await prisma.achievement.findUnique({ where: { code: "BUILDER_INIT" } });

  if (firstBlood) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: user.id, achievementId: firstBlood.id } },
      update: {},
      create: { userId: user.id, achievementId: firstBlood.id },
    });
  }
  if (streak3) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: user.id, achievementId: streak3.id } },
      update: {},
      create: { userId: user.id, achievementId: streak3.id },
    });
  }
  if (builder) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: user.id, achievementId: builder.id } },
      update: {},
      create: { userId: user.id, achievementId: builder.id },
    });
  }

  console.log("LIFEQUEST database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
