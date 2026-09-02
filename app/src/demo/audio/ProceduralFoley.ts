import type { AmbientSoundProfile } from "../../types/forensics";

export class ProceduralFoleyEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentProfile: AmbientSoundProfile = "noir_rain_traffic";
  private tickInterval: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();
      
      this.ambientGain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setProfile(profile: AmbientSoundProfile) {
    this.currentProfile = profile;
    if (this.isPlaying) {
      this.stop();
      this.start(profile);
    }
  }

  public start(profile: AmbientSoundProfile = this.currentProfile) {
    this.init();
    if (!this.ctx || !this.ambientGain) return;
    this.stop();

    this.isPlaying = true;
    this.currentProfile = profile;

    if (profile === "noir_rain_traffic" || profile === "tape_hiss_polaroid") {
      this.startRainAndHiss(profile);
    } else if (profile === "muffled_parlor_clock") {
      this.startClockAndHiss();
    } else if (profile === "windy_coast_gulls") {
      this.startWindAndSurf();
    } else {
      this.startRainAndHiss("tape_hiss_polaroid");
    }
  }

  /**
   * Pink noise (Paul Kellett approximation): -3dB/octave, sounds like a soft natural
   * rush rather than the harsh top-end hiss of white noise. Used for tape ambience.
   */
  private fillPinkNoise(output: Float32Array) {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < output.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }

  /**
   * Brown noise: -6dB/octave, a low soft roar with almost no harsh highs. Used for
   * the rain/traffic bed.
   */
  private fillBrownNoise(output: Float32Array) {
    let last = 0;
    for (let i = 0; i < output.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      output[i] = last * 3.2;
    }
  }

  private startRainAndHiss(profile: AmbientSoundProfile) {
    if (!this.ctx || !this.ambientGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    const isRain = profile === "noir_rain_traffic";
    if (isRain) {
      this.fillBrownNoise(output);
    } else {
      this.fillPinkNoise(output);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Gentle, non-resonant lowpass to keep the top-end soft (no whistle/hiss).
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.setValueAtTime(0.4, this.ctx.currentTime);
    filter.frequency.setValueAtTime(isRain ? 500 : 2600, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    noise.start();

    this.noiseNode = noise;
  }

  private startClockAndHiss() {
    if (!this.ctx || !this.ambientGain) return;

    this.startRainAndHiss("tape_hiss_polaroid");

    // Synthesize clock tick pulses
    this.tickInterval = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      try {
        const osc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

        tickGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(tickGain);
        if (this.masterGain) {
          tickGain.connect(this.masterGain);
        }
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch {
        // Safe context ignore
      }
    }, 1000);
  }

  private startWindAndSurf() {
    if (!this.ctx || !this.ambientGain) return;
    this.startRainAndHiss("noir_rain_traffic");
  }

  public duckAudio(isDucking: boolean) {
    if (!this.ctx || !this.ambientGain) return;
    const target = isDucking ? 0.05 : 0.16;
    this.ambientGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25);
  }

  public setVolume(volume: number) {
    if (!this.ctx || !this.ambientGain) return;
    this.ambientGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.1);
  }

  public stop() {
    this.isPlaying = false;
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
      } catch {
        // Audio node already stopped
      }
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }

    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}

export const foleyEngine = new ProceduralFoleyEngine();
