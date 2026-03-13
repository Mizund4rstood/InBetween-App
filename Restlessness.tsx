import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Activity, Wind, Hand, Brain, RotateCcw, Check } from 'lucide-react';
import Fireflies from './Fireflies';
import { haptics } from './haptics';
import { sounds } from './sounds';
import { supabase } from './client';

type Tool = 'menu' | 'bodyscan' | 'movement' | 'fidget' | 'reframe' | 'done';

const BODY_ZONES = [
  { id: 'head', label: 'Head / Mind', y: 8, description: 'Racing thoughts, buzzing' },
  { id: 'chest', label: 'Chest', y: 28, description: 'Tight, fluttery, pounding' },
  { id: 'stomach', label: 'Stomach', y: 45, description: 'Knotted, churning, hollow' },
  { id: 'hands', label: 'Hands / Arms', y: 38, description: 'Twitchy, clenching, tingling' },
  { id: 'legs', label: 'Legs / Feet', y: 72, description: 'Bouncing, urge to move, heavy' },
];

const MOVEMENT_PROMPTS = [
  { emoji: '🤲', label: 'Shake out your hands', duration: 10, instruction: 'Let your hands go loose and shake them vigorously — like flicking water off' },
  { emoji: '🧍', label: 'Full body stretch', duration: 15, instruction: 'Reach up high, then fold forward. Let gravity pull the tension out' },
  { emoji: '🚶', label: '30-second walk', duration: 30, instruction: 'Walk around your space. Feel your feet on the ground with each step' },
  { emoji: '🔄', label: 'Shoulder rolls', duration: 10, instruction: 'Roll your shoulders backward 5 times, then forward 5 times. Slow and deliberate' },
  { emoji: '💪', label: 'Tense & release', duration: 15, instruction: 'Squeeze every muscle tight for 5 seconds, then release all at once' },
];

const REFRAME_PROMPTS = [
  { question: 'What is this restlessness trying to tell me?', examples: ['I need to move', 'I\'m avoiding something', 'I have unspent energy', 'Something feels unresolved'] },
  { question: 'What am I avoiding right now?', examples: ['A conversation', 'A decision', 'A feeling', 'Nothing — just excess energy'] },
  { question: 'What would help me feel settled?', examples: ['Physical movement', 'Talking to someone', 'Making a decision', 'Accepting uncertainty'] },
  { question: 'Is this restlessness useful right now?', examples: ['Yes — it\'s telling me to act', 'No — it\'s just noise', 'Maybe — I need to explore it'] },
];

// 6x8 grid for fidget tapping
const FIDGET_ROWS = 8;
const FIDGET_COLS = 6;

async function logRestlessnessSession(toolUsed: string, durationSeconds?: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('restlessness_sessions').insert({
    user_id: user.id,
    tool_used: toolUsed,
    duration_seconds: durationSeconds ?? null,
  } as any);
}

export default function RestlessnessPage() {
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool>('menu');
  const startTimeRef = useRef<number>(Date.now());

  const handleToolDone = (toolName: string) => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    logRestlessnessSession(toolName, duration);
    setTool('done');
  };

  const handleToolSelect = (t: Tool) => {
    startTimeRef.current = Date.now();
    setTool(t);
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in relative min-h-screen">
      {/* Organic animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/15 animate-drift animate-morph" style={{ filter: 'blur(55px)' }} />
        <div className="absolute -top-10 -right-24 w-64 h-64 rounded-full bg-sky/12 animate-drift-reverse animate-morph-alt" style={{ filter: 'blur(50px)' }} />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-warm/12 animate-float-slow animate-morph" style={{ filter: 'blur(55px)' }} />
        <div className="absolute bottom-20 -left-16 w-60 h-60 rounded-full bg-lavender/12 animate-float-reverse animate-morph-alt" style={{ filter: 'blur(55px)' }} />
        <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-sage-light/20 animate-drift animate-morph" style={{ filter: 'blur(50px)' }} />
      </div>

      <Fireflies />

      <div className="flex items-center gap-3 pt-10 pb-6 relative z-10">
        <button
          onClick={() => tool === 'menu' ? navigate(-1) : setTool('menu')}
          className="p-2.5 rounded-xl hover:bg-muted/80 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold">Restlessness</h1>
          <p className="text-sm text-muted-foreground mt-1">Channel the energy, don't fight it</p>
        </div>
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {tool === 'menu' && <ToolMenu key="menu" onSelect={handleToolSelect} />}
          {tool === 'bodyscan' && <BodyScan key="bodyscan" onDone={() => handleToolDone('bodyscan')} />}
          {tool === 'movement' && <MovementPrompts key="movement" onDone={() => handleToolDone('movement')} />}
          {tool === 'fidget' && <FidgetGrid key="fidget" onDone={() => handleToolDone('fidget')} />}
          {tool === 'reframe' && <CognitiveReframe key="reframe" onDone={() => handleToolDone('reframe')} />}
          {tool === 'done' && <DoneScreen key="done" onBack={() => setTool('menu')} onClose={() => navigate(-1)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToolMenu({ onSelect }: { onSelect: (t: Tool) => void }) {
  const tools = [
    { id: 'bodyscan' as Tool, icon: Activity, label: 'Body Scan', description: 'Find where the restlessness lives', color: 'text-sky' },
    { id: 'movement' as Tool, icon: Wind, label: 'Movement Prompts', description: 'Channel the energy physically', color: 'text-primary' },
    { id: 'fidget' as Tool, icon: Hand, label: 'Mindful Fidget', description: 'Tap it out on screen', color: 'text-accent' },
    { id: 'reframe' as Tool, icon: Brain, label: 'Cognitive Reframe', description: 'Explore what it\'s signaling', color: 'text-compass' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">Pick a tool that fits right now.</p>
      {tools.map((t, i) => (
        <motion.button
          key={t.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => { haptics.medium(); onSelect(t.id); }}
          className="w-full p-5 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] text-left flex items-center gap-4 active:scale-[0.98] transition-all"
        >
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <t.icon className={`w-5 h-5 ${t.color}`} />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block">{t.label}</span>
            <span className="text-xs text-muted-foreground">{t.description}</span>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function BodyScan({ onDone }: { onDone: () => void }) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [scannedZones, setScannedZones] = useState<Set<string>>(new Set());
  const [breathPhase, setBreathPhase] = useState(0);

  useEffect(() => {
    if (!activeZone) return;
    const timer = setInterval(() => setBreathPhase(p => (p + 1) % 4), 4000);
    return () => clearInterval(timer);
  }, [activeZone]);

  const handleZoneSelect = (id: string) => {
    haptics.light();
    setActiveZone(id);
    setScannedZones(prev => new Set(prev).add(id));
  };

  const phaseLabels = ['Breathe in…', 'Hold…', 'Breathe out…', 'Rest…'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <p className="text-sm text-muted-foreground mb-6">Tap each area. Notice where the restlessness is strongest.</p>

      <div className="relative bg-card rounded-3xl border border-border/50 shadow-[var(--shadow-card)] p-6 mb-6 min-h-[320px]">
        {/* Simple body outline */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-16 h-64 rounded-full border-2 border-foreground" />
        </div>

        {BODY_ZONES.map(zone => {
          const isActive = activeZone === zone.id;
          const isScanned = scannedZones.has(zone.id);
          return (
            <button
              key={zone.id}
              onClick={() => handleZoneSelect(zone.id)}
              style={{ top: `${zone.y}%` }}
              className={`absolute left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
                isActive
                  ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-glow-primary)] scale-105'
                  : isScanned
                    ? 'bg-primary/5 border-primary/10'
                    : 'bg-card border-border/50 hover:border-primary/20'
              }`}
            >
              <span className="text-xs font-bold text-foreground block">{zone.label}</span>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-muted-foreground block mt-0.5"
                >
                  {zone.description}
                </motion.span>
              )}
              {isScanned && !isActive && <Check className="w-3 h-3 text-primary inline ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Breathing guide when zone active */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 text-center"
          >
            <motion.div
              className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/30 mx-auto mb-2"
              animate={{ scale: breathPhase < 2 ? [1, 1.4] : [1.4, 1] }}
              transition={{ duration: 4, ease: 'easeInOut' }}
            />
            <p className="text-sm font-semibold text-primary">{phaseLabels[breathPhase]}</p>
            <p className="text-xs text-muted-foreground mt-1">Breathe into where you feel the restlessness</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>{scannedZones.size}/{BODY_ZONES.length} zones scanned</span>
        {scannedZones.size > 0 && <span className="text-primary font-semibold">Good awareness ✓</span>}
      </div>

      <button
        onClick={() => { haptics.medium(); sounds.step(); onDone(); }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
      >
        {scannedZones.size >= 3 ? 'Complete Scan ✓' : 'Done'}
      </button>
    </motion.div>
  );
}

function MovementPrompts({ onDone }: { onDone: () => void }) {
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            haptics.medium();
            sounds.step();
            setCompleted(prev => new Set(prev).add(activePrompt!));
            setActivePrompt(null);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [countdown, activePrompt]);

  const startPrompt = (i: number) => {
    haptics.medium();
    setActivePrompt(i);
    setCountdown(MOVEMENT_PROMPTS[i].duration);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <p className="text-sm text-muted-foreground mb-6">Pick one. Move the energy through your body.</p>

      <div className="space-y-3 mb-6">
        {MOVEMENT_PROMPTS.map((prompt, i) => {
          const isActive = activePrompt === i;
          const isDone = completed.has(i);
          return (
            <div key={i}>
              <button
                onClick={() => activePrompt === null && !isDone && startPrompt(i)}
                disabled={activePrompt !== null && !isActive}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? 'bg-primary/15 border-primary/30 shadow-[var(--shadow-card)]'
                    : isDone
                      ? 'bg-primary/5 border-primary/10'
                      : 'border-border/50 hover:border-primary/20'
                } ${activePrompt !== null && !isActive ? 'opacity-40' : ''}`}
              >
                <span className="text-2xl shrink-0">{prompt.emoji}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground">{prompt.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{prompt.duration}s</span>
                  {isDone && <Check className="w-3.5 h-3.5 text-primary inline ml-2" />}
                </div>
                {isActive && countdown > 0 && (
                  <span className="text-2xl font-serif font-bold text-primary tabular-nums">{countdown}</span>
                )}
              </button>

              <AnimatePresence>
                {isActive && countdown > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3"
                  >
                    <p className="text-sm text-foreground font-medium">{prompt.instruction}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => { haptics.medium(); sounds.step(); onDone(); }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
      >
        {completed.size > 0 ? `Done (${completed.size} completed) ✓` : 'Skip'}
      </button>
    </motion.div>
  );
}

function FidgetGrid({ onDone }: { onDone: () => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [color, setColor] = useState(0);
  const colors = [
    'bg-primary/60',
    'bg-accent/60',
    'bg-sky/60',
    'bg-lavender/60',
    'bg-rose/60',
    'bg-earth/60',
  ];

  const handleTap = useCallback((i: number) => {
    haptics.light();
    setTapped(prev => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }, []);

  const progress = Math.round((tapped.size / (FIDGET_ROWS * FIDGET_COLS)) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <p className="text-sm text-muted-foreground mb-4">Tap cells rhythmically. Let the pattern absorb the restless energy.</p>

      {/* Color picker */}
      <div className="flex items-center gap-2 mb-4">
        {colors.map((c, i) => (
          <button
            key={i}
            onClick={() => setColor(i)}
            className={`w-7 h-7 rounded-full ${c} transition-all ${color === i ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : 'opacity-60 hover:opacity-80'}`}
          />
        ))}
        <button
          onClick={() => { setTapped(new Set()); haptics.light(); }}
          className="ml-auto p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] p-3 mb-4">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${FIDGET_COLS}, 1fr)` }}>
          {Array.from({ length: FIDGET_ROWS * FIDGET_COLS }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => handleTap(i)}
              whileTap={{ scale: 0.85 }}
              className={`aspect-square rounded-lg transition-all duration-200 ${
                tapped.has(i) ? colors[color] : 'bg-muted/50 hover:bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{tapped.size} taps</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
      </div>

      <button
        onClick={() => { haptics.medium(); sounds.step(); onDone(); }}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
      >
        Done
      </button>
    </motion.div>
  );
}

function CognitiveReframe({ onDone }: { onDone: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const prompt = REFRAME_PROMPTS[currentQ];

  const handleSelect = (example: string) => {
    haptics.light();
    setAnswers(prev => ({ ...prev, [currentQ]: example }));
  };

  const next = () => {
    haptics.medium();
    sounds.step();
    if (currentQ < REFRAME_PROMPTS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      onDone();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {REFRAME_PROMPTS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= currentQ ? 'bg-compass' : 'bg-muted'}`} />
        ))}
      </div>

      <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <h3 className="text-lg font-serif font-bold text-foreground mb-4">{prompt.question}</h3>

        <div className="space-y-2 mb-4">
          {prompt.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleSelect(ex)}
              className={`w-full p-3.5 rounded-2xl border text-left text-sm transition-all duration-200 active:scale-[0.98] ${
                answers[currentQ] === ex
                  ? 'bg-compass/15 border-compass/30 text-compass font-semibold shadow-[var(--shadow-card)]'
                  : 'border-border/50 text-foreground hover:border-compass/20'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>

        <textarea
          value={answers[currentQ] && !prompt.examples.includes(answers[currentQ]) ? answers[currentQ] : ''}
          onChange={e => setAnswers(prev => ({ ...prev, [currentQ]: e.target.value }))}
          placeholder="Or write your own…"
          rows={2}
          className="w-full p-3 rounded-xl bg-card border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-compass/20 transition-all"
        />
      </motion.div>

      <button
        onClick={next}
        disabled={!answers[currentQ]}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-compass to-compass-dark text-primary-foreground font-bold active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_24px_-4px_hsl(var(--compass)/0.25)]"
      >
        {currentQ < REFRAME_PROMPTS.length - 1 ? 'Next' : 'Complete'}
      </button>
    </motion.div>
  );
}

function DoneScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
        className="text-6xl mb-6"
      >
        🦎
      </motion.div>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Energy channeled</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Restlessness isn't the enemy — it's information. You just listened.
      </p>
      <div className="space-y-3">
        <button
          onClick={onBack}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
        >
          Try Another Tool
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl border border-border/50 text-foreground font-semibold active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}
