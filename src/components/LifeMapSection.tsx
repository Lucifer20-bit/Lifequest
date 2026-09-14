"use client";

import { useState } from "react";
import {
  Laptop,
  Coins,
  Brain,
  Dumbbell,
  Users,
  ChevronRight,
  Target,
  Sparkles,
  Swords,
} from "lucide-react";

export interface PillarStat {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  progress: number;
  goalsCount: number;
  questsCount: number;
  completedQuestsCount: number;
}

interface LifeMapSectionProps {
  pillars: PillarStat[];
  onSelectPillar?: (slug: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Laptop,
  Coins,
  Brain,
  Dumbbell,
  Users,
};

export function LifeMapSection({ pillars, onSelectPillar }: LifeMapSectionProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const getAsciiBlocks = (pct: number) => {
    const filled = Math.round((pct / 100) * 10);
    const empty = 10 - filled;
    return "█".repeat(Math.max(0, filled)) + "░".repeat(Math.max(0, empty));
  };

  const handlePillarClick = (slug: string) => {
    setActiveSlug(slug);
    onSelectPillar?.(slug);
  };

  return (
    <div className="hud-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <span>🗺️</span> LIFE MAP
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">MY LIFE</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Tap one → see goals
        </span>
      </div>

      {/* Pillars List */}
      <div className="space-y-3">
        {pillars.map((pillar) => {
          const Icon = ICON_MAP[pillar.icon] || Target;
          const ascii = getAsciiBlocks(pillar.progress);
          const isSelected = activeSlug === pillar.slug;

          return (
            <div
              key={pillar.id}
              onClick={() => handlePillarClick(pillar.slug)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? "bg-white/10 border-amber-500/50 shadow-md"
                  : "bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900/80"
              }`}
            >
              {/* Left info: Icon & Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${pillar.color}20`,
                    color: pillar.color,
                    border: `1px solid ${pillar.color}40`,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {pillar.name}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    {pillar.description}
                  </div>
                </div>
              </div>

              {/* Right: Progress bar and ascii block gauge */}
              <div className="flex items-center gap-4 sm:shrink-0 w-full sm:w-64">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400 tracking-wider text-[11px]">
                      {ascii}
                    </span>
                    <span className="font-bold text-white ml-2">
                      {pillar.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, pillar.progress)}%`,
                        backgroundColor: pillar.color,
                        boxShadow: `0 0 10px ${pillar.color}60`,
                      }}
                    />
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:block shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>5 Active Domains balanced</span>
        <a
          href="/goals"
          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
        >
          <span>Manage Goals</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
