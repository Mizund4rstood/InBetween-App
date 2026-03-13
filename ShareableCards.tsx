import { useState } from "react";
import { motion } from "framer-motion";

const cards = [
  { id: 1, quote: "You're not behind. You're in between.", context: "For when life feels paused", theme: { bg: "hsl(25, 20%, 5%)", accent: "hsl(35, 40%, 63%)", text: "hsl(30, 35%, 93%)", sub: "hsl(25, 18%, 41%)" } },
  { id: 2, quote: "Grief is love with nowhere to go. Give it time to find a new shape.", context: "For grief & loss", theme: { bg: "hsl(215, 30%, 5%)", accent: "hsl(210, 40%, 63%)", text: "hsl(215, 45%, 93%)", sub: "hsl(210, 15%, 38%)" } },
  { id: 3, quote: "You left something that was hurting you. That took everything.", context: "For divorce & breakups", theme: { bg: "hsl(345, 30%, 5%)", accent: "hsl(345, 40%, 63%)", text: "hsl(345, 45%, 93%)", sub: "hsl(345, 18%, 38%)" } },
  { id: 4, quote: "Your identity is bigger than your job title ever was.", context: "For career change & job loss", theme: { bg: "hsl(140, 25%, 5%)", accent: "hsl(130, 40%, 63%)", text: "hsl(130, 45%, 93%)", sub: "hsl(140, 18%, 38%)" } },
  { id: 5, quote: "One day at a time isn't small. It's the whole thing.", context: "For sobriety & recovery", theme: { bg: "hsl(195, 30%, 5%)", accent: "hsl(190, 35%, 62%)", text: "hsl(195, 45%, 93%)", sub: "hsl(195, 25%, 38%)" } },
  { id: 6, quote: "A new city doesn't know your old story. That's terrifying. That's also freedom.", context: "For relocation", theme: { bg: "hsl(270, 20%, 5%)", accent: "hsl(270, 40%, 63%)", text: "hsl(270, 45%, 93%)", sub: "hsl(270, 15%, 38%)" } },
  { id: 7, quote: "Your body changed the plan. Your courage didn't have to.", context: "For health diagnosis", theme: { bg: "hsl(50, 30%, 5%)", accent: "hsl(48, 40%, 63%)", text: "hsl(48, 45%, 93%)", sub: "hsl(48, 18%, 41%)" } },
  { id: 8, quote: "The person you're becoming doesn't have to apologize for outgrowing the old one.", context: "For identity shifts", theme: { bg: "hsl(220, 20%, 5%)", accent: "hsl(220, 35%, 63%)", text: "hsl(220, 45%, 93%)", sub: "hsl(220, 15%, 38%)" } },
];

const svgGrain = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(#n)' opacity='0.06'/></svg>`;
const grainUrl = `url("data:image/svg+xml,${encodeURIComponent(svgGrain)}")`;

function CardFace({ card, large = false }: { card: typeof cards[0]; large?: boolean }) {
  const { quote, context, theme } = card;

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden w-full"
      style={{
        background: theme.bg,
        borderRadius: large ? "20px" : "12px",
        padding: large ? "44px 40px" : "20px 18px",
        aspectRatio: "1 / 1",
        border: `1px solid ${theme.accent}25`,
      }}
    >
      <div className="absolute inset-0 opacity-50 pointer-events-none z-[1]" style={{ backgroundImage: grainUrl, backgroundRepeat: "repeat" }} />
      <div className="absolute pointer-events-none z-0" style={{ top: "-25%", right: "-15%", width: "55%", height: "55%", background: `radial-gradient(circle, ${theme.accent}1a 0%, transparent 70%)` }} />
      <div className="absolute pointer-events-none z-0" style={{ bottom: "-20%", left: "-10%", width: "45%", height: "45%", background: `radial-gradient(circle, ${theme.accent}0f 0%, transparent 70%)` }} />

      <div className="relative z-[2]">
        <span
          className="inline-block rounded-full font-medium uppercase font-sans"
          style={{
            background: `${theme.accent}18`,
            border: `1px solid ${theme.accent}35`,
            padding: large ? "5px 14px" : "3px 9px",
            fontSize: large ? "11px" : "7.5px",
            letterSpacing: "2px",
            color: theme.accent,
          }}
        >
          {context}
        </span>
      </div>

      <div className="relative z-[2] flex-1 flex items-center" style={{ padding: large ? "20px 0" : "10px 0" }}>
        <blockquote
          className="m-0 italic"
          style={{
            fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
            fontSize: large ? "clamp(1rem, 2.2vw, 1.3rem)" : "clamp(0.72rem, 2.5vw, 0.82rem)",
            color: theme.text,
            lineHeight: 1.65,
          }}
        >
          "{quote}"
        </blockquote>
      </div>

      <div className="relative z-[2] flex justify-between items-center">
        <span className="uppercase font-sans" style={{ fontSize: large ? "11px" : "8px", color: theme.sub, letterSpacing: "2.5px" }}>InBetween</span>
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: large ? "26px" : "17px",
            height: large ? "26px" : "17px",
            background: `${theme.accent}18`,
            border: `1px solid ${theme.accent}40`,
            fontSize: large ? "11px" : "7px",
            color: theme.accent,
          }}
        >
          ∞
        </div>
      </div>
    </div>
  );
}

interface ShareableCardsProps {
  transitionId?: string | null;
}

const transitionCardMap: Record<string, number> = {
  divorce: 3,
  career: 4,
  grief: 2,
  relocation: 6,
  health: 7,
  identity: 8,
  sobriety: 5,
};

export default function ShareableCards({ transitionId }: ShareableCardsProps) {
  const defaultCard = transitionId ? cards.find(c => c.id === transitionCardMap[transitionId]) || cards[0] : cards[0];
  const [selected, setSelected] = useState(defaultCard);
  const [copied, setCopied] = useState(false);
  const [activeShare, setActiveShare] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${selected.quote}"\n\n— InBetween: Real tools for real life\nhttps://gentle-grounding-joy.lovable.app`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShareTo = (platform: string) => {
    setActiveShare(platform);
    const text = encodeURIComponent(`"${selected.quote}" — InBetween`);
    const url = encodeURIComponent("https://gentle-grounding-joy.lovable.app");
    const destinations: Record<string, string | null> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      instagram: null,
    };
    if (destinations[platform]) {
      window.open(destinations[platform]!, "_blank");
    } else {
      handleCopy();
    }
    setTimeout(() => setActiveShare(null), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="mt-8 w-full"
    >
      <p className="text-[10px] tracking-[3px] text-muted-foreground uppercase mb-4 font-sans text-center">
        Words for the in-between
      </p>
      <p className="text-muted-foreground text-xs text-center mb-6 italic">
        Pick a card. Share it. Let someone know they're not alone.
      </p>

      {/* Preview card */}
      <div className="mb-4">
        <CardFace card={selected} large />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={handleCopy}
          className="w-full rounded-lg py-3 px-5 text-xs font-medium tracking-wide transition-all border"
          style={{
            background: copied ? "hsl(130, 30%, 8%)" : "hsl(0, 0%, 7%)",
            borderColor: copied ? "hsl(130, 40%, 40%)" : "hsl(0, 0%, 12%)",
            color: copied ? "hsl(130, 40%, 63%)" : "hsl(0, 0%, 53%)",
          }}
        >
          {copied ? "✓  Copied to clipboard" : "Copy quote & link"}
        </button>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "twitter", label: "𝕏 Twitter" },
            { id: "instagram", label: "Instagram" },
            { id: "linkedin", label: "LinkedIn" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleShareTo(id)}
              className="rounded-lg py-2.5 px-2 text-[10px] font-medium tracking-wide transition-all border border-border bg-card text-muted-foreground hover:opacity-80"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelected(card)}
            className="cursor-pointer rounded-lg overflow-hidden transition-transform hover:-translate-y-1"
            style={{
              outline: selected.id === card.id ? `2px solid ${card.theme.accent}90` : "2px solid transparent",
              outlineOffset: "2px",
            }}
          >
            <CardFace card={card} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
