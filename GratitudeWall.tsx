import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, Heart, Sparkles, Pencil, Check, X, RefreshCw } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { fireStars } from '@/lib/confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface WallPost {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
}

export default function GratitudeWallPage() {
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('gratitude_wall_safe' as any)
      .select('id, message, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) setPosts(data as unknown as WallPost[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });

    fetchPosts();

    // Poll every 30s for new posts (safe view only, no user_id leak)
    const interval = setInterval(fetchPosts, 30_000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    haptics.medium();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('gratitude_wall')
      .insert({ message: trimmed, user_id: authData.user.id } as never);

    if (!error) {
      setMessage('');
      haptics.celebration();
      fireStars();
      // Refresh from safe view to get the new post with proper user_id masking
      await fetchPosts();
    }
    setSubmitting(false);
  };

  const handleEdit = (post: WallPost) => {
    setEditingId(post.id);
    setEditText(post.message);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || saving || !editingId) return;
    if (trimmed.length > 280) return;

    setSaving(true);
    const { error } = await supabase
      .from('gratitude_wall')
      .update({ message: trimmed } as never)
      .eq('id', editingId);

    if (!error) {
      setPosts(prev => prev.map(p => p.id === editingId ? { ...p, message: trimmed } : p));
      haptics.light();
    }
    setEditingId(null);
    setEditText('');
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">The Wall</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Anonymous wins shared by people like you
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-95"
          aria-label="Refresh posts"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Intro */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-sage-light/40 via-card to-card border border-primary/10 mb-6 shadow-[var(--shadow-card)]">
        <p className="text-sm leading-relaxed text-foreground/85">
          Small wins count. A good shift. A tough day you got through. A moment you stayed level 
          when you normally wouldn't. Share it — anonymously — and remind someone else they're not alone.
        </p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Today I…"
            maxLength={280}
            className="flex-1 px-4 py-3 rounded-2xl bg-card border border-border/50 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-[var(--shadow-card)]"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold flex items-center gap-2 active:scale-[0.96] transition-all duration-200 shadow-[var(--shadow-glow-primary)] disabled:opacity-50 disabled:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
          {message.length}/280 · completely anonymous
        </p>
      </div>

      {/* Wall */}
      <div ref={listRef} className="space-y-2.5">
        {loading ? (
          <div className="text-center py-12">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading the wall…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-8 h-8 text-primary/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Be the first to post a win.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post, i) => {
              const isOwn = post.user_id === currentUserId;
              const isEditing = editingId === post.id;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i < 10 ? i * 0.03 : 0 }}
                  className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        maxLength={280}
                        rows={2}
                        autoFocus
                        className="w-full px-3 py-2 rounded-xl bg-background border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {editText.length}/280
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim() || saving}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-relaxed flex-1">{post.message}</p>
                        {isOwn && (
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-1 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-all shrink-0 mt-0.5"
                            aria-label="Edit post"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {formatTime(post.created_at)}
                      </p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {posts.length > 0 && (
        <p className="text-center text-[10px] text-muted-foreground mt-6 pb-4">
          🔧 {posts.length} win{posts.length !== 1 ? 's' : ''} shared
        </p>
      )}
    </div>
  );
}
