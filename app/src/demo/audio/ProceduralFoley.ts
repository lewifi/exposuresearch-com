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
      
      this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
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

  private startRainAndHiss(profile: AmbientSoundProfile) {
    if (!this.ctx || !this.ambientGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate rain or analog tape
    const filter = this.ctx.createBiquadFilter();
    if (profile === "noir_rain_traffic") {
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    } else {
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();

    this.noiseNode = whiteNoise;
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
    const target = isDucking ? 0.08 : 0.28;
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
