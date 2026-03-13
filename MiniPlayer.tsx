import { motion, AnimatePresence } from 'framer-motion';
import { Square, Volume2, Music2 } from 'lucide-react';
import { useAmbientStore, SOUNDSCAPES } from '@/stores/ambientStore';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function MiniPlayer() {
  const playing = useAmbientStore(s => s.playing);
  const volume = useAmbientStore(s => s.volume);
  const stop = useAmbientStore(s => s.stop);
  const setVolume = useAmbientStore(s => s.setVolume);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const scape = SOUNDSCAPES.find(s => s.id === playing);

  return (
    <AnimatePresence>
      {scape && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-[5.5rem] left-3 right-3 z-40"
        >
          <div className="glass-strong rounded-xl border border-border/30 shadow-[var(--shadow-elevated)] overflow-hidden">
            <div
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              {/* Animated bars */}
              <div className="flex gap-[3px] items-end h-4 shrink-0">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-primary"
                    animate={{ height: [4, 14, 4] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.2 }}
                  />
                ))}
              </div>

              <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); navigate('/music'); }}>
                <p className="text-xs font-bold text-foreground truncate">{scape.emoji} {scape.name}</p>
                <p className="text-[10px] text-muted-foreground">Playing · Tap to open</p>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0"
                onClick={(e) => { e.stopPropagation(); stop(); }}
              >
                <Square className="w-3 h-3" />
              </Button>
            </div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-3 pb-2.5">
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Slider
                      value={[volume * 100]}
                      onValueChange={([v]) => setVolume(v / 100)}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
