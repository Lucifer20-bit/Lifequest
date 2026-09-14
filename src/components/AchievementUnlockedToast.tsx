"use client";

import { Award, Sparkles, X } from "lucide-react";

export interface ToastAchievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badgeIcon: string;
  xpBonus: number;
}

interface AchievementUnlockedToastProps {
  achievement: ToastAchievement | null;
  onClose: () => void;
}

export function AchievementUnlockedToast({
  achievement,
  onClose,
}: AchievementUnlockedToastProps) {
  if (!achievement) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-purple-950/90 border border-amber-500/40 shadow-2xl shadow-amber-500/20 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
          <Award className="w-6 h-6 animate-pulse" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Achievement Unlocked
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">
            {achievement.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {achievement.description}
          </p>
          {achievement.xpBonus > 0 && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-300">
              +{achievement.xpBonus} XP Bonus Awarded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
