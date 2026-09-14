"use client";

import { Trophy, Star, Sparkles, ArrowRight, Shield } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#181d2e] via-[#101422] to-[#0a0d16] border border-amber-500/40 shadow-2xl shadow-amber-500/20 text-center overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Crown / Trophy Icon */}
        <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 shadow-xl shadow-amber-500/30">
          <div className="w-full h-full bg-[#0d1017] rounded-[15px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        {/* Header */}
        <div className="inline-block px-3 py-1 mb-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">
          Victory Fanfare
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-1">
          LEVEL UP!
        </h2>
        <p className="text-lg font-bold text-amber-400 font-mono mb-4">
          YOU REACHED LEVEL {newLevel}
        </p>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Your real-world discipline has leveled up your hero stats. Keep compounding your daily actions.
        </p>

        {/* Unlocks Summary */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Rewards Unlocked
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-200">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>+1 Skill Point available</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-200">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Max XP capacity expanded</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-200">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Hero title tier elevated</span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Claim Rewards & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
