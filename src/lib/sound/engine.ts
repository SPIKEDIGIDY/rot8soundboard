import { defaultFx, type FxState } from "@/lib/sound/fx";

type Nodes = {
  ctx: AudioContext;
  input: GainNode;
  bass: BiquadFilterNode;
  flangeDry: GainNode;
  flangeWet: GainNode;
  flangeDelay: DelayNode;
  flangeFb: GainNode;
  sum1: GainNode;
  echoDry: GainNode;
  echoWet: GainNode;
  echoDelay: DelayNode;
  echoFb: GainNode;
  sum2: GainNode;
  verbDry: GainNode;
  verbWet: GainNode;
  verb: ConvolverNode;
  sum3: GainNode;
  comp: DynamicsCompressorNode;
  master: GainNode;
  lfo: OscillatorNode;
  lfoDepth: GainNode;
  impulse: AudioBuffer;
};

function makeImpulse(ctx: BaseAudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * 1.7);
  const buffer = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) ** 2.8;
    }
    for (const tap of [0.011, 0.019, 0.029, 0.043]) {
      const index = Math.floor(tap * rate);
      if (index < length) data[index] += channel === 0 ? 0.45 : 0.3;
    }
  }
  return buffer;
}

function connectGraph(n: Nodes) {
  n.flangeDelay.delayTime.value = 0.0035;
  n.echoDelay.delayTime.value = 0.26;

  n.input.connect(n.bass);
  n.bass.connect(n.flangeDry);
  n.flangeDry.connect(n.sum1);
  n.bass.connect(n.flangeDelay);
  n.flangeDelay.connect(n.flangeWet);
  n.flangeWet.connect(n.sum1);
  n.flangeDelay.connect(n.flangeFb);
  n.flangeFb.connect(n.flangeDelay);

  n.sum1.connect(n.echoDry);
  n.echoDry.connect(n.sum2);
  n.sum1.connect(n.echoDelay);
  n.echoDelay.connect(n.echoWet);
  n.echoWet.connect(n.sum2);
  n.echoDelay.connect(n.echoFb);
  n.echoFb.connect(n.echoDelay);

  n.sum2.connect(n.verbDry);
  n.verbDry.connect(n.sum3);
  n.sum2.connect(n.verb);
  n.verb.connect(n.verbWet);
  n.verbWet.connect(n.sum3);

  n.sum3.connect(n.comp);
  n.comp.connect(n.master);
  n.master.connect(n.ctx.destination);
  n.lfoDepth.connect(n.flangeDelay.delayTime);
}

function disconnectGraph(n: Nodes) {
  for (const node of [
    n.input,
    n.bass,
    n.flangeDry,
    n.flangeDelay,
    n.flangeWet,
    n.flangeFb,
    n.sum1,
    n.echoDry,
    n.echoDelay,
    n.echoWet,
    n.echoFb,
    n.sum2,
    n.verbDry,
    n.verb,
    n.verbWet,
    n.sum3,
    n.comp,
    n.master,
  ]) {
    node.disconnect();
  }
  n.lfoDepth.disconnect();
}

export class DeckEngine {
  private nodes: Nodes | null = null;
  private wired = false;
  private sources = new Set<AudioBufferSourceNode>();
  private fx: FxState = defaultFx();
  private volume = 0.85;

  setFx(fx: FxState) {
    this.fx = fx;
    if (this.nodes) this.apply();
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.nodes) this.apply();
  }

  async resume() {
    const nodes = this.ensure();
    if (nodes.ctx.state !== "running") await nodes.ctx.resume();
  }

  play(buffer: AudioBuffer, onEnd: () => void) {
    const nodes = this.ensure();
    if (this.sources.size >= 12) {
      const oldest = this.sources.values().next().value;
      oldest?.stop();
    }
    const source = nodes.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(nodes.input);
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      onEnd();
    };
    source.start();
  }

  stopAll() {
    for (const source of this.sources) {
      try {
        source.onended = null;
        source.stop();
        source.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    this.killTails();
  }

  private ensure(): Nodes {
    if (this.nodes) return this.nodes;
    const ctx = new AudioContext();
    const impulse = makeImpulse(ctx);
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.25;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.0008;
    lfo.connect(lfoDepth);
    lfo.start();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 10;
    comp.ratio.value = 8;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;

    const nodes: Nodes = {
      ctx,
      input: ctx.createGain(),
      bass: ctx.createBiquadFilter(),
      flangeDry: ctx.createGain(),
      flangeWet: ctx.createGain(),
      flangeDelay: ctx.createDelay(0.05),
      flangeFb: ctx.createGain(),
      sum1: ctx.createGain(),
      echoDry: ctx.createGain(),
      echoWet: ctx.createGain(),
      echoDelay: ctx.createDelay(2),
      echoFb: ctx.createGain(),
      sum2: ctx.createGain(),
      verbDry: ctx.createGain(),
      verbWet: ctx.createGain(),
      verb: ctx.createConvolver(),
      sum3: ctx.createGain(),
      comp,
      master: ctx.createGain(),
      lfo,
      lfoDepth,
      impulse,
    };
    nodes.input.gain.value = 0.9;
    nodes.bass.type = "lowshelf";
    nodes.bass.frequency.value = 110;
    nodes.verb.buffer = impulse;
    this.nodes = nodes;
    connectGraph(nodes);
    this.wired = true;
    this.apply();
    return nodes;
  }

  private killTails() {
    const nodes = this.nodes;
    if (!nodes || !this.wired) return;
    disconnectGraph(nodes);
    this.wired = false;
    nodes.flangeDelay = nodes.ctx.createDelay(0.05);
    nodes.echoDelay = nodes.ctx.createDelay(2);
    nodes.verb = nodes.ctx.createConvolver();
    nodes.verb.buffer = nodes.impulse;
    connectGraph(nodes);
    this.wired = true;
    this.apply();
  }

  private apply() {
    const n = this.nodes;
    if (!n) return;
    const t = n.ctx.currentTime;
    const glide = 0.03;

    const reverb = n.ctx && this.fx.reverb.on ? this.fx.reverb.amount : 0;
    n.verbDry.gain.setTargetAtTime(1 - reverb * 0.4, t, glide);
    n.verbWet.gain.setTargetAtTime(reverb * 0.85, t, glide);

    const flange = this.fx.flange.on ? this.fx.flange.amount : 0;
    n.flangeDry.gain.setTargetAtTime(1, t, glide);
    n.flangeWet.gain.setTargetAtTime(flange * 0.72, t, glide);
    n.flangeFb.gain.setTargetAtTime(flange * 0.32, t, glide);
    n.lfo.frequency.setTargetAtTime(0.16 + flange * 0.85, t, glide);
    n.lfoDepth.gain.setTargetAtTime(0.00035 + flange * 0.0021, t, glide);
    n.flangeDelay.delayTime.setTargetAtTime(0.0035, t, glide);

    const echo = this.fx.echo.on ? this.fx.echo.amount : 0;
    n.echoDry.gain.setTargetAtTime(1 - echo * 0.2, t, glide);
    n.echoWet.gain.setTargetAtTime(echo * 0.55, t, glide);
    n.echoFb.gain.setTargetAtTime(echo * 0.5, t, glide);
    n.echoDelay.delayTime.setTargetAtTime(0.16 + echo * 0.26, t, glide);

    const bass = this.fx.bass.on ? this.fx.bass.amount : 0;
    n.bass.gain.setTargetAtTime(bass * 16, t, glide);
    n.master.gain.setTargetAtTime(this.volume, t, glide);
  }
}

const HOLDER = "__limeSoundboard";

export function getDeck(): DeckEngine {
  const host = window as unknown as Record<string, DeckEngine | undefined>;
  if (!host[HOLDER]) host[HOLDER] = new DeckEngine();
  return host[HOLDER];
}
