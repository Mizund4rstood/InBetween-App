import { useEffect, useState } from 'react';
import { useCompassStore, CompassTrigger } from '@/stores/compassStore';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function TriggerHistoryPage() {
  const { triggers, choices, fetchTriggers, fetchChoices, deleteTrigger, loading } = useCompassStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTriggers();
    fetchChoices();
  }, []);

  const getChoicesForTrigger = (triggerId: string) =>
    choices.filter(c => c.trigger_id === triggerId);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <h1 className="text-3xl font-serif font-bold">Trigger Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Your trigger → choice history</p>
      </div>

      {triggers.length === 0 && !loading ? (
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-compass/5 blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-4xl mb-4 animate-float">📋</div>
            <p className="text-foreground font-serif text-lg font-semibold">No triggers logged yet</p>
            <p className="text-sm text-muted-foreground mt-1">Log a trigger to start tracking patterns</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {triggers.map(trigger => {
            const isExpanded = expandedId === trigger.id;
            const triggerChoices = getChoicesForTrigger(trigger.id);
            return (
              <div key={trigger.id} className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden shadow-[var(--shadow-card)]">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : trigger.id)}
                  className="w-full p-4 text-left flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{trigger.trigger_text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">{formatTime(trigger.created_at)}</span>
                      {trigger.emotion && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-compass/10 text-compass font-semibold">{trigger.emotion}</span>
                      )}
                      {trigger.intensity && (
                        <span className="text-xs text-muted-foreground">⚡{trigger.intensity}/10</span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="h-px bg-border/50 mb-3" />
                    {trigger.category && (
                      <p className="text-xs text-muted-foreground mb-2">Category: <span className="font-semibold text-foreground">{trigger.category}</span></p>
                    )}
                    {trigger.context && (
                      <p className="text-xs text-muted-foreground mb-3 italic">"{trigger.context}"</p>
                    )}
                    {triggerChoices.length > 0 && (
                      <div className="mb-3 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Response</p>
                        {triggerChoices.map(c => (
                          <div key={c.id} className="p-3 rounded-xl bg-background border border-border/30">
                            <p className="text-sm">{c.choice_text}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {c.aligned_with_values && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">✓ Values-aligned</span>
                              )}
                              {c.pause_used && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-compass/10 text-compass font-semibold">⏸ Paused</span>
                              )}
                              {c.outcome_rating != null && (
                                <span className="text-[10px] text-muted-foreground">Outcome: {c.outcome_rating}/10</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => deleteTrigger(trigger.id)}
                      className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
