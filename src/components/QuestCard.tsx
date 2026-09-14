"use client";

import { useState } from "react";
import { Check, Clock, Award, Star, Sparkles, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/audio";

export interface QuestData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  xpReward: number;
  skillTag: string;
  status: string;
  isDaily: boolean;
  pillar: {
    name: string;
    slug: string;
    color: string;
  };
  goal?: {
    id: string;
    title: string;
  } | null;
}

interface QuestCardProps {
  quest: QuestData;
  onComplete: (completedQuest: QuestData, result: any) => void;
  compact?: boolean;
}

export function QuestCard({ quest, onComplete, compact = false }: QuestCardProps) {
  const [completing, setCompleting] = useState(false);
  const isCompleted = quest.status === "COMPLETED";

  const getDifficultyStars = (diff: string) => {
    switch (diff) {
      case "EASY":
        return "⭐";
      case "MEDIUM":
        return "⭐⭐";
      case "HARD":
        return "⭐⭐⭐";
      case "EPIC":
        return "⭐⭐⭐⭐";
      default:
        return "⭐⭐";
    }
  };

  const formatTime = (mins: number) => {
    if (mins >= 60) {
      const hours = Math.round(mins / 60);
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${mins} minutes`;
  };

  const handleCheckboxClick = async () => {
    if (isCompleted || completing) return;

    setCompleting(true);
    try {
      // Play audio chime
      sounds.playQuestComplete();

      // Trigger confetti from button position
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"],
      });

      const res = await fetch(`/api/quests/${quest.id}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        if (data.leveledUp) {
          sounds.playLevelUp();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
        if (data.newlyUnlockedAchievements?.length > 0) {
          sounds.playAchievementUnlocked();
        }
        onComplete(quest, data);
      }
    } catch (err) {
      console.error("Error completing quest:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
          isCompleted
            ? "bg-slate-900/30 border-white/5 opacity-60 line-through text-slate-500"
            : "bg-slate-900/70 border-white/10 hover:border-amber-500/40 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckboxClick}
            disabled={isCompleted || completing}
            className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
              isCompleted
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "border-slate-600 hover:border-amber-400 hover:bg-amber-400/10 active:scale-95"
            }`}
          >
            {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
          <span className="text-sm font-medium">{quest.title}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {quest.estimatedMinutes}m
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
            +{quest.xpReward} XP
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hud-card rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
        isCompleted
          ? "bg-slate-950/40 border-white/5 opacity-70"
          : "hover:border-amber-500/40"
      }`}
    >
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-bold"
              style={{
                backgroundColor: `${quest.pillar.color}20`,
                color: quest.pillar.color,
                border: `1px solid ${quest.pillar.color}40`,
              }}
            >
              {quest.pillar.name}
            </span>
            {quest.isDaily && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                Daily
              </span>
            )}
          </div>

          <div className="text-xs tracking-widest text-amber-400" title={`Difficulty: ${quest.difficulty}`}>
            {getDifficultyStars(quest.difficulty)}
          </div>
        </div>

        {/* Quest Title & Description */}
        <h3
          className={`text-base font-bold mb-1.5 transition-colors ${
            isCompleted ? "text-slate-500 line-through" : "text-white"
          }`}
        >
          {quest.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          {quest.description}
        </p>

        {quest.goal && (
          <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-1 font-mono">
            <span>Goal:</span>
            <span className="text-slate-400 truncate">{quest.goal.title}</span>
          </div>
        )}
      </div>

      {/* Rewards & Action Footer */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {/* XP Reward */}
          <span className="flex items-center gap-1 text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
            +{quest.xpReward} XP
          </span>

          {/* Time Estimate */}
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3 h-3" />
            {formatTime(quest.estimatedMinutes)}
          </span>
        </div>

        {/* Complete Action Button */}
        <button
          onClick={handleCheckboxClick}
          disabled={isCompleted || completing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
              : "bg-white/10 hover:bg-amber-500 hover:text-black text-slate-200 border border-white/10 active:scale-95"
          }`}
        >
          {isCompleted ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              Completed
            </>
          ) : completing ? (
            <span className="animate-spin text-amber-400">⏳</span>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Complete
            </>
          )}
        </button>
      </div>
    </div>
  );
}
