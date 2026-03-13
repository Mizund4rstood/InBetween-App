import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Users, Brain, Compass, Shield, Sparkles, ArrowRight, Eye, RefreshCw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MissionStatement from './MissionStatement';
import ScienceBehindThePause from './ScienceBehindThePause';

const AUDIENCES = [
  {
    icon: Shield,
    title: 'People in recovery',
    description: 'If you struggle with urges and emotional triggers from addiction, the tools here — noticing impulses, grounding the body, and finding the pause — were built from that exact experience.',
  },
  {
    icon: Brain,
    title: 'People with anxiety or emotional overwhelm',
    description: 'If your mind moves faster than you can handle, this app teaches you to slow down and observe your internal state instead of spiraling.',
  },
  {
    icon: Compass,
    title: 'People changing habits',
    description: 'Whether it\'s drinking, stress eating, avoidance, or procrastination — habits operate automatically. The pause and awareness tools help you interrupt that autopilot.',
  },
  {
    icon: Sparkles,
    title: 'People curious about their mind',
    description: 'If you simply want to understand how your thoughts, emotions, and reactions work, the reflective and educational tools here will help you see patterns you\'ve never noticed.',
  },
];

const SCIENCE_BRIDGES = [
  {
    icon: RefreshCw,
    label: 'The Habit Loop',
    personal: 'Drinking was my automatic response to every trigger — stress, shame, boredom. The behavior fired before I even had a thought.',
    science: 'Neuroscience calls this the Cue → Routine → Reward loop. The brain automates behavior through dopamine reinforcement until it runs without conscious input.',
  },
  {
    icon: Eye,
    label: 'The Awareness Gap',
    personal: 'For years, I only realized what I\'d done after the fact. The drink was already in my hand before I noticed the urge.',
    science: 'Psychologists call this the awareness gap — when consciousness arrives after the automatic reaction. Most people never experience choice because awareness comes too late.',
  },
  {
    icon: Brain,
    label: 'Moving Awareness Earlier',
    personal: 'In treatment, I learned to notice the impulse before acting on it. That tiny moment of noticing changed everything.',
    science: 'This activates the prefrontal cortex — the brain\'s control center — allowing it to regulate the amygdala\'s automatic responses. That\'s called top-down regulation.',
  },
  {
    icon: Zap,
    label: 'Neuroplasticity',
    personal: 'Each time I felt the urge and chose differently, the next time was slightly easier. The old pattern was genuinely losing its grip.',
    science: 'Every time you interrupt a habit loop, the old neural pathway weakens (synaptic pruning) and the new one strengthens. The brain physically rewires through repeated practice.',
  },
];

function fade(delay: number) {
  return { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5 } };
}

export default function WhyIBuiltThis() {
  const navigate = useNavigate();
  const [showScience, setShowScience] = useState(false);

  if (showScience) {
    return <ScienceBehindThePause onClose={() => setShowScience(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-serif font-bold">Why I Built This</h1>
        </div>

        {/* Mission Statement */}
        <MissionStatement className="mb-10" />

        {/* ─── The Core Phrase ─── */}
        <motion.div {...fade(0.1)} className="mb-12 text-center">
          <p className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight mb-4">
            "I learned how to catch the moment<br />
            <span className="text-primary">where choice becomes possible."</span>
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            That single discovery — after 18 years of addiction — is why this app exists.
          </p>
        </motion.div>

        {/* ─── The Story ─── */}
        <motion.article {...fade(0.2)} className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">A personal note from</p>
                <p className="font-semibold text-foreground">The Creator</p>
              </div>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-foreground">
            I battled alcohol addiction for 18 years. I didn't ask to be an alcoholic. In many ways, it felt like I was born into it — born into chaos and abuse, where alcohol became my escape almost immediately.
          </p>

          <p className="text-foreground/90 leading-relaxed">
            For a long time, I denied the problem. I didn't want my drinking to be connected to the abuse I'd experienced. But by the time I acknowledged it, I was already deeply addicted. The behavior was completely automatic.
          </p>

          {/* Science bridge: Habit Loop */}
          <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">The science behind this</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              What I didn't know then was that my brain had built a <strong>habit loop</strong> — Cue → Routine → Reward — reinforced by dopamine thousands of times over. The behavior wasn't a character flaw. It was an automated neural pathway running without my permission.
            </p>
          </div>

          <p className="text-foreground/90 leading-relaxed">
            I tried everything I could think of to stop. I wanted to do it alone, but eventually realized I couldn't. I reached a point of desperation — I couldn't keep living this way, yet couldn't imagine life without alcohol.
          </p>

          <div className="my-2 p-5 rounded-xl bg-muted/50 border-l-4 border-primary">
            <p className="text-foreground/90 italic">
              At my last attempt to get sober, I went away for four months. Almost completely isolated from the outside world. Instead of giving up, I poured myself into research, reflection, and learning how my mind actually worked.
            </p>
          </div>

          <p className="text-foreground/90 leading-relaxed">
            I started paying close attention to my emotional urges and the triggers behind them. I practiced becoming aware of the moment <em>before</em> I reacted.
          </p>

          {/* Science bridge: Awareness Gap */}
          <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">What I was really doing</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Without knowing the terminology, I was closing what psychologists call the <strong>awareness gap</strong> — the space where most people only realize what they did <em>after</em> the automatic reaction. I was training myself to notice the impulse <em>before</em> it took over, activating my prefrontal cortex to override the amygdala's automatic response.
            </p>
          </div>

          <p className="text-foreground/90 leading-relaxed font-medium">
            The tools I used during that time became the foundation of this app:
          </p>

          <ul className="space-y-2 my-4">
            {[
              'Daily gratitude — rewiring attention toward what\'s present, not what\'s missing',
              'Body awareness — learning to feel emotions physically before they hijack thinking',
              'Grounding exercises — interrupting spirals by anchoring to the senses',
              'Pattern recognition — seeing the triggers, not just the reactions',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground/90 text-sm leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-foreground/90 leading-relaxed">
            Along the way, I had to fight to be heard within systems that didn't trust my experience. A doctor once told me she wouldn't treat me the way I was asking — that I should go find someone else.
          </p>

          <p className="text-foreground/90 leading-relaxed font-medium">
            So I did. It turned out to be one of the best decisions I ever made.
          </p>

          {/* Science bridge: Neuroplasticity */}
          <div className="p-5 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Why it worked</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Each time I felt an urge and chose differently, <strong>neuroplasticity</strong> was working. The old neural pathway weakened. The new one strengthened. After 8 weeks of this kind of practice, brain scans show measurable increases in prefrontal cortex gray matter and decreased amygdala reactivity. I wasn't just resisting — I was physically rebuilding my brain.
            </p>
          </div>

          {/* The Turning Point */}
          <motion.div
            {...fade(0.3)}
            className="my-8 p-6 rounded-2xl bg-gradient-to-br from-primary/12 to-accent/8 border border-primary/20 text-center"
          >
            <p className="text-lg font-serif font-bold text-foreground leading-relaxed mb-3">
              Through all of this, I discovered something that changed my life:
            </p>
            <p className="text-xl md:text-2xl font-serif font-bold text-primary leading-tight">
              There is always a moment between impulse and action.
            </p>
            <p className="text-sm text-foreground/70 mt-3 leading-relaxed max-w-md mx-auto">
              Most people never notice it. It passes in a fraction of a second. But when you learn to catch it — when awareness arrives <em>before</em> the reaction instead of after — you gain the ability to choose.
            </p>
          </motion.div>

          <p className="text-foreground/90 leading-relaxed">
            That moment is what this app trains. Not through willpower. Not through shame. Through practice — the same kind of practice that physically changes the brain.
          </p>
        </motion.article>

        {/* ─── Story Meets Science ─── */}
        <motion.section {...fade(0.35)} className="mt-16 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-bold">Where Story Meets Science</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Everything I learned through lived experience, researchers have been studying for decades. Here's how my story maps to the science:
          </p>

          <div className="space-y-4">
            {SCIENCE_BRIDGES.map((bridge, i) => (
              <motion.div
                key={bridge.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="p-5 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <bridge.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{bridge.label}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-3 rounded-xl bg-accent/8 border border-accent/15">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wide block mb-1">My experience</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">{bridge.personal}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/8 border border-primary/15">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide block mb-1">The research</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">{bridge.science}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Who This Is For ─── */}
        <motion.section {...fade(0.45)}>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-bold">Who This Is For</h2>
          </div>

          <div className="space-y-4">
            {AUDIENCES.map((audience, i) => (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="p-5 rounded-2xl bg-card border border-border/50 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <audience.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{audience.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{audience.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── Science CTA ─── */}
        <motion.div {...fade(0.5)} className="mt-12">
          <button
            onClick={() => setShowScience(true)}
            className="w-full p-6 rounded-2xl bg-gradient-to-r from-violet-500/12 to-primary/8 border border-violet-400/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] active:scale-[0.98] transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">Science Behind the Pause</p>
              <p className="text-xs text-muted-foreground mt-0.5">Explore the neuroscience interactively — habit loops, awareness gap, neuroplasticity</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </motion.div>

        {/* ─── Closing ─── */}
        <motion.div {...fade(0.55)} className="mt-12 text-center">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/8 to-accent/8 border border-primary/15 mb-8">
            <p className="text-sm text-foreground leading-relaxed mb-2">
              This app was created by someone who walked through these patterns.
            </p>
            <p className="text-primary font-semibold text-sm">
              That lived experience — validated by science — is built into every tool.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-1">With hope,</p>
          <p className="text-lg font-serif font-semibold text-foreground">The Space Inbetween The Versions</p>
        </motion.div>

        {/* Back */}
        <motion.div {...fade(0.6)} className="mt-12 text-center pb-8">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold active:scale-[0.98] transition-transform"
          >
            Back to the App
          </button>
        </motion.div>
      </div>
    </div>
  );
}
