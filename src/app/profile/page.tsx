"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  User,
  Trophy,
  Flame,
  Award,
  Sparkles,
  Shield,
  Clock,
  Swords,
  Hammer,
  BookOpen,
  Crown,
  Zap,
} from "lucide-react";

const BADGE_ICONS: Record<string, any> = {
  Sword: Swords,
  Hammer: Hammer,
  Flame: Flame,
  Zap: Zap,
  Crown: Crown,
  BookOpen: BookOpen,
  Award: Award,
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [allSystemAchievements, setAllSystemAchievements] = useState<any[]>([]);
  const [recentXp, setRecentXp] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user");
        const data = await res.json();
        if (data.user) {
          setUserData(data.user);
          setAchievements(data.achievements || []);
          setRecentXp(data.recentXp || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const unlockedCodes = new Set(achievements.map((a) => a.code));

  // Default system badge catalog
  const badgeCatalog = [
    {
      code: "FIRST_BLOOD",
      title: "First Blood",
      description: "Completed your first real-world quest.",
      badgeIcon: "Sword",
      xpBonus: 100,
    },
    {
      code: "BUILDER_INIT",
      title: "The Builder",
      description: "Shipped your first functional project or code module.",
      badgeIcon: "Hammer",
      xpBonus: 250,
    },
    {
      code: "STREAK_3",
      title: "Momentum Spark",
      description: "Maintained a 3-day active quest streak.",
      badgeIcon: "Flame",
      xpBonus: 150,
    },
    {
      code: "STREAK_7",
      title: "Relentless Focus",
      description: "Kept the fire burning for 7 consecutive days.",
      badgeIcon: "Zap",
      xpBonus: 350,
    },
    {
      code: "LEVEL_5",
      title: "Seasoned Adventurer",
      description: "Reached Character Level 5 in the real world.",
      badgeIcon: "Crown",
      xpBonus: 500,
    },
    {
      code: "MINDFUL_SCHOLAR",
      title: "Sage of Knowledge",
      description: "Completed 3 deep learning and book study quests.",
      badgeIcon: "BookOpen",
      xpBonus: 200,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Navbar
        userLevel={userData?.level || 7}
        streak={userData?.currentStreak || 12}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Character Card */}
        <div className="hud-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar & Archetype */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[2px] shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-[#0d1017] rounded-[14px] flex items-center justify-center">
                  <User className="w-10 h-10 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                    {userData?.archetype || "Architect"}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {userData?.id?.slice(0, 8)}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white">
                  {userData?.name || "Uche"}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {userData?.email}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  Level
                </div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {userData?.level || 7}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  Streak
                </div>
                <div className="text-2xl font-black text-orange-400 mt-0.5 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 animate-pulse" />
                  {userData?.currentStreak || 12}d
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center col-span-2 sm:col-span-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  XP Stash
                </div>
                <div className="text-2xl font-black text-blue-400 mt-0.5">
                  {userData?.xp || 390}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Trophy Room
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Unlocked Badges & Feats
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {achievements.length} / {badgeCatalog.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgeCatalog.map((badge) => {
              const isUnlocked = unlockedCodes.has(badge.code);
              const Icon = BADGE_ICONS[badge.badgeIcon] || Trophy;

              return (
                <div
                  key={badge.code}
                  className={`hud-card rounded-2xl p-5 border transition-all ${
                    isUnlocked
                      ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900/60 shadow-lg shadow-amber-500/10"
                      : "border-white/5 bg-slate-950/40 opacity-50 grayscale"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnlocked
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-white/5 border-white/10 text-slate-600"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">
                          {badge.title}
                        </h4>
                        {isUnlocked && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {badge.description}
                      </p>
                      <div className="mt-2.5 text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>+{badge.xpBonus} XP Bonus</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent XP Activity Stream */}
        <div className="hud-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Recent XP Ledger</span>
          </h3>

          <div className="space-y-2.5">
            {recentXp.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300 font-medium">
                    {entry.source.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="font-bold text-amber-400">
                  +{entry.amount} XP
                </span>
              </div>
            ))}

            {recentXp.length === 0 && (
              <p className="text-xs text-slate-500 font-mono text-center py-4">
                No recent XP events recorded yet. Clear your first quest!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
