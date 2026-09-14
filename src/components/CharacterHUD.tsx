"use client";

import { Flame, Shield, Zap, Trophy } from "lucide-react";

interface CharacterHUDProps {
  name: string;
  level: number;
  xp: number;
  xpNeeded: number;
  xpPercentage: number;
  streak: number;
  archetype?: string;
  availableXp?: number;
}

export function CharacterHUD({
  name = "Uche",
  level = 7,
  xp = 390,
  xpNeeded = 500,
  xpPercentage = 78,
  streak = 12,
  archetype = "Architect",
  availableXp = 180,
}: CharacterHUDProps) {
  // Generate ASCII-style block visual representation: ████████░░ 78%
  const filledBlocks = Math.round((xpPercentage / 100) * 10);
  const emptyBlocks = 10 - filledBlocks;
  const blockString = "█".repeat(filledBlocks) + "░".repeat(Math.max(0, emptyBlocks));

  return (
    <div className="hud-card rounded-2xl p-6 relative overflow-hidden border border-white/10">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Greeting & Character Archetype */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {archetype} Class
            </span>
            <span className="text-xs text-slate-400">Real Life RPG OS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Good morning, {name} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-slate-400">
            Keep your momentum alive. Small daily quests compound into world-class mastery.
          </p>
        </div>

        {/* Right: Streak & XP Available Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 12 Day Streak Badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 shadow-lg">
            <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/40">
              <Flame className="w-6 h-6 text-orange-400 animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-wider text-orange-300 font-bold uppercase">
                Active Streak
              </div>
              <div className="text-lg font-black text-white flex items-center gap-1">
                {streak} DAY STREAK
              </div>
            </div>
          </div>

          {/* Daily XP Pool */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-wider text-blue-300 font-bold uppercase">
                Today's Pool
              </div>
              <div className="text-lg font-black text-white">
                +{availableXp} XP <span className="text-xs font-normal text-slate-400">available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Level & Interactive XP Bar */}
      <div className="mt-6 pt-5 border-t border-white/5">
        <div className="flex items-center justify-between mb-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> LEVEL {level}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              ({blockString} {xpPercentage}%)
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-300">
            <span className="text-amber-400 font-bold">{xp}</span> / {xpNeeded} XP
            <span className="text-slate-500 ml-2">({xpPercentage}%)</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 xp-bar-glow transition-all duration-700 ease-out"
            style={{ width: `${Math.max(4, Math.min(100, xpPercentage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500 font-mono">
          <span>Level {level}</span>
          <span>{xpNeeded - xp} XP to Level {level + 1}</span>
        </div>
      </div>
    </div>
  );
}
