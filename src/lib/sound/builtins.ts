function distortCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(amount * x);
  }
  return curve as Float32Array<ArrayBuffer>;
}

function noiseBuffer(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function envGain(
  ctx: BaseAudioContext,
  start: number,
  attack: number,
  peak: number,
  releaseAt: number,
  end: number,
): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.setValueAtTime(peak, Math.max(start + attack, releaseAt));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  return gain;
}

type RenderFn = (ctx: OfflineAudioContext, dest: AudioNode) => void;

const CLIPS: { seconds: number; render: RenderFn }[] = [
  {
    seconds: 1.15,
    render: (ctx, dest) => {
      const end = 1.15;
      const shape = ctx.createWaveShaper();
      shape.curve = distortCurve(6);
      shape.oversample = "2x";
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.setValueAtTime(2400, 0);
      tone.frequency.exponentialRampToValueAtTime(900, end);
      const gain = envGain(ctx, 0, 0.02, 0.55, 0.72, end);
      shape.connect(tone);
      tone.connect(gain);
      gain.connect(dest);
      for (const freq of [233, 370, 466]) {
        const saw = ctx.createOscillator();
        const square = ctx.createOscillator();
        saw.type = "sawtooth";
        square.type = "square";
        saw.frequency.setValueAtTime(freq, 0);
        square.frequency.setValueAtTime(freq * 1.012, 0);
        saw.frequency.exponentialRampToValueAtTime(freq * 0.86, end);
        square.frequency.exponentialRampToValueAtTime(freq * 0.86, end);
        const mix = ctx.createGain();
        mix.gain.value = 0.22;
        saw.connect(mix);
        square.connect(mix);
        mix.connect(shape);
        saw.start(0);
        square.start(0);
        saw.stop(end);
        square.stop(end);
      }
      const puff = ctx.createBufferSource();
      puff.buffer = noiseBuffer(ctx, 0.08);
      const puffGain = envGain(ctx, 0, 0.005, 0.25, 0.02, 0.08);
      puff.connect(puffGain);
      puffGain.connect(dest);
      puff.start(0);
      puff.stop(0.08);
    },
  },
  {
    seconds: 0.48,
    render: (ctx, dest) => {
      const end = 0.45;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1700, 0);
      osc.frequency.exponentialRampToValueAtTime(90, end);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(4200, 0);
      filter.frequency.exponentialRampToValueAtTime(500, end);
      const gain = envGain(ctx, 0, 0.008, 0.4, 0.05, end);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(0);
      osc.stop(end);
    },
  },
  {
    seconds: 1.05,
    render: (ctx, dest) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, 0);
      osc.frequency.exponentialRampToValueAtTime(34, 0.5);
      const body = envGain(ctx, 0, 0.008, 0.85, 0.18, 1.02);
      osc.connect(body);
      body.connect(dest);
      osc.start(0);
      osc.stop(1.02);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx, 0.4);
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.setValueAtTime(900, 0);
      low.frequency.exponentialRampToValueAtTime(90, 0.35);
      const crack = envGain(ctx, 0, 0.004, 0.65, 0.05, 0.38);
      noise.connect(low);
      low.connect(crack);
      crack.connect(dest);
      noise.start(0);
      noise.stop(0.4);
    },
  },
  {
    seconds: 0.42,
    render: (ctx, dest) => {
      const blip = (freq: number, time: number, length: number) => {
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = freq;
        const high = ctx.createBiquadFilter();
        high.type = "highpass";
        high.frequency.value = 500;
        const gain = envGain(ctx, time, 0.008, 0.28, time + 0.04, time + length);
        osc.connect(high);
        high.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + length + 0.02);
      };
      blip(988, 0, 0.11);
      blip(1319, 0.09, 0.26);
    },
  },
  {
    seconds: 1.45,
    render: (ctx, dest) => {
      const end = 1.4;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const steps = 70;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * end;
        const wobble = Math.sin(t * Math.PI * 2 * 1.7);
        osc.frequency.setValueAtTime(640 + wobble * 230, t);
      }
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2200;
      const gain = envGain(ctx, 0, 0.03, 0.32, end - 0.12, end);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(0);
      osc.stop(end);
    },
  },
  {
    seconds: 0.72,
    render: (ctx, dest) => {
      const end = 0.7;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx, end);
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 3.2;
      band.frequency.setValueAtTime(200, 0);
      band.frequency.exponentialRampToValueAtTime(4800, 0.32);
      band.frequency.exponentialRampToValueAtTime(280, end);
      const gain = envGain(ctx, 0, 0.08, 0.55, 0.28, end);
      noise.connect(band);
      band.connect(gain);
      gain.connect(dest);
      noise.start(0);
      noise.stop(end);
    },
  },
  {
    seconds: 1.15,
    render: (ctx, dest) => {
      const end = 1.12;
      const shape = ctx.createWaveShaper();
      shape.curve = distortCurve(5);
      const low = ctx.createBiquadFilter();
      low.type = "lowpass";
      low.frequency.setValueAtTime(1400, 0);
      low.frequency.exponentialRampToValueAtTime(160, 0.8);
      const gain = envGain(ctx, 0, 0.02, 0.7, 0.35, end);
      shape.connect(low);
      low.connect(gain);
      gain.connect(dest);
      const saw = ctx.createOscillator();
      saw.type = "sawtooth";
      saw.frequency.setValueAtTime(160, 0);
      saw.frequency.exponentialRampToValueAtTime(36, 0.75);
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(80, 0);
      sub.frequency.exponentialRampToValueAtTime(36, 0.75);
      const subGain = ctx.createGain();
      subGain.gain.value = 0.65;
      saw.connect(shape);
      sub.connect(subGain);
      subGain.connect(shape);
      saw.start(0);
      sub.start(0);
      saw.stop(end);
      sub.stop(end);
    },
  },
  {
    seconds: 0.28,
    render: (ctx, dest) => {
      const end = 0.26;
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(1400, 0);
      osc.frequency.exponentialRampToValueAtTime(180, end);
      const gain = envGain(ctx, 0, 0.004, 0.32, 0.03, end);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx, end);
      const high = ctx.createBiquadFilter();
      high.type = "highpass";
      high.frequency.value = 1800;
      const noiseGain = envGain(ctx, 0, 0.003, 0.28, 0.02, 0.12);
      osc.connect(gain);
      gain.connect(dest);
      noise.connect(high);
      high.connect(noiseGain);
      noiseGain.connect(dest);
      osc.start(0);
      noise.start(0);
      osc.stop(end);
      noise.stop(end);
    },
  },
  {
    seconds: 0.7,
    render: (ctx, dest) => {
      for (const time of [0, 0.18, 0.36]) {
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 880;
        const gain = envGain(ctx, time, 0.01, 0.28, time + 0.05, time + 0.14);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.16);
      }
    },
  },
  {
    seconds: 0.86,
    render: (ctx, dest) => {
      const end = 0.84;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx, end);
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 7;
      const points = [2200, 380, 3000, 460, 2500, 320, 1600];
      const step = end / (points.length - 1);
      points.forEach((freq, index) => {
        band.frequency.linearRampToValueAtTime(freq, index * step);
      });
      const gain = envGain(ctx, 0, 0.01, 0.45, end - 0.08, end);
      noise.connect(band);
      band.connect(gain);
      gain.connect(dest);
      noise.start(0);
      noise.stop(end);

      const crackle = ctx.createBuffer(1, Math.floor(ctx.sampleRate * end), ctx.sampleRate);
      const data = crackle.getChannelData(0);
      for (let i = 0; i < 36; i++) {
        data[Math.floor(Math.random() * data.length)] = Math.random() > 0.5 ? 0.9 : -0.9;
      }
      const clicks = ctx.createBufferSource();
      clicks.buffer = crackle;
      const clickGain = ctx.createGain();
      clickGain.gain.value = 0.22;
      clicks.connect(clickGain);
      clickGain.connect(dest);
      clicks.start(0);
      clicks.stop(end);
    },
  },
];

export function renderBuiltins(): Promise<AudioBuffer[]> {
  return Promise.all(
    CLIPS.map(async ({ seconds, render }) => {
      const ctx = new OfflineAudioContext(2, Math.ceil(44100 * seconds), 44100);
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -8;
      compressor.knee.value = 8;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.12;
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(compressor);
      compressor.connect(ctx.destination);
      render(ctx, master);
      return ctx.startRendering();
    }),
  );
}
