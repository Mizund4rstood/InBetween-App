import { useState, useRef, useEffect } from 'react';
import { supabase } from './client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Plus, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { haptics } from './haptics';

interface FutureSelfMessage {
  id: string;
  user_id: string;
  title: string;
  storage_path: string;
  duration_seconds: number | null;
  context: string | null;
  created_at: string;
}

interface FutureSelfRecorderProps {
  onRecorded?: () => void;
  context?: string;
}

export function FutureSelfRecorder({ onRecorded, context = 'general' }: FutureSelfRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      haptics.medium();

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      toast.error('Microphone access required');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      haptics.light();
    }
  };

  const playPreview = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const saveMessage = async () => {
    if (!audioBlob) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${Date.now()}.webm`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('future-self')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (uploadError) throw uploadError;

      // Save metadata
      const { error: dbError } = await supabase
        .from('future_self_messages')
        .insert({
          user_id: user.id,
          storage_path: fileName,
          duration_seconds: duration,
          context,
          title: `Message to myself`,
        });

      if (dbError) throw dbError;

      toast.success('Message saved for your future self');
      haptics.celebration();
      discardRecording();
      onRecorded?.();
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save message');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-accent/10 via-card to-card border border-accent/15 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-accent/10">
          <MessageCircle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Future Self Message</h3>
          <p className="text-xs text-muted-foreground">Record a message to play when you need it</p>
        </div>
      </div>

      {!audioBlob ? (
        <div className="text-center py-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
              isRecording
                ? 'bg-destructive/20 animate-pulse'
                : 'bg-accent/10 hover:bg-accent/20'
            }`}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-destructive" />
            ) : (
              <Mic className="w-8 h-8 text-accent" />
            )}
          </button>
          <p className="text-sm font-medium">
            {isRecording ? formatTime(duration) : 'Tap to record'}
          </p>
          {!isRecording && (
            <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
              "If you're opening this because you want to drink, remember: tomorrow morning matters."
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <audio
            ref={audioRef}
            src={audioUrl!}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/50">
            <button
              onClick={playPreview}
              className="p-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-accent" />
              ) : (
                <Play className="w-5 h-5 text-accent" />
              )}
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium">Your message</p>
              <p className="text-xs text-muted-foreground">{formatTime(duration)}</p>
            </div>
            <button
              onClick={discardRecording}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={saveMessage}
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Save for Future Self</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

interface FutureSelfPlayerProps {
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function FutureSelfPlayer({ autoPlay = false, onComplete }: FutureSelfPlayerProps) {
  const [messages, setMessages] = useState<FutureSelfMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('future_self_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setMessages((data as FutureSelfMessage[]) || []);
    setLoading(false);

    // Auto-play most recent if requested
    if (autoPlay && data && data.length > 0) {
      playMessage(data[0] as FutureSelfMessage);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const playMessage = async (msg: FutureSelfMessage) => {
    try {
      const { data } = await supabase.storage
        .from('future-self')
        .createSignedUrl(msg.storage_path, 3600);

      if (data?.signedUrl) {
        setCurrentUrl(data.signedUrl);
        setPlaying(msg.id);
        haptics.light();
      }
    } catch (err) {
      console.error('Play error:', err);
      toast.error('Could not play message');
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(null);
    setCurrentUrl(null);
  };

  const deleteMessage = async (msg: FutureSelfMessage) => {
    try {
      await supabase.storage.from('future-self').remove([msg.storage_path]);
      await supabase.from('future_self_messages').delete().eq('id', msg.id);
      setMessages(m => m.filter(x => x.id !== msg.id));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Could not delete');
    }
  };

  useEffect(() => {
    if (currentUrl && audioRef.current) {
      audioRef.current.src = currentUrl;
      audioRef.current.play();
    }
  }, [currentUrl]);

  const formatTime = (secs: number | null) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <audio
        ref={audioRef}
        onEnded={() => {
          setPlaying(null);
          onComplete?.();
        }}
      />

      <AnimatePresence>
        {messages.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
          >
            <button
              onClick={() => playing === msg.id ? stopPlaying() : playMessage(msg)}
              className={`p-2.5 rounded-xl transition-colors ${
                playing === msg.id 
                  ? 'bg-accent/20 animate-pulse' 
                  : 'bg-accent/10 hover:bg-accent/20'
              }`}
            >
              {playing === msg.id ? (
                <Pause className="w-5 h-5 text-accent" />
              ) : (
                <Play className="w-5 h-5 text-accent" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Message to yourself</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(msg.duration_seconds)} • {new Date(msg.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => deleteMessage(msg)}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function FutureSelfCard() {
  const [showRecorder, setShowRecorder] = useState(false);
  const [messages, setMessages] = useState<FutureSelfMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('future_self_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    setMessages((data as FutureSelfMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-lavender/10 via-card to-card border border-lavender/15 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lavender/10">
            <MessageCircle className="w-5 h-5 text-lavender" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Future Self</h3>
            <p className="text-xs text-muted-foreground">Messages for when you need them</p>
          </div>
        </div>
        <button
          onClick={() => setShowRecorder(!showRecorder)}
          className="p-2 rounded-xl bg-lavender/10 hover:bg-lavender/20 transition-colors"
        >
          <Plus className={`w-4 h-4 text-lavender transition-transform ${showRecorder ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showRecorder && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <FutureSelfRecorder onRecorded={() => {
              setShowRecorder(false);
              fetchMessages();
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && messages.length === 0 && !showRecorder && (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎙️</p>
          <p className="text-sm text-muted-foreground">
            Record a message to your future self — it'll play when you need it most.
          </p>
          <button
            onClick={() => setShowRecorder(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-lavender/10 hover:bg-lavender/20 text-lavender text-sm font-medium transition-colors"
          >
            Record Your First Message
          </button>
        </div>
      )}

      {messages.length > 0 && <FutureSelfPlayer />}
    </div>
  );
}
