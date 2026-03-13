import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './appStore';
import { calculateStreak } from './analytics';
import { callReflect, streamReflectChat } from './reflectService';
import { ChevronLeft, Sparkles, Send, Brain, Loader2 } from 'lucide-react';
import ListenButton from './ListenButton';
import MediaSourceBadges from './MediaSourceBadges';
import Fireflies from './Fireflies';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ReflectPage() {
  const navigate = useNavigate();
  const { entries, groundingSessions } = useAppStore();
  const streak = calculateStreak(entries.map(e => e.entryDatetime));

  const [weeklyReflection, setWeeklyReflection] = useState<string | null>(null);
  const [identityShift, setIdentityShift] = useState<string | null>(null);
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [loadingIdentity, setLoadingIdentity] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const regulationHistory = useMemo(() => 
    entries.filter(e => e.regulationState).map(e => e.regulationState!),
    [entries]
  );

  useEffect(() => {
    if (entries.length < 3) return;
    setLoadingReflection(true);

    const last7 = entries.filter(e => {
      const d = new Date(e.entryDatetime);
      const week = new Date();
      week.setDate(week.getDate() - 7);
      return d >= week;
    });

    if (last7.length === 0) {
      setLoadingReflection(false);
      return;
    }

    callReflect({
      type: 'weekly_reflection',
      entries: last7,
      streak,
      regulationHistory,
    })
      .then(setWeeklyReflection)
      .catch(e => toast.error(e.message))
      .finally(() => setLoadingReflection(false));
  }, []);

  useEffect(() => {
    if (entries.length < 10) return;
    setLoadingIdentity(true);
    callReflect({
      type: 'identity_shift',
      entries,
      streak,
    })
      .then(setIdentityShift)
      .catch(e => toast.error(e.message))
      .finally(() => setLoadingIdentity(false));
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    let assistantContent = '';

    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      await streamReflectChat(
        {
          type: 'chat',
          entries: entries.slice(0, 15),
          streak,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        },
        upsert,
        () => setStreaming(false),
      );
    } catch (e: any) {
      toast.error(e.message || 'Failed to get response');
      setStreaming(false);
    }
  }, [input, streaming, messages, entries, streak]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in flex flex-col relative" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      {/* Organic animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/15 animate-drift animate-morph" style={{ filter: 'blur(55px)' }} />
        <div className="absolute -top-10 -right-24 w-64 h-64 rounded-full bg-lavender/12 animate-drift-reverse animate-morph-alt" style={{ filter: 'blur(50px)' }} />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-warm/12 animate-float-slow animate-morph" style={{ filter: 'blur(55px)' }} />
        <div className="absolute bottom-20 -left-16 w-60 h-60 rounded-full bg-sky/10 animate-float-reverse animate-morph-alt" style={{ filter: 'blur(55px)' }} />
        <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-sage-light/20 animate-drift animate-morph" style={{ filter: 'blur(50px)' }} />
      </div>
      <Fireflies />
      {/* Header */}
      <div className="flex items-center gap-3 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold">Reflect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI reads your data. Tells you what it sees.
          </p>
        </div>
      </div>

      {entries.length < 3 ? (
        <div className="text-center py-16 flex-1 flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">🧭</div>
          <p className="text-foreground font-serif text-lg font-semibold">Keep checking in</p>
          <p className="text-sm text-muted-foreground mt-2">
            Log at least 3 check-ins and the AI will start reading your patterns
          </p>
        </div>
      ) : (
        <>
          {/* Weekly Reflection Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider">Weekly Read</h2>
              </div>
              {weeklyReflection && <ListenButton text={weeklyReflection} />}
            </div>
            {loadingReflection ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground ml-2">Reading your week...</span>
              </div>
            ) : weeklyReflection ? (
              <>
                <p className="text-sm text-foreground leading-relaxed font-serif whitespace-pre-line">
                  {weeklyReflection}
                </p>
                <MediaSourceBadges />
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No check-ins this week to analyze yet.</p>
            )}
          </motion.div>

          {/* Identity Shift */}
          {(loadingIdentity || identityShift) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-accent/8 via-card to-card border border-accent/15 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <h2 className="text-xs font-bold text-accent uppercase tracking-wider">Who You're Becoming</h2>
                </div>
                {identityShift && <ListenButton text={identityShift} />}
              </div>
              {loadingIdentity ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  <span className="text-xs text-muted-foreground ml-2">Seeing your growth...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground leading-relaxed font-serif">
                    {identityShift}
                  </p>
                  <MediaSourceBadges />
                </>
              )}
            </motion.div>
          )}

          {/* Chat section */}
          <div className="flex-1 flex flex-col">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Ask about your patterns
            </h2>

            <div className="flex-1 space-y-3 mb-4 min-h-[120px]">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">
                    Ask anything about your patterns, triggers, or progress
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    {[
                      "What's setting me off?",
                      "Am I getting more level?",
                      "What days are hardest?",
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl max-w-[85%] ${
                    msg.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-card border border-border/50 shadow-[var(--shadow-card)]'
                  }`}
                >
                  <p className={`text-sm leading-relaxed ${
                    msg.role === 'assistant' ? 'font-serif' : ''
                  }`}>
                    {msg.content}
                    {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                      <span className="inline-block w-1.5 h-4 bg-primary/60 ml-0.5 animate-pulse" />
                    )}
                  </p>
                  {msg.role === 'assistant' && !streaming && msg.content && (
                    <div className="mt-2">
                      <ListenButton text={msg.content} />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your patterns..."
                className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={streaming}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                className="p-3 rounded-2xl bg-primary text-primary-foreground disabled:opacity-50 active:scale-95 transition-all"
              >
                {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
