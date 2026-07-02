// Notes used by the ambient music layer, in Hz (A minor pentatonic).
const PAD_CHORD = [110, 164.81, 220]; // A2, E3, A3
const BELL_SCALE = [440, 493.88, 587.33, 659.25, 880, 987.77];

// All sound is synthesized via Web Audio (no external audio assets needed).
export class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private reverbSend: DelayNode | null = null;

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
    if (!this.musicGain) this.startMusic();
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

  // A slow, evolving oceanic pad plus occasional soft "bell" plucks - the
  // ambient music bed, layered on top of the low pressure-hum drone above.
  private startMusic(): void {
    const ctx = this.ensureCtx();

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.09;
    this.musicGain.connect(this.masterGain!);

    // Shared delay-based "reverb" send so the pad and bells feel spacious/underwater.
    this.reverbSend = ctx.createDelay(1);
    this.reverbSend.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    this.reverbSend.connect(feedback);
    feedback.connect(this.reverbSend);
    this.reverbSend.connect(wet);
    wet.connect(this.musicGain);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 900;
    this.padFilter.connect(this.musicGain);
    this.padFilter.connect(this.reverbSend);

    for (const freq of PAD_CHORD) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.22;
      // Slow independent tremolo per note gives the pad a "breathing" swell.
      const tremolo = ctx.createOscillator();
      tremolo.frequency.value = 0.03 + Math.random() * 0.04;
      const tremoloDepth = ctx.createGain();
      tremoloDepth.gain.value = 0.12;
      tremolo.connect(tremoloDepth);
      tremoloDepth.connect(voiceGain.gain);
      osc.connect(voiceGain);
      voiceGain.connect(this.padFilter);
      osc.start();
      tremolo.start();
    }

    // Very slow filter drift so the pad's timbre never feels static.
    const filterLfo = ctx.createOscillator();
    filterLfo.frequency.value = 1 / 45;
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 300;
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(this.padFilter.frequency);
    filterLfo.start();

    this.scheduleBell();
  }

  private scheduleBell(): void {
    const delay = 4000 + Math.random() * 6000;
    setTimeout(() => {
      this.playBell();
      this.scheduleBell();
    }, delay);
  }

  private playBell(): void {
    const ctx = this.ensureCtx();
    if (!this.musicGain || !this.reverbSend) return;
    const freq = BELL_SCALE[Math.floor(Math.random() * BELL_SCALE.length)];
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.2);
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.random() * 1.6 - 0.8;
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.musicGain);
    panner.connect(this.reverbSend);
    osc.start(t0);
    osc.stop(t0 + 3.3);
  }

  setAmbientDepthIntensity(depthFrac: number): void {
    if (this.ambientGain) this.ambientGain.gain.value = 0.04 + depthFrac * 0.08;
    // Deeper water reads darker: the pad's filter cutoff closes as light fades.
    if (this.padFilter) this.padFilter.frequency.value = 1100 - depthFrac * 700;
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
