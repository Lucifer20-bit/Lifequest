"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CharacterHUD } from "@/components/CharacterHUD";
import { AICoachBanner } from "@/components/AICoachBanner";
import { LifeMapSection, PillarStat } from "@/components/LifeMapSection";
import { QuestCard, QuestData } from "@/components/QuestCard";
import { LevelUpModal } from "@/components/LevelUpModal";
import {
  AchievementUnlockedToast,
  ToastAchievement,
} from "@/components/AchievementUnlockedToast";
import { AIQuestGenModal } from "@/components/AIQuestGenModal";
import { Swords, Plus, Sparkles, Filter, ChevronRight, Award } from "lucide-react";

export default function HomePage() {
  const [userData, setUserData] = useState<any>(null);
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [pillars, setPillars] = useState<PillarStat[]>([]);
  const [availableXp, setAvailableXp] = useState(180);
  const [loading, setLoading] = useState(true);

  // Modals & Celebrations
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(8);
  const [latestAchievement, setLatestAchievement] =
    useState<ToastAchievement | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedGoalIdForAi, setSelectedGoalIdForAi] = useState<string | undefined>();

  const loadData = async () => {
    try {
      setLoading(true);
      const [userRes, questsRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/quests"),
      ]);

      const uData = await userRes.json();
      const qData = await questsRes.json();

      if (uData.user) {
        setUserData(uData.user);
        setPillars(uData.pillars || []);
      }
      if (qData.quests) {
        setQuests(qData.quests);
        setAvailableXp(qData.availableXp || 0);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuestComplete = (completedQuest: QuestData, result: any) => {
    // Update local quest state
    setQuests((prev) =>
      prev.map((q) =>
        q.id === completedQuest.id ? { ...q, status: "COMPLETED" } : q
      )
    );

    // Update user HUD stats
    if (result.user) {
      setUserData((prev: any) => ({
        ...prev,
        level: result.user.level,
        xp: result.user.xp,
        xpNeeded: result.user.xpNeeded,
        xpPercentage: result.user.xpPercentage,
        currentStreak: result.user.currentStreak,
      }));
    }

    // Recalculate available daily XP
    setAvailableXp((prev) => Math.max(0, prev - completedQuest.xpReward));

    // Trigger celebrations
    if (result.leveledUp) {
      setNewLevelReached(result.newLevel || (userData?.level || 7) + 1);
      setLevelUpModalOpen(true);
    }

    if (result.newlyUnlockedAchievements?.length > 0) {
      setLatestAchievement(result.newlyUnlockedAchievements[0]);
    }
  };

  const handleOpenAiQuestGen = (goalId?: string) => {
    setSelectedGoalIdForAi(goalId);
    setAiModalOpen(true);
  };

  const handleQuestsGenerated = (newQuests: any[]) => {
    setQuests((prev) => [...newQuests, ...prev]);
    loadData();
  };

  // Filter today's daily quests vs epic quests
  const dailyQuests = quests.filter((q) => q.isDaily);
  const featuredQuest = quests.find(
    (q) => !q.isDaily && q.status === "PENDING"
  ) || quests[0];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar
        userLevel={userData?.level || 7}
        streak={userData?.currentStreak || 12}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero: Character HUD */}
        <CharacterHUD
          name={userData?.name || "Uche"}
          level={userData?.level || 7}
          xp={userData?.xp ?? 390}
          xpNeeded={userData?.xpNeeded || 500}
          xpPercentage={userData?.xpPercentage ?? 78}
          streak={userData?.currentStreak || 12}
          archetype={userData?.archetype || "Architect"}
          availableXp={availableXp}
        />

        {/* Context-Aware AI Coach Banner */}
        <AICoachBanner
          initialHeadline="Tactical Advisory"
          initialMessage="You haven't worked on your JavaScript goal for four days. You only need 30 minutes today to keep your weekly target."
          initialAction="Generate AI Quests"
          onActionClick={handleOpenAiQuestGen}
        />

        {/* Core Layout Grid: Quests vs Life Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Today's Quests & Quest System (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Daily Quests Board Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                  ⚔️ Quest Log
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  TODAY&apos;S QUESTS
                </h2>
              </div>
              <button
                onClick={() => handleOpenAiQuestGen()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>+ AI Quest</span>
              </button>
            </div>

            {/* Daily Quest Checklist (Compact & Instant Checkoff) */}
            <div className="hud-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/5">
                <span>Daily Routine & Habits</span>
                <span className="text-amber-400 font-bold">
                  +{availableXp} XP available
                </span>
              </div>

              <div className="space-y-2">
                {dailyQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleQuestComplete}
                    compact={true}
                  />
                ))}

                {dailyQuests.length === 0 && (
                  <p className="text-center py-6 text-sm text-slate-500 font-mono">
                    All daily quests cleared! Ready for new challenges?
                  </p>
                )}
              </div>
            </div>

            {/* Featured / Epic Quest Showcase (Matching prompt: Build your first website) */}
            {featuredQuest && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                    <span>⚔️</span> Epic Objective
                  </span>
                  <a
                    href="/quests"
                    className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1"
                  >
                    <span>View All Quests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <QuestCard
                  quest={featuredQuest}
                  onComplete={handleQuestComplete}
                />
              </div>
            )}
          </div>

          {/* Right Column: Life Map & Goals (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <LifeMapSection
              pillars={pillars}
              onSelectPillar={(slug) => {
                // Navigate or scroll to goals
                window.location.href = `/goals?pillar=${slug}`;
              }}
            />

            {/* Quick Unstuck Card */}
            <div className="hud-card rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-blue-950/20 via-slate-900/60 to-slate-900/40">
              <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
                <Award className="w-4 h-4" />
                <span>Unstuck Protocol</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Feeling overwhelmed or procrastinating?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Let the AI shrink your most daunting blocker into a 15-minute micro-quest with immediate XP gratification.
              </p>
              <button
                onClick={() => handleOpenAiQuestGen()}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Break Down a Stalled Goal</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpModalOpen}
        newLevel={newLevelReached}
        onClose={() => setLevelUpModalOpen(false)}
      />

      {/* Achievement Unlocked Notification Toast */}
      <AchievementUnlockedToast
        achievement={latestAchievement}
        onClose={() => setLatestAchievement(null)}
      />

      {/* AI Quest Decomposition Modal */}
      <AIQuestGenModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        goals={pillars.flatMap((p: any) =>
          (p.goals || []).map((g: any) => ({
            id: g.id,
            title: g.title,
            pillar: { id: p.id, name: p.name, slug: p.slug },
          }))
        )}
        onQuestsGenerated={handleQuestsGenerated}
        defaultGoalId={selectedGoalIdForAi}
      />
    </div>
  );
}
