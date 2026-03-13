import { Youtube, Music } from 'lucide-react';

export default function MediaSourceBadges() {
  const hasYouTube = typeof window !== 'undefined' && (!!localStorage.getItem('ib_youtube_channel') || !!localStorage.getItem('ib_youtube_playlist'));
  const hasSpotifyPlaylist = typeof window !== 'undefined' && !!localStorage.getItem('ib_spotify_playlist');
  const hasSpotifyArtist = typeof window !== 'undefined' && !!localStorage.getItem('ib_spotify_artist');
  const hasSpotify = hasSpotifyPlaylist || hasSpotifyArtist;

  if (!hasYouTube && !hasSpotify) return null;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mr-0.5">Sources</span>
      {hasYouTube && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive text-[9px] font-semibold">
          <Youtube className="w-2.5 h-2.5" />
          YT
        </span>
      )}
      {hasSpotify && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-semibold">
          <Music className="w-2.5 h-2.5" />
          Spotify
        </span>
      )}
    </div>
  );
}
