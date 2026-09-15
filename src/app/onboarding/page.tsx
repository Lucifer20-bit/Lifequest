"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Swords,
  Shield,
  BookOpen,
  Hammer,
  FlaskConical,
  ArrowRight,
  Target,
} from "lucide-react";
import { sounds } from "@/lib/audio";

const ARCHETYPES = [
  {
    id: "Architect",
    title: "The Architect",
    desc: "Builders, software engineers, and product creators. Focus on shipping systems.",
    icon: Hammer,
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: "Scholar",
    title: "The Scholar",
    desc: "Thinkers, readers, and researchers. Focus on deep knowledge and mastery.",
    icon: BookOpen,
    color: "from-purple-600 to-indigo-500",
  },
  {
    id: "Warrior",
    title: "The Warrior",
    desc: "Athletes, runners, and discipline pursuers. Focus on physical vigor and grit.",
    icon: Swords,
    color: "from-red-600 to-orange-500",
  },
  {
    id: "Alchemist",
    title: "The Alchemist",
    desc: "Strategists, creators, and financial masters. Focus on wealth compounding.",
    icon: FlaskConical,
    color: "from-emerald-600 to-teal-500",
  },
];

const PILLARS = [
  { slug: "career", name: "Career & Craft", icon: "💻" },
  { slug: "finance", name: "Wealth & Finance", icon: "💰" },
  { slug: "knowledge", name: "Knowledge & Mind", icon: "🧠" },
  { slug: "fitness", name: "Fitness & Health", icon: "💪" },
  { slug: "social", name: "Social & Community", icon: "👥" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("Architect");
  const [selectedPillar, setSelectedPillar] = useState("career");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !primaryGoal.trim()) return;

    setLoading(true);
    try {
      sounds.playQuestComplete();
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          archetype: selectedArchetype,
          primaryGoal: primaryGoal.trim(),
          pillarSlug: selectedPillar,
        }),
      });

      if (res.ok) {
        sounds.playLevelUp();
        router.push("/");
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-white flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl hud-card border border-white/10 relative overflow-hidden">
        {/* Glow circle */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6 pb-3 border-b border-white/5">
          <span>Character Genesis</span>
          <span className="text-amber-400 font-bold">Step {step} of 3</span>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                Step 1
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Name Your Hero
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your real name or adventurer callsign.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                Hero Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Uche, Alexander, Maya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white text-base focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Next: Select Archetype</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                Step 2
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Choose Your Archetype
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your class shapes your RPG traits and quest recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARCHETYPES.map((arch) => {
                const Icon = arch.icon;
                const isSelected = selectedArchetype === arch.id;

                return (
                  <div
                    key={arch.id}
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white/15 border-amber-500/60 shadow-lg shadow-amber-500/10 scale-[1.02]"
                        : "bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${arch.color} flex items-center justify-center mb-3 shadow-md`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">
                      {arch.title}
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed">
                      {arch.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-bold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Next: Forge First Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                Step 3
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Forge Your First Goal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                The AI Quest Master will instantly transform this into 3 actionable quests.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                Primary Life Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PILLARS.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => setSelectedPillar(p.slug)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                      selectedPillar === p.slug
                        ? "bg-white/20 border-white/40 text-white"
                        : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                What real-world achievement are you aiming for?
              </label>
              <input
                type="text"
                placeholder="e.g. Master Full-Stack JavaScript & Next.js"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-bold"
              >
                Back
              </button>
              <button
                disabled={!primaryGoal.trim() || loading}
                onClick={handleSubmit}
                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Decomposing & Entering Realm...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Enter LIFEQUEST</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
