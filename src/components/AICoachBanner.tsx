"use client";

import { useState } from "react";
import { Bot, Sparkles, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

interface AICoachBannerProps {
  initialHeadline?: string;
  initialMessage?: string;
  initialAction?: string;
  targetGoalId?: string;
  onActionClick?: (goalId?: string) => void;
}

export function AICoachBanner({
  initialHeadline = "Tactical Advisory",
  initialMessage = "You haven't worked on your JavaScript goal for four days. You only need 30 minutes today to keep your weekly target.",
  initialAction = "Generate 30m Quest",
  targetGoalId,
  onActionClick,
}: AICoachBannerProps) {
  const [headline, setHeadline] = useState(initialHeadline);
  const [message, setMessage] = useState(initialMessage);
  const [action, setAction] = useState(initialAction);
  const [loading, setLoading] = useState(false);

  const refreshAdvice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/coach");
      const data = await res.json();
      if (data.advice) {
        setHeadline(data.advice.headline);
        setMessage(data.advice.message);
        setAction(data.advice.suggestedAction || "Take Action");
      }
    } catch (err) {
      console.error("Failed to refresh coach advice:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-card rounded-2xl p-5 border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-blue-950/30 relative overflow-hidden group">
      {/* Decorative Neon Accent */}
      <div className="absolute -left-12 -top-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          {/* AI Avatar */}
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-[1px] shadow-lg shadow-purple-500/20 shrink-0 mt-0.5">
            <div className="h-full w-full bg-[#0d1017] rounded-[11px] flex items-center justify-center relative">
              <Bot className="w-6 h-6 text-purple-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0d1017] animate-pulse" />
            </div>
          </div>

          {/* AI Message */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {headline}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Context-Aware AI
              </span>
            </div>
            <p className="text-slate-200 text-sm font-medium leading-relaxed max-w-2xl">
              “{message}”
            </p>
          </div>
        </div>

        {/* Action Button & Refresh */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={refreshAdvice}
            disabled={loading}
            title="Refresh AI context"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
          </button>

          <button
            onClick={() => onActionClick?.(targetGoalId)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <span>{action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
