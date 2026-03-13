import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`;

// In-memory LRU cache: "voiceId::text" → blob URL (max 20 entries)
const MAX_CACHE_SIZE = 20;
const audioCache = new Map<string, string>();
const cacheKey = (voice: string, text: string) => `${voice}::${text}`;

function cacheSet(key: string, url: string) {
  if (audioCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (first inserted)
    const oldest = audioCache.keys().next().value!;
    URL.revokeObjectURL(audioCache.get(oldest)!);
    audioCache.delete(oldest);
  }
  audioCache.set(key, url);
}

interface UseTTSOptions {
  voiceId?: string; // Custom cloned voice ID
}

export function useTTS(options: UseTTSOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any current playback
    stop();
    setError(null);
    setIsLoading(true);
    setIsCached(false);

    // Create & unlock Audio element synchronously in user-gesture context
    // so mobile Safari allows playback after async operations
    const audio = new Audio();
    audio.preload = "auto";
    audio.play().catch(() => {}); // unlock for iOS
    audioRef.current = audio;

    try {
      const voice = options.voiceId || 'JBFqnCBsd6RMkjVDRZzb';
      const key = cacheKey(voice, text);
      let audioUrl = audioCache.get(key);
      const wasCached = !!audioUrl;
      setIsCached(wasCached);

      if (!audioUrl) {
        // Clean up previous non-cached URL
        if (urlRef.current && !audioCache.has(urlRef.current)) {
          URL.revokeObjectURL(urlRef.current);
        }
        urlRef.current = null;

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const response = await fetch(TTS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, voiceId: voice }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'TTS failed' }));
          throw new Error(err.error || `TTS request failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        cacheSet(key, audioUrl);
      }

      urlRef.current = audioUrl;

      // Set source on the already-unlocked element and play
      audio.src = audioUrl;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Playback failed');
      };

      await audio.play();
    } catch (e) {
      console.error('TTS error:', e);
      setError(e instanceof Error ? e.message : 'TTS failed');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [options.voiceId, stop]);

  return { speak, stop, isPlaying, isLoading, isCached, error };
}
