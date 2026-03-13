import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremiumStore, PremiumFeature, PREMIUM_FEATURES } from './premiumStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, X } from 'lucide-react';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  /** If true, renders inline instead of overlay */
  inline?: boolean;
}

/**
 * Trial-taste gate: renders children on first use, then shows upgrade prompt.
 * Call `onAccess` before rendering gated content to track trial usage.
 */
export function PremiumGate({ feature, children, inline }: PremiumGateProps) {
  const { canAccess, isPremium } = usePremiumStore();

  if (isPremium || canAccess(feature)) {
    return <>{children}</>;
  }

  if (inline) {
    return <InlineUpgradePrompt feature={feature} />;
  }

  return <OverlayUpgradePrompt feature={feature}>{children}</OverlayUpgradePrompt>;
}

function InlineUpgradePrompt({ feature }: { feature: PremiumFeature }) {
  const navigate = useNavigate();
  const meta = PREMIUM_FEATURES[feature];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-primary/8 via-card to-card border border-primary/15 text-center shadow-[var(--shadow-card)]"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <p className="text-lg mb-1">{meta.emoji}</p>
      <h3 className="text-sm font-serif font-bold text-foreground mb-1">{meta.label}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{meta.description}</p>
      <button
        onClick={() => navigate('/premium')}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-sm active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
      >
        Invest in Your Nervous System
      </button>
      <p className="text-[10px] text-muted-foreground/50 mt-2">
        You tried this once. Unlock it fully.
      </p>
    </motion.div>
  );
}

function OverlayUpgradePrompt({ feature, children }: { feature: PremiumFeature; children: React.ReactNode }) {
  const navigate = useNavigate();
  const meta = PREMIUM_FEATURES[feature];

  return (
    <div className="relative">
      <div className="blur-sm opacity-50 pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-card/95 backdrop-blur-xl border border-primary/20 shadow-[var(--shadow-elevated)] text-center max-w-sm"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-lg mb-1">{meta.emoji}</p>
          <h3 className="text-sm font-serif font-bold text-foreground mb-1">{meta.label}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{meta.description}</p>
          <button
            onClick={() => navigate('/premium')}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-sm active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
          >
            Invest in Your Nervous System
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Hook to gate an action with trial-taste logic.
 * Returns { gated, tryAccess, showUpgrade, dismissUpgrade }
 */
export function usePremiumGate(feature: PremiumFeature) {
  const { canAccess, useTrialAccess, isPremium } = usePremiumStore();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const tryAccess = (): boolean => {
    if (isPremium) return true;
    const granted = useTrialAccess(feature);
    if (!granted) {
      setShowUpgrade(true);
    }
    return granted;
  };

  return {
    gated: !isPremium && !canAccess(feature),
    tryAccess,
    showUpgrade,
    dismissUpgrade: () => setShowUpgrade(false),
  };
}

/**
 * Modal upgrade prompt for action-based gating
 */
export function UpgradeModal({ feature, open, onClose }: { feature: PremiumFeature; open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const meta = PREMIUM_FEATURES[feature];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="p-8 rounded-3xl bg-card border border-primary/20 shadow-[var(--shadow-elevated)] text-center max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted text-muted-foreground">
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>

            <p className="text-2xl mb-2">{meta.emoji}</p>
            <h2 className="text-lg font-serif font-bold text-foreground mb-2">{meta.label}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{meta.description}</p>

            <button
              onClick={() => { onClose(); navigate('/premium'); }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
            >
              Invest in Your Nervous System
            </button>

            <p className="text-[10px] text-muted-foreground/50 mt-3 leading-relaxed">
              Not "unlock features." This is an investment in who you are becoming.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
