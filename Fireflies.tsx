import { useEffect, useRef } from 'react';

const DEFAULT_COUNT = 18;

interface FireflyProps {
  count?: number;
  sizeMultiplier?: number;
  brightnessMultiplier?: number;
}

interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
  speed: number;
}

export default function Fireflies({ count = DEFAULT_COUNT, sizeMultiplier = 1, brightnessMultiplier = 1 }: FireflyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireflyRef = useRef<Firefly[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Init fireflies
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    fireflyRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: (1.5 + Math.random() * 2) * sizeMultiplier,
      opacity: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.01,
    }));

    const style = getComputedStyle(document.documentElement);
    const sageH = style.getPropertyValue('--sage').trim().split(' ')[0] || '152';
    const warmH = style.getPropertyValue('--warm').trim().split(' ')[0] || '28';

    const bm = brightnessMultiplier;

    const animate = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);

      fireflyRef.current.forEach((f) => {
        f.phase += f.speed;
        f.opacity = 0.15 + Math.sin(f.phase) * 0.35 + 0.35;

        f.x += f.vx;
        f.y += f.vy;

        // Gentle direction change
        f.vx += (Math.random() - 0.5) * 0.02;
        f.vy += (Math.random() - 0.5) * 0.02;
        f.vx *= 0.99;
        f.vy *= 0.99;

        // Wrap around
        if (f.x < -10) f.x = cw + 10;
        if (f.x > cw + 10) f.x = -10;
        if (f.y < -10) f.y = ch + 10;
        if (f.y > ch + 10) f.y = -10;

        const hue = f.phase % 2 > 1 ? warmH : sageH;
        const glowOpacity = Math.min(f.opacity * 0.5 * bm, 1);
        const coreOpacity = Math.min(f.opacity * bm, 1);

        // Glow
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 4);
        gradient.addColorStop(0, `hsla(${hue}, 40%, 65%, ${glowOpacity})`);
        gradient.addColorStop(1, `hsla(${hue}, 40%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 50%, 75%, ${coreOpacity})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [count, sizeMultiplier, brightnessMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
