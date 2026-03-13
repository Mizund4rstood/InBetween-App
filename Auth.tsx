import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from './client';
import { lovable } from './index';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Fireflies from './Fireflies';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName || undefined);
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setForgotSent(true);
    setLoading(false);
  };

  if (forgotSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/15 animate-morph animate-drift" style={{ filter: 'blur(55px)' }} />
          <div className="absolute top-1/4 -right-16 w-56 h-56 rounded-full bg-accent/12 animate-morph-alt animate-drift-reverse" style={{ filter: 'blur(50px)' }} />
          <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-sky/10 animate-morph animate-float-reverse" style={{ filter: 'blur(55px)' }} />
          <div className="absolute top-2/3 right-1/4 w-40 h-40 rounded-full bg-lavender/12 animate-morph-alt animate-float-slow" style={{ filter: 'blur(50px)' }} />
          <div className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-sage-light/20 animate-morph animate-float-reverse" style={{ filter: 'blur(55px)' }} />
        </div>
        <Fireflies sizeMultiplier={1.6} brightnessMultiplier={1.5} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-bold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong>{email}</strong>, we sent a password reset link.
          </p>
          <button onClick={() => { setForgotSent(false); setForgotMode(false); }} className="text-sm text-primary underline mt-4">
            Back to sign in
          </button>
        </motion.div>
      </div>
    );
  }

  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/15 animate-morph animate-drift" style={{ filter: 'blur(55px)' }} />
          <div className="absolute top-1/4 -right-16 w-56 h-56 rounded-full bg-accent/12 animate-morph-alt animate-drift-reverse" style={{ filter: 'blur(50px)' }} />
          <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-sky/10 animate-morph animate-float-reverse" style={{ filter: 'blur(55px)' }} />
          <div className="absolute top-2/3 right-1/4 w-40 h-40 rounded-full bg-lavender/12 animate-morph-alt animate-float-slow" style={{ filter: 'blur(50px)' }} />
          <div className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-sage-light/20 animate-morph animate-float-reverse" style={{ filter: 'blur(55px)' }} />
        </div>
        <Fireflies sizeMultiplier={1.6} brightnessMultiplier={1.5} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Reset password</h1>
            <p className="text-sm text-muted-foreground mt-2">Enter your email and we'll send a reset link.</p>
          </div>
          <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" />
              </div>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-destructive text-xs p-3 rounded-xl bg-destructive/10">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
                </motion.div>
              )}
              <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-sm active:scale-[0.97] transition-all duration-200 shadow-[var(--shadow-glow-primary)] disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
              </button>
            </form>
            <button onClick={() => { setForgotMode(false); setError(''); }} className="flex items-center gap-1 text-sm text-muted-foreground mt-4 mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/15 animate-morph animate-drift" style={{ filter: 'blur(55px)' }} />
          <div className="absolute top-1/4 -right-16 w-56 h-56 rounded-full bg-accent/12 animate-morph-alt animate-drift-reverse" style={{ filter: 'blur(50px)' }} />
          <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-sky/10 animate-morph animate-float-reverse" style={{ filter: 'blur(55px)' }} />
          <div className="absolute top-2/3 right-1/4 w-40 h-40 rounded-full bg-lavender/12 animate-morph-alt animate-float-slow" style={{ filter: 'blur(50px)' }} />
          <div className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-sage-light/20 animate-morph animate-float-reverse" style={{ filter: 'blur(55px)' }} />
        </div>
        <Fireflies sizeMultiplier={1.6} brightnessMultiplier={1.5} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-bold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button
            onClick={() => { setSignupSuccess(false); setMode('login'); }}
            className="text-sm text-primary underline mt-4"
          >
            Back to sign in
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Organic animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/15 animate-morph animate-drift" style={{ filter: 'blur(55px)' }} />
        <div className="absolute top-1/4 -right-16 w-56 h-56 rounded-full bg-accent/12 animate-morph-alt animate-drift-reverse" style={{ filter: 'blur(50px)' }} />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 rounded-full bg-sky/10 animate-morph animate-glow-pulse" style={{ filter: 'blur(55px)', animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/4 w-40 h-40 rounded-full bg-lavender/12 animate-morph-alt animate-float-slow" style={{ filter: 'blur(50px)', animationDelay: '4s' }} />
        <div className="absolute bottom-20 -left-16 w-60 h-60 rounded-full bg-sage-light/20 animate-float-reverse animate-morph" style={{ filter: 'blur(55px)' }} />
      </div>
      <Fireflies sizeMultiplier={1.6} brightnessMultiplier={1.5} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          {/* Animated logo mark */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 relative"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 animate-morph" />
            <div className="absolute inset-1 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center animate-morph" style={{ animationDelay: '0.5s' }}>
              <span className="text-2xl">🧭</span>
            </div>
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-foreground">InBetween</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === 'login' ? 'Welcome back. Pick up where you left off.' : 'Start building awareness. One rep at a time.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card/70 backdrop-blur-xl border border-border/30 shadow-[var(--shadow-elevated)]">
          {/* Mode toggle */}
          <div className="flex rounded-2xl bg-muted p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Sign in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Display name (optional)"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      maxLength={50}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background border border-border/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 text-destructive text-xs p-3 rounded-xl bg-destructive/10"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-sm active:scale-[0.97] transition-all duration-200 shadow-[var(--shadow-glow-primary)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={async () => {
              setError('');
              const { error } = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (error) setError(error.message);
            }}
            className="w-full py-3 rounded-2xl bg-background border border-border/50 text-sm font-medium text-foreground active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2.5 hover:bg-muted/50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Apple OAuth */}
          <button
            onClick={async () => {
              setError('');
              const { error } = await lovable.auth.signInWithOAuth("apple", {
                redirect_uri: window.location.origin,
              });
              if (error) setError(error.message);
            }}
            className="w-full py-3 rounded-2xl bg-foreground text-background text-sm font-medium active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2.5 hover:opacity-90 mt-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          {mode === 'login' && (
            <button
              onClick={() => { setForgotMode(true); setError(''); }}
              className="block text-xs text-muted-foreground underline mt-3 mx-auto"
            >
              Forgot password?
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Your data stays yours. Always.
        </p>
      </motion.div>
    </div>
  );
}
