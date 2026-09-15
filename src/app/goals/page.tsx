"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AIQuestGenModal } from "@/components/AIQuestGenModal";
import {
  Target,
  Plus,
  Sparkles,
  ChevronRight,
  Laptop,
  Coins,
  Brain,
  Dumbbell,
  Users,
  CheckCircle,
  Clock,
  Swords,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Laptop,
  Coins,
  Brain,
  Dumbbell,
  Users,
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [selectedPillarSlug, setSelectedPillarSlug] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [targetGoalForAi, setTargetGoalForAi] = useState<string | undefined>();
  const [newGoalModalOpen, setNewGoalModalOpen] = useState(false);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPillarId, setNewPillarId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsRes, userRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/user"),
      ]);
      const gData = await goalsRes.json();
      const uData = await userRes.json();

      if (gData.goals) setGoals(gData.goals);
      if (gData.pillars) {
        setPillars(gData.pillars);
        if (gData.pillars[0]) setNewPillarId(gData.pillars[0].id);
      }
      if (uData.user) setUserData(uData.user);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPillarId) return;

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          pillarId: newPillarId,
        }),
      });
      const data = await res.json();
      if (data.goal) {
        setNewGoalModalOpen(false);
        setNewTitle("");
        setNewDescription("");
        loadData();
      }
    } catch (err) {
      console.error("Error creating goal:", err);
    }
  };

  const filteredGoals =
    selectedPillarSlug === "all"
      ? goals
      : goals.filter((g) => g.pillar.slug === selectedPillarSlug);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar
        userLevel={userData?.level || 7}
        streak={userData?.currentStreak || 12}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title & Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Life Map Architecture
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Real-World Goals & Domains
            </h1>
          </div>

          <button
            onClick={() => setNewGoalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Life Goal</span>
          </button>
        </div>

        {/* Pillar Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setSelectedPillarSlug("all")}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedPillarSlug === "all"
                ? "bg-white/15 border-white/30 text-white"
                : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-mono uppercase tracking-wider font-bold">
              All ({goals.length})
            </div>
            <div className="text-sm font-bold mt-1 text-white">Full Map</div>
          </button>

          {pillars.map((pillar) => {
            const Icon = ICON_MAP[pillar.icon] || Target;
            const count = goals.filter((g) => g.pillarId === pillar.id).length;
            const isSelected = selectedPillarSlug === pillar.slug;

            return (
              <button
                key={pillar.id}
                onClick={() => setSelectedPillarSlug(pillar.slug)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-amber-500/50 bg-white/10 text-white shadow-md"
                    : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon
                    className="w-4 h-4"
                    style={{ color: pillar.color }}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {count}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {pillar.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const Icon = ICON_MAP[goal.pillar.icon] || Target;
            const activeQuests = (goal.quests || []).filter(
              (q: any) => q.status === "PENDING"
            );
            const completedQuests = (goal.quests || []).filter(
              (q: any) => q.status === "COMPLETED"
            );

            return (
              <div
                key={goal.id}
                className="hud-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1"
                      style={{
                        backgroundColor: `${goal.pillar.color}20`,
                        color: goal.pillar.color,
                        border: `1px solid ${goal.pillar.color}40`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: `${goal.pillar.color}20`,
                            color: goal.pillar.color,
                          }}
                        >
                          {goal.pillar.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {goal.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AI Decompose Button */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => {
                        setTargetGoalForAi(goal.id);
                        setAiModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Generate AI Quests</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Connected Quests Indicator */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-white">{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, goal.progress)}%`,
                          backgroundColor: goal.pillar.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeQuests.length} active quests</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{completedQuests.length} completed</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredGoals.length === 0 && (
            <div className="text-center py-16 hud-card rounded-2xl border border-white/10">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No Goals in this Domain
              </h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Set a clear target for this life pillar to start receiving tailored RPG quests.
              </p>
              <button
                onClick={() => setNewGoalModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                Add First Goal
              </button>
            </div>
          )}
        </div>
      </main>

      {/* New Goal Modal */}
      {newGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#101422] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              Add New Real-Life Goal
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Full-Stack Next.js or Run a Marathon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                  Life Domain
                </label>
                <select
                  value={newPillarId}
                  onChange={(e) => setNewPillarId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {pillars.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-1">
                  Why this matters & Target Outcome
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what success looks like..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Quest Decomposition Modal */}
      <AIQuestGenModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        goals={goals.map((g) => ({
          id: g.id,
          title: g.title,
          pillar: {
            id: g.pillar.id,
            name: g.pillar.name,
            slug: g.pillar.slug,
          },
        }))}
        onQuestsGenerated={() => {
          loadData();
        }}
        defaultGoalId={targetGoalForAi}
      />
    </div>
  );
}
