"use client";

import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { Sparkles, Swords, Target, User, Flame, Compass } from "lucide-react";

interface NavbarProps {
  userLevel?: number;
  streak?: number;
}

export function Navbar({ userLevel = 7, streak = 12 }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Life Map", icon: Compass },
    { href: "/quests", label: "Quests", icon: Swords },
    { href: "/goals", label: "Goals", icon: Target },
    { href: "/profile", label: "Hero Sheet", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090B10]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-[#0d1017] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1">
              LIFE<span className="text-amber-400">QUEST</span>
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 -mt-1 font-mono">
              Real Life RPG OS
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Player Status HUD Badges */}
        <div className="flex items-center gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-sm shadow-inner">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>{streak}d</span>
          </div>

          {/* Level Badge */}
          <a
            href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all font-mono text-xs font-bold tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            LVL {userLevel}
          </a>
        </div>
      </div>
    </header>
  );
}
