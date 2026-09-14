"use client";

import { useState } from "react";
import { Bot, Sparkles, X, Swords, ArrowRight } from "lucide-react";

interface GoalOption {
  id: string;
  title: string;
  pillar: {
    id: string;
    name: string;
    slug: string;
  };
}

interface AIQuestGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalOption[];
  onQuestsGenerated: (newQuests: any[]) => void;
  defaultGoalId?: string;
}

export function AIQuestGenModal({
  isOpen,
  onClose,
  goals,
  onQuestsGenerated,
  defaultGoalId,
}: AIQuestGenModalProps) {
  const [selectedGoalId, setSelectedGoalId] = useState(defaultGoalId || goals[0]?.id || "");
  const [customGoal, setCustomGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const selected = goals.find((g) => g.id === selectedGoalId);
      const payload: Record<string, unknown> = {};

      if (customGoal.trim()) {
        payload.goalTitle = customGoal.trim();
        payload.pillarId = selected ? selected.pillar.id : goals[0]?.pillar.id;
      } else if (selectedGoalId) {
        payload.goalId = selectedGoalId;
      } else {
        setError("Please select or enter a goal.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quests");
      }

      onQuestsGenerated(data.quests);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to generate quests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#101422] border border-purple-500/30 shadow-2xl shadow-purple-500/20 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              AI Quest Generator
            </span>
            <h3 className="text-xl font-black text-white">
              Decompose Real-Life Goal
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          The AI Quest Master decomposes your ambitious target into 3 daily, bite-sized RPG quests (Easy, Medium, Hard) balanced with XP and skill points.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Goal Selector */}
        {goals.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
              Select an Active Life Goal
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  [{g.pillar.name}] {g.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Or enter custom goal */}
        <div className="mb-6">
          <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
            Or Type a New Real-Life Goal
          </label>
          <input
            type="text"
            placeholder="e.g. Learn Python for Data Science or Run 5km"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Decomposing Goal into Quests...</span>
            </>
          ) : (
            <>
              <Swords className="w-4 h-4" />
              <span>Generate 3 RPG Quests</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
