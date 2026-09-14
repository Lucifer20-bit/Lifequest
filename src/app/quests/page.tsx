"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { QuestCard, QuestData } from "@/components/QuestCard";
import { LevelUpModal } from "@/components/LevelUpModal";
import {
  AchievementUnlockedToast,
  ToastAchievement,
} from "@/components/AchievementUnlockedToast";
import { AIQuestGenModal } from "@/components/AIQuestGenModal";
import { Swords, Plus, Sparkles, Filter, CheckCircle2 } from "lucide-react";

export default function QuestsPage() {
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [pillars, setPillars] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  // Modals
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(8);
  const [latestAchievement, setLatestAchievement] =
    useState<ToastAchievement | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Manual Quest Creation State
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPillarId, setNewPillarId] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("MEDIUM");
  const [newMinutes, setNewMinutes] = useState(30);

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
        if (uData.pillars?.[0]) setNewPillarId(uData.pillars[0].id);
      }
      if (qData.quests) {
        setQuests(qData.quests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuestComplete = (completedQuest: QuestData, result: any) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === completedQuest.id ? { ...q, status: "COMPLETED" } : q
      )
    );

    if (result.user) {
      setUserData((prev: any) => ({
        ...prev,
        level: result.user.level,
        xp: result.user.xp,
        xpPercentage: result.user.xpPercentage,
        currentStreak: result.user.currentStreak,
      }));
    }

    if (result.leveledUp) {
      setNewLevelReached(result.newLevel || 8);
      setLevelUpModalOpen(true);
    }

    if (result.newlyUnlockedAchievements?.length > 0) {
      setLatestAchievement(result.newlyUnlockedAchievements[0]);
    }
  };

  const handleCreateManualQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPillarId) return;

    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          pillarId: newPillarId,
          difficulty: newDifficulty,
          estimatedMinutes: Number(newMinutes),
        }),
      });
      const data = await res.json();
      if (data.quest) {
        setQuests((prev) => [data.quest, ...prev]);
        setNewModalOpen(false);
        setNewTitle("");
        setNewDescription("");
      }
    } catch (err) {
      console.error("Error creating quest:", err);
    }
  };

  const filteredQuests = quests.filter((q) => {
    const matchesPillar =
      activeFilter === "all" || q.pillar.slug === activeFilter;
    const matchesStatus =
      statusFilter === "ALL" || q.status === statusFilter;
    return matchesPillar && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar
        userLevel={userData?.level || 7}
        streak={userData?.currentStreak || 12}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Swords className="w-4 h-4" /> Quest Master Log
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Action & Quest Board
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Quest Generator</span>
            </button>

            <button
              onClick={() => setNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Custom Quest</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
          {/* Pillar Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-amber-500 text-black shadow-md font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              All Domains
            </button>
            {pillars.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActiveFilter(p.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === p.slug
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                statusFilter === "PENDING"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                statusFilter === "COMPLETED"
                  ? "bg-emerald-500/20 text-emerald-300 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                statusFilter === "ALL"
                  ? "bg-white/10 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={handleQuestComplete}
            />
          ))}

          {filteredQuests.length === 0 && (
            <div className="col-span-full text-center py-16 hud-card rounded-2xl border border-white/10">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No Quests Found
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Generate tailored quests from your goals or add a custom task to keep earning XP.
              </p>
              <button
                onClick={() => setAiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
              >
                Launch AI Generator
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Manual Quest Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#101422] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Create Custom Quest
            </h3>
            <form onSubmit={handleCreateManualQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                  Quest Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages of architecture book"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                  Life Pillar
                </label>
                <select
                  value={newPillarId}
                  onChange={(e) => setNewPillarId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  {pillars.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  >
                    <option value="EASY">Easy (50 XP)</option>
                    <option value="MEDIUM">Medium (120 XP)</option>
                    <option value="HARD">Hard (300 XP)</option>
                    <option value="EPIC">Epic (500 XP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                  Description / Action Steps
                </label>
                <textarea
                  rows={3}
                  placeholder="What specifically needs to be done?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20"
                >
                  Add Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Level Up & Achievement Modals */}
      <LevelUpModal
        isOpen={levelUpModalOpen}
        newLevel={newLevelReached}
        onClose={() => setLevelUpModalOpen(false)}
      />
      <AchievementUnlockedToast
        achievement={latestAchievement}
        onClose={() => setLatestAchievement(null)}
      />
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
        onQuestsGenerated={(newOnes) => {
          setQuests((prev) => [...newOnes, ...prev]);
          loadData();
        }}
      />
    </div>
  );
}
