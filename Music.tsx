import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Waves, Sparkles, Headphones, Play, Pause, Square, Loader2, Volume2, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Button } from './button';
import { Slider } from './slider';
import { haptics } from './haptics';
import { useAmbientStore, SOUNDSCAPES } from './ambientStore';



// ─── AI Music Tab ────────────────────────────────────────────

const AI_PRESETS = [
  { label: 'Calm Focus', prompt: 'Calm ambient lo-fi music for deep focus and concentration, soft piano and synth pads, no vocals, peaceful and meditative' },
  { label: 'Morning Energy', prompt: 'Uplifting morning music with gentle acoustic guitar, warm keys, and light percussion, positive and motivating' },
  { label: 'Night Wind Down', prompt: 'Slow gentle ambient music for winding down at night, soft drones and light bells, very relaxing' },
  { label: 'Nature Meditation', prompt: 'Ethereal meditation music inspired by nature, flowing water sounds mixed with gentle synth, peaceful' },
];

function AIMusic() {
  const [generating, setGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const generate = useCallback(async (prompt: string) => {
    setGenerating(true);
    setError(null);
    setAudioUrl(null);
    setIsPlaying(false);
    haptics.light();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, duration: 30, type: 'music' }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Generation failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate');
    } finally {
      setGenerating(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Generate unique relaxation and focus tracks with AI.</p>

      <div className="grid grid-cols-2 gap-2">
        {AI_PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => generate(p.prompt)}
            disabled={generating}
            className="p-3 rounded-xl bg-card border border-border/50 text-left hover:border-primary/30 transition-all text-sm font-medium text-foreground disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent mb-1" />
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Describe your ideal music..."
          className="flex-1 px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
        <Button
          size="sm"
          onClick={() => customPrompt.trim() && generate(customPrompt)}
          disabled={generating || !customPrompt.trim()}
          className="rounded-xl"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </Button>
      </div>

      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
        >
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div>
            <p className="text-sm font-medium text-foreground">Generating your track...</p>
            <p className="text-xs text-muted-foreground">This may take 15–30 seconds</p>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border/50 space-y-3"
        >
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Generated Track</p>
              <p className="text-xs text-muted-foreground">30s · Tap play to listen</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Spotify Tab ─────────────────────────────────────────────

const CURATED_PLAYLISTS = [
  { name: 'Peaceful Piano', id: '37i9dQZF1DX4sWSpwq3LiO', emoji: '🎹' },
  { name: 'Deep Focus', id: '37i9dQZF1DWZeKCadgRdKQ', emoji: '🧠' },
  { name: 'Nature Sounds', id: '37i9dQZF1DX4PP3DA4J0N8', emoji: '🌿' },
  { name: 'Calm Vibes', id: '37i9dQZF1DX3Ogo9pFvBkY', emoji: '🕊️' },
  { name: 'Lo-Fi Beats', id: '37i9dQZF1DWWQRwui0ExPn', emoji: '🎧' },
  { name: 'Sleep', id: '37i9dQZF1DWZd79rJ6a7lp', emoji: '💤' },
];

function SpotifyTab() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Curated playlists for mindfulness, focus, and recovery. Opens in Spotify.
      </p>

      <div className="space-y-2">
        {CURATED_PLAYLISTS.map(pl => (
          <a
            key={pl.id}
            href={`https://open.spotify.com/playlist/${pl.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
          >
            <span className="text-xl">{pl.emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{pl.name}</p>
              <p className="text-xs text-muted-foreground">Spotify Playlist</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Main Music Page ─────────────────────────────────────────

export default function MusicPage() {
  const ambient = useAmbientStore();

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Music2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground font-display">Music & Sounds</h1>
          <p className="text-xs text-muted-foreground">Calm your mind with sound</p>
        </div>
      </div>

      <Tabs defaultValue="ambient" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl h-11">
          <TabsTrigger value="ambient" className="rounded-lg text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Waves className="w-3.5 h-3.5 mr-1" />
            Ambient
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg text-xs font-bold data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI Music
          </TabsTrigger>
          <TabsTrigger value="spotify" className="rounded-lg text-xs font-bold data-[state=active]:bg-[hsl(141,73%,42%)] data-[state=active]:text-primary-foreground">
            <Headphones className="w-3.5 h-3.5 mr-1" />
            Spotify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ambient" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {SOUNDSCAPES.map(scape => {
              const isActive = ambient.playing === scape.id;
              return (
                <motion.button
                  key={scape.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => isActive ? ambient.stop() : ambient.play(scape)}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary/30 shadow-sm'
                      : 'bg-card border-border/50 hover:border-primary/20'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="ambient-active"
                      className="absolute inset-0 rounded-xl bg-primary/5 border border-primary/20"
                    />
                  )}
                  <span className="text-xl relative z-10">{scape.emoji}</span>
                  <p className="text-sm font-semibold text-foreground mt-1.5 relative z-10">{scape.name}</p>
                  <p className="text-[10px] text-muted-foreground relative z-10">{scape.description}</p>
                  {isActive && (
                    <div className="flex gap-0.5 mt-2 relative z-10">
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-primary"
                          animate={{ height: [4, 12, 4] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {ambient.playing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
            >
              <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <Slider
                value={[ambient.volume * 100]}
                onValueChange={([v]) => ambient.setVolume(v / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <Button size="sm" variant="ghost" onClick={ambient.stop} className="h-8 w-8 p-0">
                <Square className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AIMusic />
        </TabsContent>

        <TabsContent value="spotify" className="mt-4">
          <SpotifyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
