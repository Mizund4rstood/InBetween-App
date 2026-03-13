import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingDown, Leaf, BarChart3 } from 'lucide-react';
import { useTimeOnDeviceStore } from '@/stores/timeOnDeviceStore';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en', { weekday: 'short' });
}

const HEALTHY_DAILY_LIMIT = 20 * 60; // 20 minutes in seconds

export default function TimeOnDevice() {
  const { getTodaySeconds, getWeekSeconds, getLast7Days } = useTimeOnDeviceStore();
  const [now, setNow] = useState(Date.now());

  // Refresh every 10 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const todaySec = getTodaySeconds();
  const weekSec = getWeekSeconds();
  const last7 = getLast7Days();
  const maxDay = Math.max(...last7.map((d) => d.totalSeconds), HEALTHY_DAILY_LIMIT);
  const avgDaily = Math.round(weekSec / 7);
  const isHealthy = todaySec <= HEALTHY_DAILY_LIMIT;

  return (
    <div className="p-5 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${isHealthy ? 'bg-primary/15' : 'bg-accent/15'}`}>
          <Clock className={`w-5 h-5 ${isHealthy ? 'text-primary' : 'text-accent'}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Time in App</h3>
          <p className="text-[10px] text-muted-foreground">Healthy usage awareness</p>
        </div>
      </div>

      {/* Today's time */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Today</p>
          <p className="text-2xl font-serif font-bold text-foreground">{formatTime(todaySec)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">7-day avg</p>
          <p className="text-lg font-serif font-bold text-muted-foreground">{formatTime(avgDaily)}</p>
        </div>
      </div>

      {/* Progress toward healthy limit */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground">Daily mindful limit</span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {formatTime(todaySec)} / {formatTime(HEALTHY_DAILY_LIMIT)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((todaySec / HEALTHY_DAILY_LIMIT) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              todaySec > HEALTHY_DAILY_LIMIT
                ? 'bg-accent'
                : todaySec > HEALTHY_DAILY_LIMIT * 0.75
                ? 'bg-yellow-500'
                : 'bg-primary'
            }`}
          />
        </div>
      </div>

      {/* 7-day bar chart */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-semibold">Last 7 days</span>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {last7.map((day) => {
            const pct = maxDay > 0 ? (day.totalSeconds / maxDay) * 100 : 0;
            const isToday = day.date === new Date().toISOString().slice(0, 10);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 4)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  className={`w-full rounded-t-md ${
                    isToday
                      ? day.totalSeconds > HEALTHY_DAILY_LIMIT
                        ? 'bg-accent'
                        : 'bg-primary'
                      : 'bg-muted-foreground/20'
                  }`}
                />
                <span className={`text-[8px] ${isToday ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                  {getDayLabel(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mindful message */}
      <div className={`flex items-start gap-2 p-3 rounded-xl border ${
        isHealthy
          ? 'bg-primary/5 border-primary/15'
          : 'bg-accent/5 border-accent/15'
      }`}>
        {isHealthy ? (
          <Leaf className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        ) : (
          <TrendingDown className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        )}
        <p className="text-[11px] text-foreground/80 leading-relaxed">
          {isHealthy
            ? "You're using the app mindfully. Tools work best in short, intentional sessions."
            : "You've been here a while today. Consider taking what you've learned into the real world. The pause exists out there too."
          }
        </p>
      </div>
    </div>
  );
}
