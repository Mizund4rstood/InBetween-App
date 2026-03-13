import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Compass, Wind, BookOpen, Zap, Pause, CalendarDays, Sparkles, Settings, Shield, HelpCircle, Users, Music2, LogOut, User } from 'lucide-react';
import { haptics } from './haptics';
import { useAppStore, AppMode } from './appStore';
import { useAuth } from './useAuth';
import { supabase } from './client';
import MiniPlayer from './MiniPlayer';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './dropdown-menu';

const groundNav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/log', icon: Compass, label: 'Bearings' },
  { to: '/grounding', icon: Wind, label: 'Ground' },
  { to: '/summary', icon: CalendarDays, label: 'Week' },
  { to: '/music', icon: Music2, label: 'Music' },
];

const compassNav = [
  { to: '/compass', icon: Compass, label: 'Home' },
  { to: '/compass/log', icon: Zap, label: 'Log' },
  { to: '/compass/pause', icon: Pause, label: 'Pause' },
  { to: '/rewire', icon: Shield, label: 'Rewire' },
  { to: '/community', icon: Users, label: 'Community' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeMode, setActiveMode } = useAppStore();
  const { user, signOut } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  // Auto-detect mode from URL
  const isCompassRoute = location.pathname.startsWith('/compass');
  const effectiveMode: AppMode = isCompassRoute ? 'compass' : activeMode;
  const navItems = effectiveMode === 'compass' ? compassNav : groundNav;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Organic animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute -top-32 -right-32 w-80 h-80 blur-3xl transition-colors duration-700 animate-morph animate-drift ${
          effectiveMode === 'compass' ? 'bg-compass/8' : 'bg-primary/8'
        }`} />
        <div className="absolute top-1/3 -left-24 w-56 h-56 bg-accent/6 blur-3xl animate-morph-alt animate-drift-reverse" />
        <div className={`absolute bottom-32 right-0 w-64 h-64 blur-3xl transition-colors duration-700 animate-morph animate-float-slow ${
          effectiveMode === 'compass' ? 'bg-compass/10' : 'bg-sage-light/20'
        }`} />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-lavender/5 blur-3xl animate-morph-alt animate-float-reverse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-sky/5 blur-3xl animate-morph animate-glow-pulse" style={{ animationDelay: '5s' }} />
      </div>

      {/* Mode switcher */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-3 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex bg-card/90 backdrop-blur-xl rounded-2xl p-1 border border-border/50 shadow-[var(--shadow-card)]">
              <button
                onClick={() => { setActiveMode('ground'); navigate('/'); haptics.light(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  effectiveMode === 'ground'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                Ground
              </button>
              <button
                onClick={() => { setActiveMode('compass'); navigate('/compass'); haptics.light(); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  effectiveMode === 'compass'
                    ? 'bg-compass text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Compass
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => haptics.light()}
                  className={`rounded-xl bg-card/90 backdrop-blur-xl border border-border/50 shadow-[var(--shadow-card)] transition-colors overflow-hidden ${
                    location.pathname === '/settings' ? 'ring-2 ring-primary' : ''
                  } ${avatarUrl ? 'p-0.5' : 'p-2.5 text-muted-foreground hover:text-foreground'}`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-[var(--shadow-elevated)]">
                <DropdownMenuLabel className="px-3 py-2.5">
                  <p className="text-xs font-bold truncate">{user?.user_metadata?.display_name || user?.email}</p>
                  {user?.user_metadata?.display_name && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { haptics.light(); navigate('/settings'); }}
                  className="gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { haptics.light(); signOut(); }}
                  className="gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1 pt-14 pb-20 overflow-y-auto no-scrollbar"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <MiniPlayer />
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-3 mb-3">
          <div className="glass-strong rounded-2xl border border-border/30 shadow-[var(--shadow-elevated)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none" />
            <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
              {navItems.map(({ to, icon: Icon, label }) => {
                const isActive = location.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => haptics.light()}
                    className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? effectiveMode === 'compass' ? 'text-compass' : 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute inset-0 rounded-xl ${effectiveMode === 'compass' ? 'bg-compass/10' : 'bg-primary/10'}`} />
                    )}
                    <Icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className={`text-[10px] relative z-10 transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
