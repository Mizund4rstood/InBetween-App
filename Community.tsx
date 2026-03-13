import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "./progress";
import ShareableCards from "./ShareableCards";
import { supabase } from "./client";
import { toast } from "sonner";

const transitions = [
  { id: "divorce", emoji: "💔", label: "Divorce / Breakup", description: "Navigating the end of a relationship" },
  { id: "career", emoji: "💼", label: "Job Loss / Career Change", description: "Rebuilding your professional identity" },
  { id: "grief", emoji: "🕊️", label: "Grief / Loss", description: "Processing the loss of someone or something" },
  { id: "relocation", emoji: "🧳", label: "Relocation / New City", description: "Finding home in an unfamiliar place" },
  { id: "health", emoji: "🩺", label: "Health Diagnosis", description: "Adapting to a new medical reality" },
  { id: "identity", emoji: "🌱", label: "Identity Shift", description: "Becoming someone new" },
  { id: "sobriety", emoji: "🌊", label: "Sobriety", description: "Walking the path of recovery" },
];

const feelings = [
  { id: "lost", label: "Lost", emoji: "🌫️" },
  { id: "anxious", label: "Anxious", emoji: "⚡" },
  { id: "numb", label: "Numb", emoji: "🧊" },
  { id: "angry", label: "Angry", emoji: "🔥" },
  { id: "hopeful", label: "Hopeful", emoji: "🌤️" },
  { id: "exhausted", label: "Exhausted", emoji: "🌑" },
];

const supports = [
  { id: "grounding", label: "Grounding exercises", desc: "When everything feels like too much" },
  { id: "journaling", label: "Guided journaling", desc: "Process what's hard to say out loud" },
  { id: "community", label: "Knowing I'm not alone", desc: "Stories from others in transition" },
  { id: "tools", label: "Practical tools", desc: "Structure when life feels chaotic" },
];

const results: Record<string, { title: string; message: string; color: string }> = {
  divorce: { title: "Healing after heartbreak", message: "You're rebuilding yourself from the inside out. InBetween will meet you with gentleness and real tools — no toxic positivity, no rushing.", color: "hsl(350, 40%, 80%)" },
  career: { title: "Rewriting your story", message: "Your worth was never your job title. We'll help you find solid ground while you figure out what's next.", color: "hsl(215, 50%, 80%)" },
  grief: { title: "Holding what's heavy", message: "Grief doesn't follow a timeline. InBetween creates space for all of it — the waves, the quiet, and everything between.", color: "hsl(265, 50%, 80%)" },
  relocation: { title: "Finding your footing", message: "Home is something you build. We'll help you root yourself in a new place without losing who you are.", color: "hsl(150, 50%, 80%)" },
  health: { title: "Adapting with courage", message: "A diagnosis changes things — but it doesn't define you. InBetween offers steady tools for an unsteady time.", color: "hsl(30, 55%, 80%)" },
  identity: { title: "Becoming, slowly", message: "You're not who you were, and not yet who you'll be. This in-between is hard — and also where real growth happens.", color: "hsl(80, 50%, 80%)" },
  sobriety: { title: "One day, fully present", message: "Recovery is one of the hardest and most courageous things a person can do. InBetween walks beside you — no judgment, just tools.", color: "hsl(170, 50%, 80%)" },
};

type Selected = {
  transition: string | null;
  feelings: string[];
  support: string | null;
};

export default function Community() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Selected>({ transition: null, feelings: [], support: null });
  const [loading, setLoading] = useState(true);
  const [hasSaved, setHasSaved] = useState(false);

  // Load saved quiz answers on mount
  useEffect(() => {
    const loadSavedAnswers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("community_quiz_answers")
        .select("transition, feelings, support")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSelected({
          transition: data.transition,
          feelings: data.feelings as string[],
          support: data.support,
        });
        setStep(4); // Jump to results
        setHasSaved(true);
      }
      setLoading(false);
    };
    loadSavedAnswers();
  }, []);

  // Save quiz answers when reaching results
  const saveAnswers = useCallback(async () => {
    if (!selected.transition || !selected.support) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      transition: selected.transition,
      feelings: selected.feelings,
      support: selected.support,
      updated_at: new Date().toISOString(),
    };

    if (hasSaved) {
      await supabase.from("community_quiz_answers").update(payload).eq("user_id", user.id);
    } else {
      await supabase.from("community_quiz_answers").insert(payload);
      setHasSaved(true);
    }
  }, [selected, hasSaved]);

  const goNext = () => {
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep === 4) saveAnswers();
  };
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const toggleFeeling = (id: string) => {
    setSelected((s) => ({
      ...s,
      feelings: s.feelings.includes(id) ? s.feelings.filter((f) => f !== id) : [...s.feelings, id],
    }));
  };

  const result = selected.transition ? results[selected.transition] : results.identity;
  const progressValue = step === 0 ? 0 : step === 1 ? 33 : step === 2 ? 66 : 100;

  const reset = () => {
    setStep(0);
    setSelected({ transition: null, feelings: [], support: null });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-muted-foreground text-sm italic animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      {/* Progress bar */}
      {step > 0 && step < 4 && (
        <div className="fixed top-14 left-0 right-0 z-40 px-4">
          <div className="max-w-lg mx-auto">
            <Progress value={progressValue} className="h-0.5" />
          </div>
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < 4 && (
        <button
          onClick={goBack}
          className="fixed top-16 left-4 z-40 p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="max-w-[520px] w-full"
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <p className="text-[11px] tracking-[4px] text-muted-foreground uppercase mb-3 font-sans">
                InBetween
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif text-foreground font-normal leading-tight mb-5 tracking-tight">
                You're in the middle<br />of something hard.
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-11 italic">
                This takes 2 minutes. Tell us what you're going through<br className="hidden sm:block" />and we'll show you what's here for you.
              </p>
              <button onClick={goNext} className="w-full py-3.5 px-8 rounded-lg bg-accent text-accent-foreground font-semibold text-sm tracking-wide transition-opacity hover:opacity-90">
                I'm ready
              </button>
            </div>
          )}

          {/* Step 1: Transition */}
          {step === 1 && (
            <div>
              <p className="text-[11px] tracking-[3px] text-muted-foreground uppercase mb-3 font-sans">What brought you here?</p>
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground font-normal leading-tight mb-8 tracking-tight">
                What kind of change<br />are you living through?
              </h2>
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {transitions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelected((s) => ({ ...s, transition: t.id }))}
                    className={`text-left rounded-xl p-4 border transition-all duration-200 ${
                      selected.transition === t.id
                        ? "bg-accent/10 border-accent text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    <div className="text-xl mb-1.5">{t.emoji}</div>
                    <div className="text-xs font-semibold font-sans tracking-wide">{t.label}</div>
                    <div className="text-[11px] mt-1 opacity-70 font-sans leading-snug">{t.description}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={goNext}
                disabled={!selected.transition}
                className={`w-full py-3.5 px-8 rounded-lg font-semibold text-sm tracking-wide transition-all ${
                  selected.transition
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Feelings */}
          {step === 2 && (
            <div>
              <p className="text-[11px] tracking-[3px] text-muted-foreground uppercase mb-3 font-sans">Right now</p>
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground font-normal leading-tight mb-2 tracking-tight">
                How are you feeling<br />most of the time?
              </h2>
              <p className="text-muted-foreground text-sm italic mb-8">Select all that apply.</p>
              <div className="grid grid-cols-3 gap-2.5 mb-8">
                {feelings.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => toggleFeeling(f.id)}
                    className={`text-center rounded-xl py-4 px-2.5 border transition-all duration-200 ${
                      selected.feelings.includes(f.id)
                        ? "bg-accent/10 border-accent text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{f.emoji}</div>
                    <div className="text-xs font-medium font-sans">{f.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={goNext}
                disabled={selected.feelings.length === 0}
                className={`w-full py-3.5 px-8 rounded-lg font-semibold text-sm tracking-wide transition-all ${
                  selected.feelings.length > 0
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Support */}
          {step === 3 && (
            <div>
              <p className="text-[11px] tracking-[3px] text-muted-foreground uppercase mb-3 font-sans">Almost there</p>
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground font-normal leading-tight mb-8 tracking-tight">
                What kind of support<br />matters most right now?
              </h2>
              <div className="flex flex-col gap-2.5 mb-8">
                {supports.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelected((prev) => ({ ...prev, support: s.id }))}
                    className={`text-left rounded-xl py-4 px-5 border transition-all duration-200 flex items-center justify-between ${
                      selected.support === s.id
                        ? "bg-accent/10 border-accent text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold font-sans mb-0.5">{s.label}</div>
                      <div className="text-xs opacity-70 font-sans">{s.desc}</div>
                    </div>
                    {selected.support === s.id && <span className="text-accent text-lg">✓</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={goNext}
                disabled={!selected.support}
                className={`w-full py-3.5 px-8 rounded-lg font-semibold text-sm tracking-wide transition-all ${
                  selected.support
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Show me what's here for me
              </button>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 mx-auto mb-7 flex items-center justify-center text-3xl">
                {transitions.find(t => t.id === selected.transition)?.emoji}
              </div>
              <p className="text-[11px] tracking-[3px] text-muted-foreground uppercase mb-3 font-sans">You're in the right place</p>
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground font-normal leading-tight mb-4 tracking-tight">
                {result.title}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed italic max-w-[400px] mx-auto mb-7">
                {result.message}
              </p>

              {selected.feelings.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4 mb-8 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs text-muted-foreground w-full mb-1 font-sans">You're feeling</span>
                  {selected.feelings.map(id => {
                    const f = feelings.find(f => f.id === id);
                    return (
                      <span key={id} className="bg-secondary border border-border rounded-full px-3 py-1 text-xs text-accent font-sans">
                        {f?.emoji} {f?.label}
                      </span>
                    );
                  })}
                </div>
              )}

              <a
                href="https://inbetween-space.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3.5 px-8 rounded-lg bg-accent text-accent-foreground font-semibold text-sm tracking-wide transition-opacity hover:opacity-90 mb-3 text-center"
              >
                Enter InBetween →
              </a>
              <button onClick={reset} className="text-muted-foreground text-xs hover:text-foreground transition-colors font-sans mb-4">
                Start over
              </button>

              <ShareableCards transitionId={selected.transition} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
