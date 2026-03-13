/**
 * Lightweight sound effects using the Web Audio API.
 * No external dependencies — works offline and is instant.
 */
import { useAppStore } from '@/stores/appStore';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function isMuted(): boolean {
  return !useAppStore.getState().isSoundEnabled;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (isMuted()) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playChord(freqs: number[], duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  freqs.forEach(f => playTone(f, duration, type, volume));
}

export const sounds = {
  /** Gentle chime — saving an entry */
  save() {
    if (isMuted()) return;
    const c = getCtx();
    [523, 659, 784].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.4, 'sine', 0.12), i * 100);
    });
  },

  /** Soft ascending — completing a step */
  step() {
    if (isMuted()) return;
    playTone(440, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(554, 0.15, 'sine', 0.1), 80);
  },

  /** Light tap — button press */
  tap() {
    playTone(800, 0.06, 'sine', 0.06);
  },

  /** Celebration fanfare — milestones */
  celebrate() {
    if (isMuted()) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.5, 'sine', 0.1), i * 120);
    });
    setTimeout(() => playChord([784, 988, 1175], 0.8, 'sine', 0.06), 500);
  },

  /** Calm breath tone — breathing timer inhale */
  breathIn() {
    if (isMuted()) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, c.currentTime);
    osc.frequency.linearRampToValueAtTime(330, c.currentTime + 0.6);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.6);
  },

  /** Calm breath tone — breathing timer exhale */
  breathOut() {
    if (isMuted()) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, c.currentTime);
    osc.frequency.linearRampToValueAtTime(220, c.currentTime + 0.6);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, c.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.6);
  },

  /** Peak zone enter — warm rising shimmer */
  peakEnter() {
    if (isMuted()) return;
    const c = getCtx();
    [440, 554, 659].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.07), i * 60);
    });
  },

  /** Peak zone exit — gentle descending release */
  peakExit() {
    if (isMuted()) return;
    const c = getCtx();
    [554, 440, 330].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.06), i * 70);
    });
  },

  /** Session complete — warm chord */
  complete() {
    if (isMuted()) return;
    playChord([392, 494, 587], 0.6, 'sine', 0.1);
    setTimeout(() => playChord([523, 659, 784], 1.0, 'sine', 0.08), 400);
  },
};
