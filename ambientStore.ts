import { create } from 'zustand';
import { haptics } from './haptics';

export interface Soundscape {
  id: string;
  name: string;
  emoji: string;
  description: string;
  frequencies: { freq: number; type: OscillatorType; vol: number }[];
  lfoRate: number;
}

export const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    emoji: '🌧️',
    description: 'Soft rainfall for deep focus',
    frequencies: [
      { freq: 200, type: 'sawtooth', vol: 0.02 },
      { freq: 500, type: 'sawtooth', vol: 0.015 },
      { freq: 1000, type: 'sawtooth', vol: 0.01 },
    ],
    lfoRate: 0.3,
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    emoji: '🌊',
    description: 'Rhythmic waves for calm',
    frequencies: [
      { freq: 100, type: 'sine', vol: 0.04 },
      { freq: 150, type: 'sine', vol: 0.03 },
      { freq: 60, type: 'sine', vol: 0.02 },
    ],
    lfoRate: 0.08,
  },
  {
    id: 'forest',
    name: 'Forest Breeze',
    emoji: '🌲',
    description: 'Wind through the trees',
    frequencies: [
      { freq: 300, type: 'sawtooth', vol: 0.01 },
      { freq: 800, type: 'sawtooth', vol: 0.008 },
      { freq: 2000, type: 'sawtooth', vol: 0.005 },
    ],
    lfoRate: 0.15,
  },
  {
    id: 'night',
    name: 'Night Sky',
    emoji: '🌙',
    description: 'Crickets and stillness',
    frequencies: [
      { freq: 3800, type: 'sine', vol: 0.008 },
      { freq: 4200, type: 'sine', vol: 0.006 },
      { freq: 120, type: 'sine', vol: 0.015 },
    ],
    lfoRate: 4,
  },
  {
    id: 'bowls',
    name: 'Singing Bowls',
    emoji: '🔔',
    description: 'Tibetan resonance',
    frequencies: [
      { freq: 256, type: 'sine', vol: 0.04 },
      { freq: 384, type: 'sine', vol: 0.03 },
      { freq: 512, type: 'sine', vol: 0.02 },
    ],
    lfoRate: 0.5,
  },
  {
    id: 'white',
    name: 'White Noise',
    emoji: '☁️',
    description: 'Consistent masking noise',
    frequencies: [
      { freq: 440, type: 'sawtooth', vol: 0.015 },
      { freq: 880, type: 'sawtooth', vol: 0.012 },
      { freq: 1760, type: 'sawtooth', vol: 0.01 },
      { freq: 3520, type: 'sawtooth', vol: 0.008 },
    ],
    lfoRate: 0.01,
  },
];

interface AmbientNodes {
  oscs: OscillatorNode[];
  gains: GainNode[];
  master: GainNode;
}

interface AmbientStore {
  playing: string | null;
  volume: number;
  _ctx: AudioContext | null;
  _nodes: AmbientNodes | null;
  play: (scape: Soundscape) => void;
  stop: () => void;
  setVolume: (v: number) => void;
}

export const useAmbientStore = create<AmbientStore>((set, get) => ({
  playing: null,
  volume: 0.5,
  _ctx: null,
  _nodes: null,

  stop: () => {
    const { _nodes } = get();
    if (_nodes) {
      _nodes.oscs.forEach(o => { try { o.stop(); } catch {} });
    }
    set({ playing: null, _nodes: null });
  },

  play: (scape: Soundscape) => {
    const state = get();
    state.stop();

    const ctx = state._ctx || new AudioContext();
    const master = ctx.createGain();
    master.gain.setValueAtTime(state.volume * 0.5, ctx.currentTime);
    master.connect(ctx.destination);

    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    scape.frequencies.forEach(({ freq, type, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);

      lfo.frequency.setValueAtTime(scape.lfoRate, ctx.currentTime);
      lfoGain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      osc.connect(gain);
      gain.connect(master);
      osc.start();
      oscs.push(osc);
      gains.push(gain);
    });

    set({ playing: scape.id, _ctx: ctx, _nodes: { oscs, gains, master } });
    haptics.light();
  },

  setVolume: (v: number) => {
    set({ volume: v });
    const { _nodes, _ctx } = get();
    if (_nodes && _ctx) {
      _nodes.master.gain.setValueAtTime(v * 0.5, _ctx.currentTime);
    }
  },
}));
