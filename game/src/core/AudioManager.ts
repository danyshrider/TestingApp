// All sound is synthesized via Web Audio (no external audio assets needed).
export class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  resume(): void {
    const ctx = this.ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    if (!this.ambientGain) this.startAmbient();
  }

  private startAmbient(): void {
    const ctx = this.ensureCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 60;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    lfo.start();
    this.ambientGain = gain;
  }

  setAmbientDepthIntensity(depthFrac: number): void {
    if (this.ambientGain) this.ambientGain.gain.value = 0.04 + depthFrac * 0.08;
  }

  private blip(freq: number, duration: number, type: OscillatorType, gainValue: number, delay = 0): void {
    const ctx = this.ensureCtx();
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  uiClick(): void {
    this.blip(880, 0.06, 'square', 0.06);
  }

  pickupItem(): void {
    this.blip(660, 0.12, 'sine', 0.15);
    this.blip(990, 0.12, 'sine', 0.1, 0.05);
  }

  craft(): void {
    this.blip(220, 0.15, 'sawtooth', 0.1);
    this.blip(440, 0.15, 'sawtooth', 0.08, 0.1);
  }

  hurt(): void {
    this.blip(140, 0.25, 'sawtooth', 0.2);
  }

  sonarPing(): void {
    this.blip(1400, 0.5, 'sine', 0.12);
    this.blip(1400, 1.2, 'sine', 0.04, 0.5);
  }

  blueprintUnlock(): void {
    this.blip(523, 0.2, 'triangle', 0.12);
    this.blip(659, 0.2, 'triangle', 0.12, 0.12);
    this.blip(784, 0.3, 'triangle', 0.14, 0.24);
  }

  distantRoar(intensity: number): void {
    const ctx = this.ensureCtx();
    const t0 = ctx.currentTime;
    const dur = 2.5;
    const bufferSize = ctx.sampleRate * dur;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 90 + intensity * 60;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.15 * intensity + 0.02, t0 + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start(t0);
  }

  radioSignal(): void {
    this.blip(1200, 0.08, 'square', 0.08);
    this.blip(900, 0.08, 'square', 0.08, 0.1);
    this.blip(1200, 0.08, 'square', 0.08, 0.2);
  }

  alert(): void {
    this.blip(880, 0.15, 'square', 0.12);
    this.blip(440, 0.15, 'square', 0.12, 0.18);
  }
}

export const audio = new AudioManager();
