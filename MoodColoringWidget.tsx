import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, RotateCcw, Sparkles, Wind } from 'lucide-react';
import { haptics } from './haptics';

type Mood = 'calm' | 'anxious' | 'sad' | 'energized' | 'grateful' | 'angry' | 'hopeless';

const MOOD_CONFIG: Record<Mood, { label: string; emoji: string; palette: string[]; bgClass: string }> = {
  calm: {
    label: 'Calm',
    emoji: '🌿',
    palette: [
      'hsl(152 32% 45%)',
      'hsl(152 25% 65%)',
      'hsl(152 20% 80%)',
      'hsl(170 30% 55%)',
      'hsl(180 25% 70%)',
      'hsl(140 20% 75%)',
    ],
    bgClass: 'from-sage-light/30 to-card',
  },
  anxious: {
    label: 'Anxious',
    emoji: '🌊',
    palette: [
      'hsl(200 40% 60%)',
      'hsl(210 35% 70%)',
      'hsl(190 30% 75%)',
      'hsl(220 30% 65%)',
      'hsl(200 25% 80%)',
      'hsl(185 35% 60%)',
    ],
    bgClass: 'from-sky/20 to-card',
  },
  sad: {
    label: 'Sad',
    emoji: '🌸',
    palette: [
      'hsl(270 25% 65%)',
      'hsl(280 20% 75%)',
      'hsl(290 25% 70%)',
      'hsl(260 20% 80%)',
      'hsl(300 20% 72%)',
      'hsl(270 15% 82%)',
    ],
    bgClass: 'from-lavender/20 to-card',
  },
  energized: {
    label: 'Energized',
    emoji: '☀️',
    palette: [
      'hsl(28 60% 65%)',
      'hsl(35 50% 70%)',
      'hsl(40 45% 75%)',
      'hsl(20 55% 60%)',
      'hsl(45 40% 72%)',
      'hsl(15 50% 68%)',
    ],
    bgClass: 'from-warm-light/40 to-card',
  },
  grateful: {
    label: 'Grateful',
    emoji: '💛',
    palette: [
      'hsl(350 40% 65%)',
      'hsl(340 35% 72%)',
      'hsl(10 45% 68%)',
      'hsl(355 30% 75%)',
      'hsl(330 25% 78%)',
      'hsl(0 35% 70%)',
    ],
    bgClass: 'from-rose/15 to-card',
  },
  angry: {
    label: 'Angry',
    emoji: '🔥',
    palette: [
      'hsl(0 70% 50%)',
      'hsl(15 65% 55%)',
      'hsl(30 60% 58%)',
      'hsl(350 60% 45%)',
      'hsl(10 75% 48%)',
      'hsl(40 55% 52%)',
    ],
    bgClass: 'from-destructive/15 to-card',
  },
  hopeless: {
    label: 'Hopeless',
    emoji: '🕳️',
    palette: [
      'hsl(220 15% 40%)',
      'hsl(215 12% 50%)',
      'hsl(225 10% 58%)',
      'hsl(210 18% 35%)',
      'hsl(230 12% 45%)',
      'hsl(200 10% 55%)',
    ],
    bgClass: 'from-muted/40 to-card',
  },
};

const GRID_SIZE = 7;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

// Anger pattern types that rotate based on seed
type AngerPattern = 'starburst' | 'zigzag' | 'shattered' | 'vortex';
const ANGER_PATTERNS: AngerPattern[] = ['starburst', 'zigzag', 'shattered', 'vortex'];
const ANGER_PATTERN_LABELS: Record<AngerPattern, string> = {
  starburst: 'Starburst',
  zigzag: 'Zigzag',
  shattered: 'Shattered Glass',
  vortex: 'Vortex',
};

function generateAngerStarburst(cells: boolean[], seed: number, center: number) {
  // Cross + diagonals + jagged spikes
  for (let i = 0; i < GRID_SIZE; i++) {
    cells[center * GRID_SIZE + i] = true;
    cells[i * GRID_SIZE + center] = true;
    cells[i * GRID_SIZE + i] = true;
    cells[i * GRID_SIZE + (GRID_SIZE - 1 - i)] = true;
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const dist = Math.abs(r - center) + Math.abs(c - center);
      const hash = ((seed * 31 + r * 17 + c * 13) % 100);
      if (dist <= 2 && hash < 70) cells[r * GRID_SIZE + c] = true;
      else if (dist <= 4 && hash < 30) cells[r * GRID_SIZE + c] = true;
    }
  }
}

function generateAngerZigzag(cells: boolean[], seed: number, center: number) {
  // Jagged zigzag rows — alternating offsets like lightning bolts
  for (let r = 0; r < GRID_SIZE; r++) {
    const offset = r % 2 === 0 ? 0 : 1;
    for (let c = 0; c < GRID_SIZE; c++) {
      const hash = ((seed * 23 + r * 11 + c * 7) % 100);
      // Zigzag: activate cells in a staggered diagonal pattern
      if ((c + offset + r) % 2 === 0 && hash < 65) {
        cells[r * GRID_SIZE + c] = true;
      }
      // Add sharp V-shapes pointing outward
      if (Math.abs(r - center) === Math.abs(c - center) && hash < 80) {
        cells[r * GRID_SIZE + c] = true;
      }
    }
  }
  // Reinforce center cross for structure
  for (let i = 0; i < GRID_SIZE; i++) {
    cells[center * GRID_SIZE + i] = true;
  }
}

function generateAngerShattered(cells: boolean[], seed: number, center: number) {
  // Shattered glass: irregular triangular fragments radiating from center
  // Create radiating crack lines from center
  const angles = [0, 1, 2, 3, 4, 5]; // 6 crack directions
  for (const a of angles) {
    const hash = ((seed * 37 + a * 19) % 100);
    if (hash < 85) {
      for (let d = 0; d <= center; d++) {
        // Map angle + distance to grid coordinates
        const dr = Math.round(d * Math.cos((a * Math.PI) / 3));
        const dc = Math.round(d * Math.sin((a * Math.PI) / 3));
        const r = center + dr;
        const c = center + dc;
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          cells[r * GRID_SIZE + c] = true;
          // Add fragment cells adjacent to cracks
          const fragHash = ((seed * 13 + d * 29 + a * 41) % 100);
          if (fragHash < 55 && c + 1 < GRID_SIZE) cells[r * GRID_SIZE + c + 1] = true;
          if (fragHash < 40 && r + 1 < GRID_SIZE) cells[(r + 1) * GRID_SIZE + c] = true;
        }
      }
    }
  }
  // Fill in scattered shard fragments
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const dist = Math.abs(r - center) + Math.abs(c - center);
      const hash = ((seed * 43 + r * 31 + c * 23) % 100);
      if (dist <= 1) cells[r * GRID_SIZE + c] = true;
      else if (dist <= 3 && hash < 35) cells[r * GRID_SIZE + c] = true;
      else if (dist <= 5 && hash < 15) cells[r * GRID_SIZE + c] = true;
    }
  }
}

function generateAngerVortex(cells: boolean[], seed: number, center: number) {
  // Spiral/vortex: swirling pattern suggesting chaotic energy
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const dr = r - center;
      const dc = c - center;
      const dist = Math.sqrt(dr * dr + dc * dc);
      const angle = Math.atan2(dr, dc);
      // Spiral arms: cells active when angle+distance matches spiral equation
      const spiralPhase = (angle + dist * 0.8 + (seed % 10) * 0.3) % (Math.PI * 2);
      const hash = ((seed * 17 + r * 41 + c * 29) % 100);
      if (Math.abs(Math.sin(spiralPhase * 2)) > 0.4 && hash < 70) {
        cells[r * GRID_SIZE + c] = true;
      }
      // Always fill inner ring
      if (dist <= 1.5) cells[r * GRID_SIZE + c] = true;
    }
  }
}

function generateHopelessPattern(cells: boolean[], seed: number, center: number) {
  // Fading/dissolving pattern — dense at center, sparse at edges
  // Symbolizes things slipping away, hollow center
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const dr = Math.abs(r - center);
      const dc = Math.abs(c - center);
      const dist = Math.max(dr, dc); // Chebyshev distance for square rings
      const hash = ((seed * 29 + r * 23 + c * 19) % 100);
      
      // Ring-based probability: middle rings active, center and edges sparse
      if (dist === 0 && hash < 40) cells[r * GRID_SIZE + c] = true; // hollow center sometimes
      else if (dist === 1 && hash < 80) cells[r * GRID_SIZE + c] = true;
      else if (dist === 2 && hash < 60) cells[r * GRID_SIZE + c] = true;
      else if (dist === 3 && hash < 25) cells[r * GRID_SIZE + c] = true; // fading edges
    }
  }
  // Add a few isolated "floating" cells at edges for fragmented feel
  const fragments = [(seed * 7) % GRID_SIZE, (seed * 11) % GRID_SIZE];
  for (const f of fragments) {
    if (f > 0 && f < GRID_SIZE - 1) {
      cells[f] = true; // top row
      cells[(GRID_SIZE - 1) * GRID_SIZE + (GRID_SIZE - 1 - f)] = true; // bottom row
    }
  }
}

// Generate a symmetric mandala-like pattern of which cells are "active"
// For 'angry' mood, rotates between starburst, zigzag, shattered, and vortex patterns
// For 'hopeless' mood, generates a fading/dissolving pattern
function generatePattern(seed: number, mood?: Mood): boolean[] {
  const cells = new Array(TOTAL_CELLS).fill(false);
  const center = Math.floor(GRID_SIZE / 2);

  if (mood === 'angry') {
    const patternType = ANGER_PATTERNS[seed % ANGER_PATTERNS.length];
    switch (patternType) {
      case 'starburst': generateAngerStarburst(cells, seed, center); break;
      case 'zigzag': generateAngerZigzag(cells, seed, center); break;
      case 'shattered': generateAngerShattered(cells, seed, center); break;
      case 'vortex': generateAngerVortex(cells, seed, center); break;
    }
    // Mirror for symmetry
    for (let r = 0; r <= center; r++) {
      for (let c = 0; c <= center; c++) {
        if (cells[r * GRID_SIZE + c]) {
          cells[r * GRID_SIZE + (GRID_SIZE - 1 - c)] = true;
          cells[(GRID_SIZE - 1 - r) * GRID_SIZE + c] = true;
          cells[(GRID_SIZE - 1 - r) * GRID_SIZE + (GRID_SIZE - 1 - c)] = true;
        }
      }
    }
  } else if (mood === 'hopeless') {
    generateHopelessPattern(cells, seed, center);
    // Mirror for symmetry
    for (let r = 0; r <= center; r++) {
      for (let c = 0; c <= center; c++) {
        if (cells[r * GRID_SIZE + c]) {
          cells[r * GRID_SIZE + (GRID_SIZE - 1 - c)] = true;
          cells[(GRID_SIZE - 1 - r) * GRID_SIZE + c] = true;
          cells[(GRID_SIZE - 1 - r) * GRID_SIZE + (GRID_SIZE - 1 - c)] = true;
        }
      }
    }
  } else {
    for (let r = 0; r <= center; r++) {
      for (let c = 0; c <= center; c++) {
        const hash = ((seed * 31 + r * 17 + c * 13) % 100);
        const active = hash < 55;
        const mirrors = [
          [r, c],
          [r, GRID_SIZE - 1 - c],
          [GRID_SIZE - 1 - r, c],
          [GRID_SIZE - 1 - r, GRID_SIZE - 1 - c],
        ];
        mirrors.forEach(([mr, mc]) => {
          cells[mr * GRID_SIZE + mc] = active;
        });
      }
    }
  }
  // Center cell always active
  cells[center * GRID_SIZE + center] = true;
  return cells;
}

// Breathing phases: inhale 4s → hold 4s → exhale 4s → hold 4s
type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
const BREATH_PHASES: { phase: BreathPhase; label: string; duration: number }[] = [
  { phase: 'inhale', label: 'Breathe in', duration: 4000 },
  { phase: 'hold-in', label: 'Hold', duration: 4000 },
  { phase: 'exhale', label: 'Breathe out', duration: 4000 },
  { phase: 'hold-out', label: 'Hold', duration: 4000 },
];

function useBreathingGuide(active: boolean) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  const currentPhase = BREATH_PHASES[phaseIdx];

  useEffect(() => {
    if (!active) {
      setPhaseIdx(0);
      setProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const dur = BREATH_PHASES[phaseIdx].duration;
      if (elapsed >= dur) {
        setPhaseIdx(prev => (prev + 1) % BREATH_PHASES.length);
        startRef.current = Date.now();
        setProgress(0);
      } else {
        setProgress(elapsed / dur);
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, phaseIdx]);

  return { currentPhase, progress };
}

export default function MoodColoringWidget() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [cellColors, setCellColors] = useState<Record<number, string>>({});
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [patternSeed, setPatternSeed] = useState(() => Math.floor(Math.random() * 1000));
  const [breathingActive, setBreathingActive] = useState(false);

  const pattern = useMemo(() => generatePattern(patternSeed, selectedMood ?? undefined), [patternSeed, selectedMood]);
  const config = selectedMood ? MOOD_CONFIG[selectedMood] : null;

  const coloredCount = Object.keys(cellColors).length;
  const activeCellCount = pattern.filter(Boolean).length;
  const colorProgress = activeCellCount > 0 ? Math.round((coloredCount / activeCellCount) * 100) : 0;

  const { currentPhase, progress: breathProgress } = useBreathingGuide(breathingActive);

  // Breathing circle scale: grows on inhale, shrinks on exhale
  const breathScale = useMemo(() => {
    if (!breathingActive) return 1;
    const { phase } = currentPhase;
    if (phase === 'inhale') return 1 + breathProgress * 0.5;
    if (phase === 'hold-in') return 1.5;
    if (phase === 'exhale') return 1.5 - breathProgress * 0.5;
    return 1; // hold-out
  }, [breathingActive, currentPhase, breathProgress]);

  const handleCellTap = useCallback((idx: number) => {
    if (!config || !pattern[idx]) return;
    haptics.light();
    setCellColors(prev => {
      const next = { ...prev };
      if (next[idx] === config.palette[activeColorIdx]) {
        delete next[idx];
      } else {
        next[idx] = config.palette[activeColorIdx];
      }
      return next;
    });
  }, [config, activeColorIdx, pattern]);

  const handleReset = () => {
    setCellColors({});
    setPatternSeed(Math.floor(Math.random() * 1000));
    setBreathingActive(false);
    haptics.light();
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setCellColors({});
    setActiveColorIdx(0);
    setPatternSeed(Math.floor(Math.random() * 1000));
    setBreathingActive(false);
    haptics.light();
  };

  return (
    <div className="rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-serif font-bold text-foreground">Mindful Coloring</h3>
        </div>
        {selectedMood && (
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedMood ? (
          <motion.div
            key="mood-select"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 pb-4"
          >
            <p className="text-xs text-muted-foreground mb-3">How are you feeling? Pick a mood to start.</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([mood, { label, emoji }]) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/30 text-xs font-semibold text-foreground transition-all active:scale-95"
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="coloring"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`px-4 pb-4 bg-gradient-to-b ${config!.bgClass}`}
          >
            {/* Mood badge */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setSelectedMood(null)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{config!.emoji}</span>
              <span className="font-semibold">{config!.label}</span>
                {selectedMood === 'angry' && (
                  <span className="text-[10px] ml-1 text-primary/70 italic">
                    · {ANGER_PATTERN_LABELS[ANGER_PATTERNS[patternSeed % ANGER_PATTERNS.length]]}
                  </span>
                )}
                <span className="text-[10px] ml-1">· change</span>
              </button>
              <div className="flex items-center gap-2">
                {colorProgress === 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-xs text-primary font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    Complete!
                  </motion.div>
                )}
                <button
                  onClick={() => { setBreathingActive(b => !b); haptics.light(); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    breathingActive
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Wind className="w-3 h-3" />
                  {breathingActive ? 'Stop' : 'Breathe'}
                </button>
              </div>
            </div>

            {/* Breathing overlay */}
            <AnimatePresence>
              {breathingActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex flex-col items-center overflow-hidden"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center mb-1.5">
                    {/* Outer pulse ring */}
                    <div
                      className="absolute inset-0 rounded-full bg-primary/10 transition-transform duration-200"
                      style={{ transform: `scale(${breathScale * 1.15})` }}
                    />
                    {/* Main breathing circle */}
                    <div
                      className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 transition-transform duration-200"
                      style={{ transform: `scale(${breathScale})` }}
                    />
                    {/* Inner dot */}
                    <div className="relative w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{currentPhase.label}</p>
                  <p className="text-[10px] text-muted-foreground">Color as you breathe</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            <div
              className="grid gap-[3px] mx-auto mb-3"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                maxWidth: '260px',
              }}
            >
              {pattern.map((active, idx) => {
                const colored = cellColors[idx];
                return (
                  <motion.button
                    key={idx}
                    whileTap={active ? { scale: 0.85 } : undefined}
                    onClick={() => handleCellTap(idx)}
                    disabled={!active}
                    className="aspect-square rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: colored
                        ? colored
                        : active
                        ? 'hsl(var(--muted))'
                        : 'transparent',
                      border: active ? '1px solid hsl(var(--border) / 0.5)' : 'none',
                      cursor: active ? 'pointer' : 'default',
                    }}
                  />
                );
              })}
            </div>

            {/* Palette picker */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {config!.palette.map((color, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveColorIdx(i); haptics.light(); }}
                  className="relative rounded-full transition-all duration-200"
                  style={{
                    width: activeColorIdx === i ? '28px' : '22px',
                    height: activeColorIdx === i ? '28px' : '22px',
                    backgroundColor: color,
                    boxShadow: activeColorIdx === i ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color}` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${colorProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">{colorProgress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
