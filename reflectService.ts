import { supabase } from './client';
import { GratitudeEntry, GroundingSession } from './types';

const REFLECT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reflect`;
const YOUTUBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-data`;
const SPOTIFY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify-data`;

interface YouTubeReflectData {
  channelTitle?: string;
  recentVideos?: { title: string; description?: string; publishedAt?: string }[];
  playlistTitle?: string;
  playlistVideos?: { title: string; description?: string; channelTitle?: string }[];
}

interface SpotifyReflectData {
  playlistName?: string;
  tracks?: { name: string; artists: string }[];
  artistName?: string;
  genres?: string[];
  topTracks?: { name: string }[];
}

interface ReflectPayload {
  type: 'weekly_reflection' | 'predictive_nudge' | 'adaptive_grounding' | 'identity_shift' | 'rewire_reflection' | 'chat';
  entries?: GratitudeEntry[];
  streak?: number;
  regulationHistory?: string[];
  groundingSessions?: GroundingSession[];
  messages?: { role: string; content: string }[];
  youtubeData?: YouTubeReflectData;
  spotifyData?: SpotifyReflectData;
}

async function fetchYouTubeContext(token: string): Promise<YouTubeReflectData | undefined> {
  const channelId = localStorage.getItem('ib_youtube_channel');
  const playlistId = localStorage.getItem('ib_youtube_playlist');
  if (!channelId && !playlistId) return undefined;

  const result: YouTubeReflectData = {};
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  try {
    const fetches: Promise<void>[] = [];

    if (channelId) {
      fetches.push(
        fetch(YOUTUBE_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'channel', channelId, maxResults: 15 }),
        }).then(async (resp) => {
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.error || !data.channel) return;
          result.channelTitle = data.channel.title;
          result.recentVideos = (data.recentVideos || []).map((v: any) => ({
            title: v.title,
            description: v.description?.slice(0, 200),
            publishedAt: v.publishedAt,
          }));
        })
      );
    }

    if (playlistId) {
      fetches.push(
        fetch(YOUTUBE_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'playlist', playlistId, maxResults: 15 }),
        }).then(async (resp) => {
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.error || !data.playlist) return;
          result.playlistTitle = data.playlist.title;
          result.playlistVideos = (data.videos || []).slice(0, 15).map((v: any) => ({
            title: v.title,
            description: v.description?.slice(0, 200),
            channelTitle: v.channelTitle,
          }));
        })
      );
    }

    await Promise.all(fetches);
    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

async function fetchSpotifyContext(token: string): Promise<SpotifyReflectData | undefined> {
  const playlistUrl = localStorage.getItem('ib_spotify_playlist');
  const artistUrl = localStorage.getItem('ib_spotify_artist');
  if (!playlistUrl && !artistUrl) return undefined;

  const result: SpotifyReflectData = {};

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const fetches: Promise<void>[] = [];

    if (playlistUrl) {
      fetches.push(
        fetch(SPOTIFY_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'playlist', playlistUrl }),
        }).then(async (resp) => {
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.error || !data.playlist) return;
          result.playlistName = data.playlist.name;
          result.tracks = (data.tracks || []).slice(0, 20).map((t: any) => ({
            name: t.name,
            artists: t.artists,
          }));
        })
      );
    }

    if (artistUrl) {
      fetches.push(
        fetch(SPOTIFY_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ action: 'artist', artistUrl }),
        }).then(async (resp) => {
          if (!resp.ok) return;
          const data = await resp.json();
          if (data.error || !data.artist) return;
          result.artistName = data.artist.name;
          result.genres = data.artist.genres?.slice(0, 5);
          result.topTracks = (data.topTracks || []).slice(0, 10).map((t: any) => ({
            name: t.name,
          }));
        })
      );
    }

    await Promise.all(fetches);
    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

export async function callReflect(payload: ReflectPayload): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Auto-enrich with YouTube and Spotify data if linked
  const [ytData, spData] = await Promise.all([
    payload.youtubeData ? Promise.resolve(payload.youtubeData) : fetchYouTubeContext(token),
    payload.spotifyData ? Promise.resolve(payload.spotifyData) : fetchSpotifyContext(token),
  ]);
  payload.youtubeData = ytData;
  payload.spotifyData = spData;

  const resp = await fetch(REFLECT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (resp.status === 429) throw new Error('Rate limit reached. Please try again in a moment.');
  if (resp.status === 402) throw new Error('AI usage limit reached.');
  if (!resp.ok) throw new Error('Failed to get AI response');

  const data = await resp.json();
  return data.result;
}

export async function streamReflectChat(
  payload: ReflectPayload,
  onDelta: (text: string) => void,
  onDone: () => void,
) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Auto-enrich with YouTube and Spotify data if linked
  const [ytData, spData] = await Promise.all([
    payload.youtubeData ? Promise.resolve(payload.youtubeData) : fetchYouTubeContext(token),
    payload.spotifyData ? Promise.resolve(payload.spotifyData) : fetchSpotifyContext(token),
  ]);
  payload.youtubeData = ytData;
  payload.spotifyData = spData;

  const resp = await fetch(REFLECT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (resp.status === 429) throw new Error('Rate limit reached. Please try again in a moment.');
  if (resp.status === 402) throw new Error('AI usage limit reached.');
  if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  // Final flush
  if (buffer.trim()) {
    for (let raw of buffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
