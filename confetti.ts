import confetti from 'canvas-confetti';

export function fireConfetti() {
  // Burst from left
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors: ['#6B8F71', '#A3C4A8', '#B8A9D4', '#F5C97E', '#E8B4B8'],
  });
  // Burst from right
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors: ['#6B8F71', '#A3C4A8', '#B8A9D4', '#F5C97E', '#E8B4B8'],
  });
}

export function fireStars() {
  confetti({
    particleCount: 30,
    spread: 360,
    ticks: 60,
    gravity: 0.4,
    origin: { x: 0.5, y: 0.4 },
    shapes: ['star'],
    colors: ['#6B8F71', '#F5C97E'],
    scalar: 1.2,
  });
}

export function fireMilestone() {
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ['#6B8F71', '#A3C4A8', '#F5C97E', '#B8A9D4', '#E8B4B8', '#FFD700'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // Big center burst
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 360,
      origin: { x: 0.5, y: 0.35 },
      colors,
      shapes: ['star', 'circle'],
      scalar: 1.4,
      ticks: 100,
      gravity: 0.6,
    });
  }, 300);
}
