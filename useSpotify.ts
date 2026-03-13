import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SpotifyPlaylist {
  name: string;
  description: string;
  owner: string;
  totalTracks: number;
}

interface SpotifyTrack {
  name: string;
  artists: string;
  album: string;
  releaseDate?: string;
  popularity?: number;
}

interface SpotifyArtist {
  name: string;
  genres: string[];
  followers: number;
  popularity: number;
}

interface SpotifyData {
  playlist?: SpotifyPlaylist;
  tracks?: SpotifyTrack[];
  artist?: SpotifyArtist;
  topTracks?: { name: string; album: string; popularity: number }[];
}

export function useSpotify() {
  const { session } = useAuth();
  const [data, setData] = useState<SpotifyData | null>(null);
  const [artistData, setArtistData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkedPlaylist = typeof window !== "undefined"
    ? localStorage.getItem("ib_spotify_playlist")
    : null;

  const linkedArtist = typeof window !== "undefined"
    ? localStorage.getItem("ib_spotify_artist")
    : null;

  const linkPlaylist = useCallback(async (playlistInput: string) => {
    if (!session?.access_token) {
      setError("Please sign in first");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("spotify-data", {
        body: { action: "playlist", playlistUrl: playlistInput.trim() },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      setData(result);
      localStorage.setItem("ib_spotify_playlist", playlistInput.trim());
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch playlist");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const linkArtist = useCallback(async (artistInput: string) => {
    if (!session?.access_token) {
      setError("Please sign in first");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("spotify-data", {
        body: { action: "artist", artistUrl: artistInput.trim() },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      setArtistData(result);
      localStorage.setItem("ib_spotify_artist", artistInput.trim());
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch artist");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchPlaylistData = useCallback(async () => {
    const url = localStorage.getItem("ib_spotify_playlist");
    if (!url || !session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("spotify-data", {
        body: { action: "playlist", playlistUrl: url },
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

  const unlinkPlaylist = useCallback(() => {
    localStorage.removeItem("ib_spotify_playlist");
    setData(null);
  }, []);

  const unlinkArtist = useCallback(() => {
    localStorage.removeItem("ib_spotify_artist");
    setArtistData(null);
  }, []);

  return {
    data,
    artistData,
    loading,
    error,
    linkedPlaylist,
    linkedArtist,
    linkPlaylist,
    linkArtist,
    fetchPlaylistData,
    unlinkPlaylist,
    unlinkArtist,
  };
}
