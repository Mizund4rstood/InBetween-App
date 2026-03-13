import { useNavigate } from 'react-router-dom';
import { usePremiumStore, PREMIUM_FEATURES, PremiumFeature } from './premiumStore';
import { ChevronLeft, Check, Sparkles, Shield, Heart, Brain, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const TIERS = {
  free: {
    name: 'Ground',
    price: 'Free',
    description: 'The foundation.',
    features: [
      'Daily grounding log',
      'Basic mood tracking',
      'Basic breathing exercises',
      '1 micro-intervention per day',
      'Gratitude wall',
    ],
  },
  premium: {
    name: 'Rooted',
    price: '$9',
    period: '/month',
    description: 'Invest in your nervous system.',
    features: Object.values(PREMIUM_FEATURES).map(f => `${f.emoji} ${f.label}`),
  },
};

const TESTIMONIALS = [
  {
    text: "I didn\u2019t realize how reactive I was until I saw my behavior loops. Now I pause. That\u2019s everything.",
    identity: 'Someone who pauses now',
  },
  {
    text: "Seeing my own words surface on a hard day\u2026 I cried. In a good way. I remembered why I started.",
    identity: 'Someone who remembers their why',
  },
  {
    text: "The regulation trend showed me I was actually getting better. Data I could trust when my brain couldn\u2019t.",
    identity: 'Someone building self-trust',
  },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const { isPremium, setPremium } = usePremiumStore();

  const handleSubscribe = () => {
    // TODO: Wire up Stripe payment
    // For now, toggle premium for testing
    setPremium(true);
    navigate(-1);
  };

  return (
    <div className="max-w-lg mx-auto p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pt-10 pb-6">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold">Invest in Yourself</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Not features. Your nervous system.
          </p>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/15 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-2">
          Become Rooted
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Deeper grounding. Stronger regulation. More self-trust. 
          Tools that grow with you, not against you.
        </p>
      </motion.div>

      {/* What you get */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          What deepens with Rooted
        </h3>
        {(Object.entries(PREMIUM_FEATURES) as [PremiumFeature, typeof PREMIUM_FEATURES[PremiumFeature]][]).map(([key, feat], idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
          >
            <span className="text-xl">{feat.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{feat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{feat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social proof */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          People becoming
        </h3>
        <div className="space-y-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-accent/5 via-card to-card border border-accent/10"
            >
              <p className="text-sm text-foreground font-serif leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-semibold">
                &mdash; {t.identity}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing comparison */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {/* Free tier */}
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Ground</p>
          <p className="text-2xl font-serif font-bold text-foreground">Free</p>
          <p className="text-[10px] text-muted-foreground mb-3">The foundation</p>
          <ul className="space-y-1.5">
            {TIERS.free.features.map((f, i) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Premium tier */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 shadow-[var(--shadow-glow-primary)] relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider">
            Recommended
          </div>
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Rooted</p>
          <div className="flex items-baseline gap-0.5">
            <p className="text-2xl font-serif font-bold text-foreground">$9</p>
            <p className="text-xs text-muted-foreground">/mo</p>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Your nervous system</p>
          <ul className="space-y-1.5">
            <li className="text-[11px] text-foreground font-semibold flex items-start gap-1.5">
              <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              Everything in Ground
            </li>
            <li className="text-[11px] text-foreground flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              + All premium tools
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      {isPremium ? (
        <div className="text-center p-5 rounded-2xl bg-primary/5 border border-primary/10">
          <Check className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-serif font-bold text-foreground">You are Rooted</p>
          <p className="text-xs text-muted-foreground mt-1">All tools are unlocked. Keep becoming.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleSubscribe}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-sage-dark text-primary-foreground font-bold text-lg active:scale-[0.98] transition-all shadow-[var(--shadow-glow-primary)]"
          >
            Become Rooted \u2014 $9/month
          </button>
          <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
            Cancel anytime. No commitment. No guilt.
            <br />This is an investment, not a subscription trap.
          </p>
        </div>
      )}

      {/* Philosophy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-5 rounded-3xl bg-gradient-to-br from-accent/5 via-card to-card border border-accent/10 text-center"
      >
        <Heart className="w-5 h-5 text-accent mx-auto mb-2" />
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          We designed this to feel empowering, not exploitative. 
          The free tier is complete on its own. Premium deepens the practice 
          for people ready to go further.
        </p>
      </motion.div>
    </div>
  );
}
