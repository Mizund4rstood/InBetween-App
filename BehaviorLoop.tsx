import { useState, useCallback } from 'react';
import { useCompassStore, CompassTrigger, CompassChoice } from './compassStore';
import { ChevronLeft, Edit3, Check, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumGate } from './PremiumGate';
import { usePremiumStore } from './premiumStore';

interface LoopNode {
  id: 'trigger' | 'thought' | 'emotion' | 'behavior' | 'outcome';
  label: string;
  emoji: string;
  color: string; // tailwind token
  value: string;
  placeholder: string;
}

const DEFAULT_NODES: LoopNode[] = [
  { id: 'trigger', label: 'Trigger', emoji: '⚡', color: 'compass', value: '', placeholder: 'What happened?' },
  { id: 'thought', label: 'Thought', emoji: '💭', color: 'primary', value: '', placeholder: 'What thought came up?' },
  { id: 'emotion', label: 'Emotion', emoji: '❤️‍🔥', color: 'accent', value: '', placeholder: 'What did you feel?' },
  { id: 'behavior', label: 'Behavior', emoji: '🏃', color: 'compass', value: '', placeholder: 'What did you do?' },
  { id: 'outcome', label: 'Outcome', emoji: '🎯', color: 'primary', value: '', placeholder: 'What happened next?' },
];

function prefillFromTrigger(trigger: CompassTrigger, choice?: CompassChoice): LoopNode[] {
  return DEFAULT_NODES.map(node => {
    switch (node.id) {
      case 'trigger': return { ...node, value: trigger.trigger_text };
      case 'thought': return { ...node, value: trigger.urge || '' };
      case 'emotion': return { ...node, value: trigger.emotion || '' };
      case 'behavior': return { ...node, value: choice?.choice_text || '' };
      case 'outcome': return { ...node, value: choice?.outcome_rating != null ? `Outcome: ${choice.outcome_rating}/10` : '' };
      default: return node;
    }
  });
}

export default function BehaviorLoopPage() {
  const navigate = useNavigate();
  const { triggers, choices } = useCompassStore();
  const [nodes, setNodes] = useState<LoopNode[]>(DEFAULT_NODES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTriggerId, setSelectedTriggerId] = useState<string | null>(null);

  const recentTriggers = triggers.slice(0, 5);

  const handlePrefill = useCallback((trigger: CompassTrigger) => {
    const choice = choices.find(c => c.trigger_id === trigger.id);
    setNodes(prefillFromTrigger(trigger, choice));
    setSelectedTriggerId(trigger.id);
    setEditingId(null);
  }, [choices]);

  const handleReset = () => {
    setNodes(DEFAULT_NODES);
    setSelectedTriggerId(null);
    setEditingId(null);
  };

  const updateNode = (id: string, value: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, value } : n));
  };

  // SVG arrow path between nodes (circular layout)
  const nodeCount = nodes.length;
  const radius = 120;
  const centerX = 160;
  const centerY = 155;

  const getNodePosition = (index: number) => {
    const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const { useTrialAccess } = usePremiumStore();
  const [trialChecked, setTrialChecked] = useState(false);
  const [showGate, setShowGate] = useState(false);

  // Trial-taste: check on mount
  useState(() => {
    const granted = useTrialAccess('behavior_loop');
    if (!granted) setShowGate(true);
    setTrialChecked(true);
  });

  if (showGate) {
    return (
      <div className="max-w-lg mx-auto p-4 pt-20 animate-fade-in">
        <PremiumGate feature="behavior_loop" inline>
          <div />
        </PremiumGate>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="flex items-center gap-3 pt-10 pb-6">
        <button onClick={() => navigate('/compass')} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold">Behavior Loop</h1>
          <p className="text-sm text-muted-foreground mt-1">See your patterns. Edit the loop.</p>
        </div>
      </div>

      {/* Prefill from recent triggers */}
      {recentTriggers.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Load from a trigger</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {recentTriggers.map(t => (
              <button
                key={t.id}
                onClick={() => handlePrefill(t)}
                className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 max-w-[180px] truncate ${
                  selectedTriggerId === t.id
                    ? 'bg-compass/15 border-compass/30 text-compass'
                    : 'border-border/50 text-muted-foreground hover:border-compass/20'
                }`}
              >
                {t.trigger_text.slice(0, 40)}{t.trigger_text.length > 40 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visual Loop */}
      <div className="relative mb-4" style={{ height: '320px' }}>
        {/* SVG arrows */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 310" fill="none">
          {nodes.map((_, i) => {
            const from = getNodePosition(i);
            const to = getNodePosition((i + 1) % nodeCount);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            // Curve control point slightly toward center
            const ctrlX = midX + (centerX - midX) * 0.3;
            const ctrlY = midY + (centerY - midY) * 0.3;
            return (
              <motion.path
                key={i}
                d={`M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                strokeDasharray="6 4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node, i) => {
          const pos = getNodePosition(i);
          const isEditing = editingId === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
              className="absolute"
              style={{
                left: `${(pos.x / 320) * 100}%`,
                top: `${(pos.y / 310) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <button
                onClick={() => setEditingId(isEditing ? null : node.id)}
                className={`relative w-[88px] h-[88px] rounded-2xl border-2 shadow-[var(--shadow-card)] flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${
                  isEditing
                    ? `border-${node.color}/50 bg-${node.color}/10 shadow-[var(--shadow-soft)]`
                    : node.value
                      ? 'border-border bg-card hover:border-primary/30'
                      : 'border-dashed border-border/60 bg-card/60 hover:border-primary/30'
                }`}
              >
                <span className="text-lg">{node.emoji}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{node.label}</span>
                {node.value && !isEditing && (
                  <span className="text-[9px] text-foreground font-medium px-1 text-center leading-tight line-clamp-2 max-w-[76px]">
                    {node.value.slice(0, 30)}
                  </span>
                )}
                {!node.value && !isEditing && (
                  <Edit3 className="w-3 h-3 text-muted-foreground/40 mt-0.5" />
                )}
              </button>
            </motion.div>
          );
        })}

        {/* Center label */}
        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest text-center">Loop</p>
        </div>
      </div>

      {/* Edit panel */}
      <AnimatePresence mode="wait">
        {editingId && (
          <motion.div
            key={editingId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            {(() => {
              const node = nodes.find(n => n.id === editingId)!;
              return (
                <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{node.emoji}</span>
                      <span className="text-sm font-bold">{node.label}</span>
                    </div>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <textarea
                    value={node.value}
                    onChange={e => updateNode(node.id, e.target.value)}
                    placeholder={node.placeholder}
                    rows={2}
                    autoFocus
                    className="w-full p-3 rounded-xl bg-background border border-border/50 text-sm outline-none resize-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filled loop summary */}
      {nodes.every(n => n.value) && !editingId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-compass/10 via-card to-card border border-compass/15 shadow-[var(--shadow-card)]"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Your Loop</p>
          <div className="space-y-2">
            {nodes.map((node, i) => (
              <div key={node.id} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 mt-0.5">{node.emoji}</span>
                <div>
                  <span className="font-semibold text-muted-foreground">{node.label}:</span>{' '}
                  <span className="text-foreground">{node.value}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-foreground leading-relaxed">
              💡 Now that you can see the loop — where could you intervene? Tap any node to rewrite it.
            </p>
          </div>
        </motion.div>
      )}

      {/* Reset */}
      {nodes.some(n => n.value) && (
        <button
          onClick={handleReset}
          className="w-full py-3 rounded-2xl border border-border/50 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Start a New Loop
        </button>
      )}

      {/* Guidance for empty state */}
      {nodes.every(n => !n.value) && recentTriggers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Tap any node in the circle to start mapping your behavior loop,
            or log a trigger first in Compass.
          </p>
        </div>
      )}
    </div>
  );
}
