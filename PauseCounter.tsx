import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from './client';
import { useAuth } from './useAuth';
import { Pause, ArrowRight } from 'lucide-react';

export default function PauseCounter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    Promise.all([
      supabase
        .from('pause_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString()),
      supabase
        .from('pause_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString()),
    ]).then(([todayRes, weekRes]) => {
      setTodayCount(todayRes.count || 0);
      setWeekCount(weekRes.count || 0);
      setLoading(false);
    });
  }, [user]);

  const getMessage = () => {
    if (todayCount === 0 && weekCount === 0) return "Every pause is a choice to be present.";
    if (todayCount === 0) return `${weekCount} pauses this week. Ready for today's first?`;
    if (todayCount === 1) return "You paused once today. That moment mattered.";
    if (todayCount === 2) return "Two pauses today. You're building a pattern.";
    if (todayCount <= 5) return `Today you paused ${todayCount} times. That's awareness in action.`;
    return `${todayCount} pauses today. You're choosing awareness over autopilot.`;
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/pause')}
      className="w-full p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-primary/15 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-300 text-left"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-primary/12 shrink-0">
          <Pause className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-serif font-bold text-foreground">
              {loading ? '—' : todayCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {todayCount === 1 ? 'pause today' : 'pauses today'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {getMessage()}
          </p>
          {weekCount > 0 && !loading && (
            <p className="text-[10px] text-primary/60 mt-1.5 font-medium">
              {weekCount} this week
            </p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 mt-2 shrink-0" />
      </div>
    </motion.button>
  );
}
