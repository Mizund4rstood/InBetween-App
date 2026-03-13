import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

interface YouTubeVideo {
  title: string;
  description: string;
  publishedAt: string;
  thumbnail?: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  videoCount: number;
  thumbnail?: string;
}

interface YouTubePlaylistData {
  playlist: YouTubePlaylist;
  videos: YouTubeVideo[];
}

interface YouTubeData {
  channel: YouTubeChannel;
  recentVideos: YouTubeVideo[];
}

export function useYouTube() {
  const { session } = useAuth();
  const [data, setData] = useState<YouTubeData | null>(null);
  const [playlistData, setPlaylistData] = useState<YouTubePlaylistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkedChannel = typeof window !== "undefined"
    ? localStorage.getItem("ib_youtube_channel")
    : null;

  const linkedPlaylist = typeof window !== "undefined"
    ? localStorage.getItem("ib_youtube_playlist")
    : null;

  const linkChannel = useCallback(async (channelInput: string) => {
    if (!session?.access_token) {
      setError("Please sign in first");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract handle/ID from URL or use as-is
      let channelId = channelInput.trim();
      const urlMatch = channelId.match(/youtube\.com\/(?:@|channel\/|c\/|user\/)([^/?]+)/);
      if (urlMatch) channelId = urlMatch[1];

      const { data: result, error: fnError } = await supabase.functions.invoke("youtube-data", {
        body: { action: "channel", channelId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      setData(result);
      localStorage.setItem("ib_youtube_channel", channelId);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch channel");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchChannelData = useCallback(async () => {
    const ch = localStorage.getItem("ib_youtube_channel");
    if (!ch || !session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("youtube-data", {
        body: { action: "channel", channelId: ch, maxResults: 15 },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (!result?.error) setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const searchVideos = useCallback(async (query: string) => {
    if (!session?.access_token) return null;

    const { data: result } = await supabase.functions.invoke("youtube-data", {
      body: { action: "search", query, maxResults: 10 },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    return result;
  }, [session]);

  const unlinkChannel = useCallback(() => {
    localStorage.removeItem("ib_youtube_channel");
    setData(null);
  }, []);

  const linkPlaylist = useCallback(async (playlistInput: string) => {
    if (!session?.access_token) {
      setError("Please sign in first");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      let playlistId = playlistInput.trim();
      const urlMatch = playlistId.match(/[?&]list=([^&]+)/);
      if (urlMatch) playlistId = urlMatch[1];

      const { data: result, error: fnError } = await supabase.functions.invoke("youtube-data", {
        body: { action: "playlist", playlistId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      setPlaylistData(result);
      localStorage.setItem("ib_youtube_playlist", playlistId);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch playlist");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchPlaylistData = useCallback(async () => {
    const pl = localStorage.getItem("ib_youtube_playlist");
    if (!pl || !session?.access_token) return;

    setLoading(true);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("youtube-data", {
        body: { action: "playlist", playlistId: pl, maxResults: 15 },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (!result?.error) setPlaylistData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch playlist");
    } finally {
      setLoading(false);
    }
  }, [session]);

  const unlinkPlaylist = useCallback(() => {
    localStorage.removeItem("ib_youtube_playlist");
    setPlaylistData(null);
  }, []);

  return {
    data,
    playlistData,
    loading,
    error,
    linkedChannel,
    linkedPlaylist,
    linkChannel,
    linkPlaylist,
    fetchChannelData,
    fetchPlaylistData,
    searchVideos,
    unlinkChannel,
    unlinkPlaylist,
  };
}
