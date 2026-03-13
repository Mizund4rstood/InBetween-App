import { useState } from 'react';
import TimeOnDevice from '@/components/TimeOnDevice';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { useAuth } from '@/hooks/useAuth';
import { useTTS } from '@/hooks/useTTS';
import { useYouTube } from '@/hooks/useYouTube';
import { useSpotify } from '@/hooks/useSpotify';
import { Moon, Sun, Download, Trash2, Shield, Wrench, Volume2, VolumeX, Sparkles, Check, Mic, LogOut, ChevronDown, Play, Loader2, Square, Youtube, Link, Unlink, Music, HelpCircle, Heart } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, isSoundEnabled, toggleSound, isTTSEnabled, toggleTTS, selectedVoiceId, setSelectedVoiceId, exportData, clearAllData, entries, groundingSessions } = useAppStore();
  const { isPremium } = usePremiumStore();
  const { signOut, user } = useAuth();
  const { speak, stop, isPlaying, isLoading } = useTTS({ voiceId: selectedVoiceId });
  const { linkedChannel, linkedPlaylist: ytLinkedPlaylist, linkChannel, linkPlaylist: ytLinkPlaylist, unlinkChannel, unlinkPlaylist: ytUnlinkPlaylist, loading: ytLoading, error: ytError, data: ytData, playlistData: ytPlaylistData } = useYouTube();
  const { linkedPlaylist, linkedArtist, linkPlaylist, linkArtist, unlinkPlaylist, unlinkArtist, loading: spLoading, error: spError, data: spData, artistData: spArtistData } = useSpotify();
  const [ytInput, setYtInput] = useState('');
  const [ytPlaylistInput, setYtPlaylistInput] = useState('');
  const [spInput, setSpInput] = useState('');
  const [spArtistInput, setSpArtistInput] = useState('');

  const handleExport = (format: 'json' | 'csv') => {
    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'json') {
      content = exportData();
      mimeType = 'application/json';
      filename = 'inbetween-export.json';
    } else {
      const rows = [['Date', 'Mood', 'Stress', 'Items', 'Note'].join(',')];
      entries.forEach(e => {
        rows.push([
          e.entryDatetime,
          e.mood.toString(),
          e.stress.toString(),
          `"${e.items.map(i => i.text).join('; ')}"`,
          `"${e.note || ''}"`,
        ].join(','));
      });
      content = rows.join('\n');
      mimeType = 'text/csv';
      filename = 'inbetween-export.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure? This will permanently delete all your check-ins and grounding sessions. This cannot be undone.')) {
      clearAllData();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      <div className="pt-10 pb-6">
        <h1 className="text-3xl font-serif font-bold">Settings</h1>
        <button
          onClick={() => navigate('/how-to')}
          className="mt-2 flex items-center gap-1.5 text-xs text-primary font-semibold active:scale-95 transition-transform"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          How does everything work?
        </button>
        <button
          onClick={() => navigate('/why')}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-medium active:scale-95 transition-all"
        >
          <Heart className="w-3.5 h-3.5" />
          Why I built this app
        </button>
      </div>

      {/* Privacy notice */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-sage-light/40 via-card to-card border border-primary/10 mb-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 mt-0.5">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1">Your Data Stays Here</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Everything is stored on your device. Nothing leaves your phone. 
              Export or delete anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Premium */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Your Tools</h2>
        <button
          onClick={() => navigate('/premium')}
          className={`w-full p-4 rounded-2xl border flex items-center justify-between active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] ${
            isPremium
              ? 'bg-gradient-to-r from-primary/10 via-card to-card border-primary/20'
              : 'bg-card border-border/50'
          }`}
        >
          <div className="flex items-center gap-3">
            {isPremium ? (
              <Check className="w-5 h-5 text-primary" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            <div className="text-left">
              <span className="font-semibold text-sm">{isPremium ? 'Full Kit' : 'Unlock Full Kit'}</span>
              <p className="text-[10px] text-muted-foreground">
                {isPremium ? 'All tools unlocked' : 'Invest in better wiring'}
              </p>
            </div>
          </div>
          {!isPremium && (
            <span className="text-xs font-bold text-primary">$9/mo</span>
          )}
        </button>
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Appearance</h2>
        <button
          onClick={toggleDarkMode}
          className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center justify-between active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-lavender" /> : <Sun className="w-5 h-5 text-accent" />}
            <span className="font-semibold">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${isDarkMode ? 'bg-primary' : 'bg-border'}`}>
            <div className={`w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : ''}`} />
          </div>
        </button>
        <button
          onClick={toggleSound}
          className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center justify-between active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center gap-3">
            {isSoundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
            <span className="font-semibold">{isSoundEnabled ? 'Sound Effects On' : 'Sound Effects Off'}</span>
          </div>
          <div className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${isSoundEnabled ? 'bg-primary' : 'bg-border'}`}>
            <div className={`w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300 ${isSoundEnabled ? 'translate-x-5' : ''}`} />
          </div>
        </button>
        <button
          onClick={toggleTTS}
          className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center justify-between active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center gap-3">
            <Mic className={`w-5 h-5 ${isTTSEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <span className="font-semibold">{isTTSEnabled ? 'Voice Playback On' : 'Voice Playback Off'}</span>
              <p className="text-[10px] text-muted-foreground">Listen buttons on AI reflections</p>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-full p-0.5 transition-all duration-300 ${isTTSEnabled ? 'bg-primary' : 'bg-border'}`}>
            <div className={`w-6 h-6 rounded-full bg-card shadow-md transition-transform duration-300 ${isTTSEnabled ? 'translate-x-5' : ''}`} />
          </div>
        </button>
        {isTTSEnabled && (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-3">
              <Volume2 className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold text-sm">Narration Voice</span>
                <p className="text-[10px] text-muted-foreground">Choose the voice for AI reflections</p>
              </div>
            </div>
            <div className="relative">
              <select
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
                className="w-full appearance-none p-3 pr-10 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <option value="JBFqnCBsd6RMkjVDRZzb">George — warm, calm</option>
                <option value="EXAVITQu4vr4xnSDxMaL">Sarah — gentle, reassuring</option>
                <option value="FGY2WhTYpPnrIDTdsKH5">Laura — soft, empathetic</option>
                <option value="CwhRBWXzGAHq8TQ4Fs17">Roger — deep, grounding</option>
                <option value="onwK4e9ZLuTAKqWW03F9">Daniel — steady, composed</option>
                <option value="pFZP5JQG7iQjIQuC4Bku">Lily — light, soothing</option>
                <option value="IKne3meq5aSn9XLyUdCD">Charlie — friendly, conversational</option>
                <option value="N2lVS1w4EtoT3dr4eOWO">Callum — clear, articulate</option>
                <option value="SAz9YHcvj6GT2YYXdXww">River — calm, meditative</option>
                <option value="TX3LPaxmHKxFdv7VOQHJ">Liam — warm, encouraging</option>
                <option value="Xb7hH8MSUJpSbSDYk0k2">Alice — bright, uplifting</option>
                <option value="XrExE9yKIg1WjnnlVkGX">Matilda — nurturing, kind</option>
                <option value="cjVigY5qzO86Huf0OWal">Eric — thoughtful, reflective</option>
                <option value="nPczCjzI2devNBz1zQrb">Brian — confident, supportive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={() => {
                if (isPlaying) {
                  stop();
                } else {
                  speak("You're doing something meaningful today. One step at a time.");
                }
              }}
              disabled={isLoading}
              className={`mt-3 w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97] ${
                isPlaying
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50 hover:border-border'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isPlaying ? (
                <Square className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {isLoading ? 'Loading…' : isPlaying ? 'Stop Preview' : 'Preview Voice'}
            </button>
          </div>
        )}
      </div>

      {/* Data */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Your Data</h2>
        <div className="space-y-2">
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{entries.length}</span> check-in{entries.length !== 1 ? 's' : ''} · <span className="font-bold text-foreground">{groundingSessions.length}</span> grounding session{groundingSessions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => handleExport('json')}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3 active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
          >
            <Download className="w-5 h-5 text-primary" />
            <span className="font-semibold">Export as JSON</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3 active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
          >
            <Download className="w-5 h-5 text-primary" />
            <span className="font-semibold">Export as CSV</span>
          </button>
        </div>
      </div>

      {/* Time on Device */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Healthy Usage</h2>
        <TimeOnDevice />
      </div>

      {/* YouTube Integration */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Connected Media</h2>
        {linkedChannel ? (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Youtube className="w-5 h-5 text-destructive" />
                <div>
                  <span className="font-semibold text-sm">YouTube Linked</span>
                  <p className="text-[10px] text-muted-foreground">{ytData?.channel?.title || linkedChannel}</p>
                </div>
              </div>
              <button
                onClick={unlinkChannel}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Unlink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {ytData?.channel && (
              <div className="text-[10px] text-muted-foreground flex gap-3">
                <span>{Number(ytData.channel.videoCount).toLocaleString()} videos</span>
                <span>{Number(ytData.channel.subscriberCount).toLocaleString()} subs</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <Youtube className="w-5 h-5 text-destructive" />
              <div>
                <span className="font-semibold text-sm">Link YouTube Channel</span>
                <p className="text-[10px] text-muted-foreground">Paste your channel URL or @handle</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                placeholder="@handle or channel URL"
                className="flex-1 p-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => linkChannel(ytInput)}
                disabled={ytLoading || !ytInput.trim()}
                className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {ytLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              </button>
            </div>
            {ytError && <p className="text-[10px] text-destructive">{ytError}</p>}
          </div>
        )}

        {/* YouTube Playlist */}
        {ytLinkedPlaylist ? (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Youtube className="w-5 h-5 text-destructive" />
                <div>
                  <span className="font-semibold text-sm">YT Playlist Linked</span>
                  <p className="text-[10px] text-muted-foreground">{ytPlaylistData?.playlist?.title || 'Playlist linked'}</p>
                </div>
              </div>
              <button
                onClick={ytUnlinkPlaylist}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Unlink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {ytPlaylistData?.playlist && (
              <div className="text-[10px] text-muted-foreground flex gap-3">
                <span>{ytPlaylistData.playlist.videoCount} videos</span>
                <span>by {ytPlaylistData.playlist.channelTitle}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3 mt-2">
            <div className="flex items-center gap-3 mb-1">
              <Youtube className="w-5 h-5 text-destructive" />
              <div>
                <span className="font-semibold text-sm">Link YouTube Playlist</span>
                <p className="text-[10px] text-muted-foreground">Paste a YouTube playlist URL</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={ytPlaylistInput}
                onChange={(e) => setYtPlaylistInput(e.target.value)}
                placeholder="https://youtube.com/playlist?list=..."
                className="flex-1 p-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => ytLinkPlaylist(ytPlaylistInput)}
                disabled={ytLoading || !ytPlaylistInput.trim()}
                className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {ytLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              </button>
            </div>
            {ytError && <p className="text-[10px] text-destructive">{ytError}</p>}
          </div>
        )}

        {/* Spotify */}
        {linkedPlaylist ? (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-semibold text-sm">Spotify Linked</span>
                  <p className="text-[10px] text-muted-foreground">{spData?.playlist?.name || 'Playlist linked'}</p>
                </div>
              </div>
              <button
                onClick={unlinkPlaylist}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Unlink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {spData?.playlist && (
              <div className="text-[10px] text-muted-foreground flex gap-3">
                <span>{spData.playlist.totalTracks} tracks</span>
                <span>by {spData.playlist.owner}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3 mt-2">
            <div className="flex items-center gap-3 mb-1">
              <Music className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold text-sm">Link Spotify Playlist</span>
                <p className="text-[10px] text-muted-foreground">Paste a public playlist URL</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={spInput}
                onChange={(e) => setSpInput(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                className="flex-1 p-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => linkPlaylist(spInput)}
                disabled={spLoading || !spInput.trim()}
                className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {spLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              </button>
            </div>
            {spError && <p className="text-[10px] text-destructive">{spError}</p>}
          </div>
        )}

        {/* Spotify Artist */}
        {linkedArtist ? (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-accent" />
                <div>
                  <span className="font-semibold text-sm">Artist Linked</span>
                  <p className="text-[10px] text-muted-foreground">{spArtistData?.artist?.name || 'Artist linked'}</p>
                </div>
              </div>
              <button
                onClick={unlinkArtist}
                className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <Unlink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            {spArtistData?.artist && (
              <div className="text-[10px] text-muted-foreground flex gap-3 flex-wrap">
                {spArtistData.artist.genres?.slice(0, 3).map((g, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-muted/50">{g}</span>
                ))}
                <span>{Number(spArtistData.artist.followers).toLocaleString()} followers</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] space-y-3 mt-2">
            <div className="flex items-center gap-3 mb-1">
              <Music className="w-5 h-5 text-accent" />
              <div>
                <span className="font-semibold text-sm">Link Spotify Artist</span>
                <p className="text-[10px] text-muted-foreground">Paste an artist URL for genre analysis</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={spArtistInput}
                onChange={(e) => setSpArtistInput(e.target.value)}
                placeholder="https://open.spotify.com/artist/..."
                className="flex-1 p-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => linkArtist(spArtistInput)}
                disabled={spLoading || !spArtistInput.trim()}
                className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.97]"
              >
                {spLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
              </button>
            </div>
            {spError && <p className="text-[10px] text-destructive">{spError}</p>}
          </div>
        )}
      </div>

      {/* Account */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Account</h2>
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)] mb-2">
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-bold text-foreground">{user?.email}</span>
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3 active:scale-[0.99] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)]"
        >
          <LogOut className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>

      {/* Danger zone */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-destructive uppercase tracking-widest mb-3">Danger Zone</h2>
        <button
          onClick={handleDelete}
          className="w-full p-4 rounded-2xl border-2 border-destructive/20 bg-destructive/5 flex items-center gap-3 text-destructive active:scale-[0.99] transition-all hover:border-destructive/40"
        >
          <Trash2 className="w-5 h-5" />
          <span className="font-semibold">Delete All Data</span>
        </button>
      </div>

      {/* About */}
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Wrench className="w-5 h-5 text-primary" />
        </div>
        <p className="text-lg font-serif font-bold">InBetween</p>
        <p className="text-xs text-muted-foreground mt-1">
          Real tools for real life.
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-2 tracking-wide">
          by The Space Inbetween The Versions
        </p>
      </div>
    </div>
  );
}
