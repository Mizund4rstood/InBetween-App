import { Volume2, VolumeX, Loader2, Zap } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import { useAppStore } from '@/stores/appStore';

interface ListenButtonProps {
  text: string;
  voiceId?: string;
  size?: 'sm' | 'md';
}

/**
 * Inline "Listen" button — plays AI text aloud via ElevenLabs TTS.
 * Pass a custom voiceId for cloned voice, or uses default.
 */
export default function ListenButton({ text, voiceId, size = 'sm' }: ListenButtonProps) {
  const { isTTSEnabled, selectedVoiceId } = useAppStore();
  const { speak, stop, isPlaying, isLoading, isCached } = useTTS({ voiceId: voiceId || selectedVoiceId });

  if (!isTTSEnabled) return null;

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 ${padding} rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-[0.95] ${
        isPlaying
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50'
      }`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSize} />
      ) : (
        <Volume2 className={iconSize} />
      )}
      {isPlaying ? 'Stop' : 'Listen'}
      {isPlaying && isCached && (
        <span title="Played from cache"><Zap className="w-2.5 h-2.5 text-primary/60" /></span>
      )}
    </button>
  );
}
