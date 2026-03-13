import { useState } from 'react';
import { useAppStore } from './appStore';
import { formatDate, formatTime } from './analytics';
import { Calendar, List, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

type View = 'list' | 'calendar';

export default function LogPage() {
  const [view, setView] = useState<View>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { entries, deleteEntry } = useAppStore();

  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const day = entry.entryDatetime.split('T')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});
  const sortedDays = Object.keys(grouped).sort().reverse();

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const entryDates = new Set(entries.map(e => e.entryDatetime.split('T')[0]));

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">Bearings Log</h1>
        <div className="flex bg-muted/60 rounded-xl p-1 shadow-inner">
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all duration-200 ${view === 'list' ? 'bg-card shadow-[var(--shadow-card)]' : 'text-muted-foreground'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-lg transition-all duration-200 ${view === 'calendar' ? 'bg-card shadow-[var(--shadow-card)]' : 'text-muted-foreground'}`}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'calendar' && (
        <div className="mb-6 animate-fade-in p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 rounded-xl hover:bg-muted text-sm font-bold transition-colors">‹</button>
            <span className="font-serif font-bold text-lg">
              {new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-2 rounded-xl hover:bg-muted text-sm font-bold transition-colors">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-xs text-muted-foreground font-semibold py-1">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEntry = entryDates.has(dateStr);
              const isToday = dateStr === now.toISOString().split('T')[0];
              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm relative transition-all ${
                    isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
                  } ${hasEntry ? 'bg-primary/15 text-primary font-bold' : 'text-foreground hover:bg-muted/50'}`}
                >
                  {day}
                  {hasEntry && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-primary/5 blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-4xl mb-4 animate-float">🧭</div>
            <p className="text-foreground font-serif text-lg font-semibold">No check-ins yet</p>
            <p className="text-sm text-muted-foreground mt-1">Head to Home and check your bearings</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDays.map(day => (
            <div key={day}>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {formatDate(day + 'T00:00:00')}
              </h3>
              <div className="space-y-2">
                {grouped[day].map(entry => {
                  const isExpanded = expandedId === entry.id;
                  return (
                    <div key={entry.id} className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-200">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="w-full p-4 text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-muted-foreground font-medium">{formatTime(entry.entryDatetime)}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">😊 {entry.mood}</span>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">😰 {entry.stress}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 animate-fade-in">
                          <div className="h-px bg-border/50 mb-3" />
                          <ul className="space-y-3 mb-3">
                            {entry.items.map(item => (
                              <li key={item.id} className="text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-primary mt-0.5 text-lg leading-none">·</span>
                                  <span className="font-medium">{item.text}</span>
                                </div>
                                {(item.emotion || item.bodyLocation || item.belief) && (
                                  <div className="ml-5 mt-1.5 space-y-1">
                                    {item.emotion && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="text-primary">♥</span> {item.emotion}
                                      </p>
                                    )}
                                    {item.bodyLocation && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="text-accent">◉</span> Felt in {item.bodyLocation.toLowerCase()}
                                      </p>
                                    )}
                                    {item.belief && (
                                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="text-primary">✦</span> "{item.belief}"
                                      </p>
                                    )}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                          {entry.note && (
                            <p className="text-sm text-muted-foreground italic mb-3 pl-1">"{entry.note}"</p>
                          )}
                          <button
                            onClick={() => deleteEntry(entry.id)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
