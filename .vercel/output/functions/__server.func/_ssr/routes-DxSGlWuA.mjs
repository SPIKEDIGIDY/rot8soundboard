import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as SlidersHorizontal, d as Megaphone, f as Disc3, g as ArrowDown, h as Bell, i as Upload, l as Siren, m as Bomb, n as Wind, o as Square, p as Coins, r as Volume2, s as Sparkles, t as Zap, u as RotateCcw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DxSGlWuA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function distortCurve(amount) {
	const n = 256;
	const curve = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const x = i / 255 * 2 - 1;
		curve[i] = Math.tanh(amount * x);
	}
	return curve;
}
function noiseBuffer(ctx, seconds) {
	const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
	const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
	return buffer;
}
function envGain(ctx, start, attack, peak, releaseAt, end) {
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(1e-4, start);
	gain.gain.exponentialRampToValueAtTime(peak, start + attack);
	gain.gain.setValueAtTime(peak, Math.max(start + attack, releaseAt));
	gain.gain.exponentialRampToValueAtTime(1e-4, end);
	return gain;
}
var CLIPS = [
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
			const gain = envGain(ctx, 0, .02, .55, .72, end);
			shape.connect(tone);
			tone.connect(gain);
			gain.connect(dest);
			for (const freq of [
				233,
				370,
				466
			]) {
				const saw = ctx.createOscillator();
				const square = ctx.createOscillator();
				saw.type = "sawtooth";
				square.type = "square";
				saw.frequency.setValueAtTime(freq, 0);
				square.frequency.setValueAtTime(freq * 1.012, 0);
				saw.frequency.exponentialRampToValueAtTime(freq * .86, end);
				square.frequency.exponentialRampToValueAtTime(freq * .86, end);
				const mix = ctx.createGain();
				mix.gain.value = .22;
				saw.connect(mix);
				square.connect(mix);
				mix.connect(shape);
				saw.start(0);
				square.start(0);
				saw.stop(end);
				square.stop(end);
			}
			const puff = ctx.createBufferSource();
			puff.buffer = noiseBuffer(ctx, .08);
			const puffGain = envGain(ctx, 0, .005, .25, .02, .08);
			puff.connect(puffGain);
			puffGain.connect(dest);
			puff.start(0);
			puff.stop(.08);
		}
	},
	{
		seconds: .48,
		render: (ctx, dest) => {
			const end = .45;
			const osc = ctx.createOscillator();
			osc.type = "sawtooth";
			osc.frequency.setValueAtTime(1700, 0);
			osc.frequency.exponentialRampToValueAtTime(90, end);
			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(4200, 0);
			filter.frequency.exponentialRampToValueAtTime(500, end);
			const gain = envGain(ctx, 0, .008, .4, .05, end);
			osc.connect(filter);
			filter.connect(gain);
			gain.connect(dest);
			osc.start(0);
			osc.stop(end);
		}
	},
	{
		seconds: 1.05,
		render: (ctx, dest) => {
			const osc = ctx.createOscillator();
			osc.type = "sine";
			osc.frequency.setValueAtTime(130, 0);
			osc.frequency.exponentialRampToValueAtTime(34, .5);
			const body = envGain(ctx, 0, .008, .85, .18, 1.02);
			osc.connect(body);
			body.connect(dest);
			osc.start(0);
			osc.stop(1.02);
			const noise = ctx.createBufferSource();
			noise.buffer = noiseBuffer(ctx, .4);
			const low = ctx.createBiquadFilter();
			low.type = "lowpass";
			low.frequency.setValueAtTime(900, 0);
			low.frequency.exponentialRampToValueAtTime(90, .35);
			const crack = envGain(ctx, 0, .004, .65, .05, .38);
			noise.connect(low);
			low.connect(crack);
			crack.connect(dest);
			noise.start(0);
			noise.stop(.4);
		}
	},
	{
		seconds: .42,
		render: (ctx, dest) => {
			const blip = (freq, time, length) => {
				const osc = ctx.createOscillator();
				osc.type = "square";
				osc.frequency.value = freq;
				const high = ctx.createBiquadFilter();
				high.type = "highpass";
				high.frequency.value = 500;
				const gain = envGain(ctx, time, .008, .28, time + .04, time + length);
				osc.connect(high);
				high.connect(gain);
				gain.connect(dest);
				osc.start(time);
				osc.stop(time + length + .02);
			};
			blip(988, 0, .11);
			blip(1319, .09, .26);
		}
	},
	{
		seconds: 1.45,
		render: (ctx, dest) => {
			const end = 1.4;
			const osc = ctx.createOscillator();
			osc.type = "sawtooth";
			const steps = 70;
			for (let i = 0; i <= steps; i++) {
				const t = i / steps * end;
				const wobble = Math.sin(t * Math.PI * 2 * 1.7);
				osc.frequency.setValueAtTime(640 + wobble * 230, t);
			}
			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 2200;
			const gain = envGain(ctx, 0, .03, .32, 1.2799999999999998, end);
			osc.connect(filter);
			filter.connect(gain);
			gain.connect(dest);
			osc.start(0);
			osc.stop(end);
		}
	},
	{
		seconds: .72,
		render: (ctx, dest) => {
			const end = .7;
			const noise = ctx.createBufferSource();
			noise.buffer = noiseBuffer(ctx, end);
			const band = ctx.createBiquadFilter();
			band.type = "bandpass";
			band.Q.value = 3.2;
			band.frequency.setValueAtTime(200, 0);
			band.frequency.exponentialRampToValueAtTime(4800, .32);
			band.frequency.exponentialRampToValueAtTime(280, end);
			const gain = envGain(ctx, 0, .08, .55, .28, end);
			noise.connect(band);
			band.connect(gain);
			gain.connect(dest);
			noise.start(0);
			noise.stop(end);
		}
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
			low.frequency.exponentialRampToValueAtTime(160, .8);
			const gain = envGain(ctx, 0, .02, .7, .35, end);
			shape.connect(low);
			low.connect(gain);
			gain.connect(dest);
			const saw = ctx.createOscillator();
			saw.type = "sawtooth";
			saw.frequency.setValueAtTime(160, 0);
			saw.frequency.exponentialRampToValueAtTime(36, .75);
			const sub = ctx.createOscillator();
			sub.type = "sine";
			sub.frequency.setValueAtTime(80, 0);
			sub.frequency.exponentialRampToValueAtTime(36, .75);
			const subGain = ctx.createGain();
			subGain.gain.value = .65;
			saw.connect(shape);
			sub.connect(subGain);
			subGain.connect(shape);
			saw.start(0);
			sub.start(0);
			saw.stop(end);
			sub.stop(end);
		}
	},
	{
		seconds: .28,
		render: (ctx, dest) => {
			const end = .26;
			const osc = ctx.createOscillator();
			osc.type = "square";
			osc.frequency.setValueAtTime(1400, 0);
			osc.frequency.exponentialRampToValueAtTime(180, end);
			const gain = envGain(ctx, 0, .004, .32, .03, end);
			const noise = ctx.createBufferSource();
			noise.buffer = noiseBuffer(ctx, end);
			const high = ctx.createBiquadFilter();
			high.type = "highpass";
			high.frequency.value = 1800;
			const noiseGain = envGain(ctx, 0, .003, .28, .02, .12);
			osc.connect(gain);
			gain.connect(dest);
			noise.connect(high);
			high.connect(noiseGain);
			noiseGain.connect(dest);
			osc.start(0);
			noise.start(0);
			osc.stop(end);
			noise.stop(end);
		}
	},
	{
		seconds: .7,
		render: (ctx, dest) => {
			for (const time of [
				0,
				.18,
				.36
			]) {
				const osc = ctx.createOscillator();
				osc.type = "square";
				osc.frequency.value = 880;
				const gain = envGain(ctx, time, .01, .28, time + .05, time + .14);
				osc.connect(gain);
				gain.connect(dest);
				osc.start(time);
				osc.stop(time + .16);
			}
		}
	},
	{
		seconds: .86,
		render: (ctx, dest) => {
			const end = .84;
			const noise = ctx.createBufferSource();
			noise.buffer = noiseBuffer(ctx, end);
			const band = ctx.createBiquadFilter();
			band.type = "bandpass";
			band.Q.value = 7;
			const points = [
				2200,
				380,
				3e3,
				460,
				2500,
				320,
				1600
			];
			const step = end / (points.length - 1);
			points.forEach((freq, index) => {
				band.frequency.linearRampToValueAtTime(freq, index * step);
			});
			const gain = envGain(ctx, 0, .01, .45, .76, end);
			noise.connect(band);
			band.connect(gain);
			gain.connect(dest);
			noise.start(0);
			noise.stop(end);
			const crackle = ctx.createBuffer(1, Math.floor(ctx.sampleRate * end), ctx.sampleRate);
			const data = crackle.getChannelData(0);
			for (let i = 0; i < 36; i++) data[Math.floor(Math.random() * data.length)] = Math.random() > .5 ? .9 : -.9;
			const clicks = ctx.createBufferSource();
			clicks.buffer = crackle;
			const clickGain = ctx.createGain();
			clickGain.gain.value = .22;
			clicks.connect(clickGain);
			clickGain.connect(dest);
			clicks.start(0);
			clicks.stop(end);
		}
	}
];
function renderBuiltins() {
	return Promise.all(CLIPS.map(async ({ seconds, render }) => {
		const ctx = new OfflineAudioContext(2, Math.ceil(44100 * seconds), 44100);
		const compressor = ctx.createDynamicsCompressor();
		compressor.threshold.value = -8;
		compressor.knee.value = 8;
		compressor.ratio.value = 6;
		compressor.attack.value = .003;
		compressor.release.value = .12;
		const master = ctx.createGain();
		master.gain.value = .9;
		master.connect(compressor);
		compressor.connect(ctx.destination);
		render(ctx, master);
		return ctx.startRendering();
	}));
}
var FX_ROWS = [
	{
		id: "reverb",
		label: "Reverb"
	},
	{
		id: "flange",
		label: "Flange"
	},
	{
		id: "echo",
		label: "Echo"
	},
	{
		id: "bass",
		label: "Bass boost"
	}
];
function defaultFx() {
	return {
		reverb: {
			on: false,
			amount: .65
		},
		flange: {
			on: false,
			amount: .55
		},
		echo: {
			on: false,
			amount: .5
		},
		bass: {
			on: false,
			amount: .7
		}
	};
}
var SETTINGS_KEY = "lime-soundboard-settings";
function clamp01(value, fallback) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(1, Math.max(0, n));
}
function loadSettings() {
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		const base = defaultFx();
		for (const row of FX_ROWS) {
			const saved = parsed.fx?.[row.id];
			if (!saved) continue;
			base[row.id] = {
				on: Boolean(saved.on),
				amount: clamp01(saved.amount, base[row.id].amount)
			};
		}
		return {
			volume: clamp01(parsed.volume, .85),
			fx: base
		};
	} catch {
		return null;
	}
}
function saveSettings(settings) {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
function makeImpulse(ctx) {
	const rate = ctx.sampleRate;
	const length = Math.floor(rate * 1.7);
	const buffer = ctx.createBuffer(2, length, rate);
	for (let channel = 0; channel < 2; channel++) {
		const data = buffer.getChannelData(channel);
		for (let i = 0; i < length; i++) {
			const t = i / length;
			data[i] = (Math.random() * 2 - 1) * (1 - t) ** 2.8;
		}
		for (const tap of [
			.011,
			.019,
			.029,
			.043
		]) {
			const index = Math.floor(tap * rate);
			if (index < length) data[index] += channel === 0 ? .45 : .3;
		}
	}
	return buffer;
}
function connectGraph(n) {
	n.flangeDelay.delayTime.value = .0035;
	n.echoDelay.delayTime.value = .26;
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
function disconnectGraph(n) {
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
		n.master
	]) node.disconnect();
	n.lfoDepth.disconnect();
}
var DeckEngine = class {
	nodes = null;
	wired = false;
	sources = /* @__PURE__ */ new Set();
	fx = defaultFx();
	volume = .85;
	setFx(fx) {
		this.fx = fx;
		if (this.nodes) this.apply();
	}
	setVolume(volume) {
		this.volume = volume;
		if (this.nodes) this.apply();
	}
	async resume() {
		const nodes = this.ensure();
		if (nodes.ctx.state !== "running") await nodes.ctx.resume();
	}
	play(buffer, onEnd) {
		const nodes = this.ensure();
		if (this.sources.size >= 12) this.sources.values().next().value?.stop();
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
		for (const source of this.sources) try {
			source.onended = null;
			source.stop();
			source.disconnect();
		} catch {}
		this.sources.clear();
		this.killTails();
	}
	ensure() {
		if (this.nodes) return this.nodes;
		const ctx = new AudioContext();
		const impulse = makeImpulse(ctx);
		const lfo = ctx.createOscillator();
		lfo.type = "sine";
		lfo.frequency.value = .25;
		const lfoDepth = ctx.createGain();
		lfoDepth.gain.value = 8e-4;
		lfo.connect(lfoDepth);
		lfo.start();
		const comp = ctx.createDynamicsCompressor();
		comp.threshold.value = -12;
		comp.knee.value = 10;
		comp.ratio.value = 8;
		comp.attack.value = .004;
		comp.release.value = .18;
		const nodes = {
			ctx,
			input: ctx.createGain(),
			bass: ctx.createBiquadFilter(),
			flangeDry: ctx.createGain(),
			flangeWet: ctx.createGain(),
			flangeDelay: ctx.createDelay(.05),
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
			impulse
		};
		nodes.input.gain.value = .9;
		nodes.bass.type = "lowshelf";
		nodes.bass.frequency.value = 110;
		nodes.verb.buffer = impulse;
		this.nodes = nodes;
		connectGraph(nodes);
		this.wired = true;
		this.apply();
		return nodes;
	}
	killTails() {
		const nodes = this.nodes;
		if (!nodes || !this.wired) return;
		disconnectGraph(nodes);
		this.wired = false;
		nodes.flangeDelay = nodes.ctx.createDelay(.05);
		nodes.echoDelay = nodes.ctx.createDelay(2);
		nodes.verb = nodes.ctx.createConvolver();
		nodes.verb.buffer = nodes.impulse;
		connectGraph(nodes);
		this.wired = true;
		this.apply();
	}
	apply() {
		const n = this.nodes;
		if (!n) return;
		const t = n.ctx.currentTime;
		const glide = .03;
		const reverb = n.ctx && this.fx.reverb.on ? this.fx.reverb.amount : 0;
		n.verbDry.gain.setTargetAtTime(1 - reverb * .4, t, glide);
		n.verbWet.gain.setTargetAtTime(reverb * .85, t, glide);
		const flange = this.fx.flange.on ? this.fx.flange.amount : 0;
		n.flangeDry.gain.setTargetAtTime(1, t, glide);
		n.flangeWet.gain.setTargetAtTime(flange * .72, t, glide);
		n.flangeFb.gain.setTargetAtTime(flange * .32, t, glide);
		n.lfo.frequency.setTargetAtTime(.16 + flange * .85, t, glide);
		n.lfoDepth.gain.setTargetAtTime(35e-5 + flange * .0021, t, glide);
		n.flangeDelay.delayTime.setTargetAtTime(.0035, t, glide);
		const echo = this.fx.echo.on ? this.fx.echo.amount : 0;
		n.echoDry.gain.setTargetAtTime(1 - echo * .2, t, glide);
		n.echoWet.gain.setTargetAtTime(echo * .55, t, glide);
		n.echoFb.gain.setTargetAtTime(echo * .5, t, glide);
		n.echoDelay.delayTime.setTargetAtTime(.16 + echo * .26, t, glide);
		const bass = this.fx.bass.on ? this.fx.bass.amount : 0;
		n.bass.gain.setTargetAtTime(bass * 16, t, glide);
		n.master.gain.setTargetAtTime(this.volume, t, glide);
	}
};
var HOLDER = "__limeSoundboard";
function getDeck() {
	const host = window;
	if (!host[HOLDER]) host[HOLDER] = new DeckEngine();
	return host[HOLDER];
}
var PADS = [
	{
		id: "airhorn",
		name: "Airhorn",
		key: "1",
		icon: Megaphone
	},
	{
		id: "laser",
		name: "Laser",
		key: "2",
		icon: Zap
	},
	{
		id: "boom",
		name: "Boom",
		key: "3",
		icon: Bomb
	},
	{
		id: "coin",
		name: "Coin",
		key: "4",
		icon: Coins
	},
	{
		id: "siren",
		name: "Siren",
		key: "5",
		icon: Siren
	},
	{
		id: "whoosh",
		name: "Whoosh",
		key: "6",
		icon: Wind
	},
	{
		id: "drop",
		name: "Drop",
		key: "7",
		icon: ArrowDown
	},
	{
		id: "zap",
		name: "Zap",
		key: "8",
		icon: Sparkles
	},
	{
		id: "alert",
		name: "Alert",
		key: "9",
		icon: Bell
	},
	{
		id: "scratch",
		name: "Scratch",
		key: "0",
		icon: Disc3
	}
];
var KEY_TO_INDEX = {
	Digit1: 0,
	Digit2: 1,
	Digit3: 2,
	Digit4: 3,
	Digit5: 4,
	Digit6: 5,
	Digit7: 6,
	Digit8: 7,
	Digit9: 8,
	Digit0: 9,
	Numpad1: 0,
	Numpad2: 1,
	Numpad3: 2,
	Numpad4: 3,
	Numpad5: 4,
	Numpad6: 5,
	Numpad7: 6,
	Numpad8: 7,
	Numpad9: 8,
	Numpad0: 9
};
var DB_NAME = "lime-soundboard";
var STORE = "clips";
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? /* @__PURE__ */ new Error("Could not open clip storage."));
	});
}
async function readClips() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readonly");
		const store = tx.objectStore(STORE);
		const request = store.getAll();
		const keys = store.getAllKeys();
		const out = /* @__PURE__ */ new Map();
		tx.oncomplete = () => {
			const rows = request.result;
			keys.result.forEach((id, index) => {
				const row = rows[index];
				if (row?.data) out.set(String(id), row);
			});
			db.close();
			resolve(out);
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error ?? /* @__PURE__ */ new Error("Could not read clips."));
		};
	});
}
async function writeClip(id, clip) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(clip, id);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error ?? /* @__PURE__ */ new Error("Could not save that clip."));
		};
	});
}
async function deleteClip(id) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).delete(id);
		tx.oncomplete = () => {
			db.close();
			resolve();
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error ?? /* @__PURE__ */ new Error("Could not remove that clip."));
		};
	});
}
async function decodeClip(data) {
	return new OfflineAudioContext(1, 1, 44100).decodeAudioData(data.slice(0));
}
var MAX_BYTES = 8388608;
function clipLabel(fileName) {
	const bare = fileName.replace(/\.[a-z0-9]+$/i, "").trim() || "Custom";
	return bare.length > 14 ? `${bare.slice(0, 13)}…` : bare;
}
function Soundboard() {
	const [builtins, setBuiltins] = (0, import_react.useState)(null);
	const [customs, setCustoms] = (0, import_react.useState)(() => Array(PADS.length).fill(null));
	const [names, setNames] = (0, import_react.useState)(() => PADS.map((pad) => pad.name));
	const [live, setLive] = (0, import_react.useState)({});
	const [fxOpen, setFxOpen] = (0, import_react.useState)(false);
	const [fx, setFx] = (0, import_react.useState)(defaultFx);
	const [volume, setVolume] = (0, import_react.useState)(.85);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [booting, setBooting] = (0, import_react.useState)(true);
	const gen = (0, import_react.useRef)(0);
	const fileRef = (0, import_react.useRef)(null);
	const pickIndex = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		renderBuiltins().then((buffers) => {
			if (!cancel) setBuiltins(buffers);
		}).catch(() => {
			if (!cancel) setError("Could not prepare the built-in sounds.");
		}).finally(() => {
			if (!cancel) setBooting(false);
		});
		return () => {
			cancel = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = loadSettings();
		if (saved) {
			setFx(saved.fx);
			setVolume(saved.volume);
		}
		let cancel = false;
		readClips().then(async (stored) => {
			const nextBuffers = Array(PADS.length).fill(null);
			const nextNames = PADS.map((pad) => pad.name);
			await Promise.all(PADS.map(async (pad, index) => {
				const clip = stored.get(pad.id);
				if (!clip) return;
				try {
					nextBuffers[index] = await decodeClip(clip.data);
					nextNames[index] = clip.name;
				} catch {}
			}));
			if (cancel) return;
			setCustoms(nextBuffers);
			setNames(nextNames);
		}).catch(() => {
			if (!cancel) setError("Saved clips could not be loaded.");
		}).finally(() => {
			if (!cancel) setHydrated(true);
		});
		return () => {
			cancel = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		saveSettings({
			fx,
			volume
		});
		const deck = getDeck();
		deck.setFx(fx);
		deck.setVolume(volume);
	}, [
		fx,
		volume,
		hydrated
	]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.repeat) return;
			const target = event.target;
			if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
			if (event.code === "Escape") {
				event.preventDefault();
				stopAll();
				return;
			}
			const index = KEY_TO_INDEX[event.code];
			if (index === void 0) return;
			event.preventDefault();
			play(index);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	function bufferAt(index) {
		return customs[index] ?? builtins?.[index] ?? null;
	}
	async function play(index) {
		const buffer = bufferAt(index);
		if (!buffer) return;
		const token = gen.current;
		setError(null);
		try {
			await getDeck().resume();
		} catch {
			setError("Audio could not start. Tap the pad again.");
			return;
		}
		if (gen.current !== token) return;
		setLive((current) => ({
			...current,
			[index]: (current[index] ?? 0) + 1
		}));
		getDeck().play(buffer, () => {
			if (gen.current !== token) return;
			setLive((current) => {
				const nextCount = (current[index] ?? 1) - 1;
				if (nextCount <= 0) {
					const next = { ...current };
					delete next[index];
					return next;
				}
				return {
					...current,
					[index]: nextCount
				};
			});
		});
	}
	function stopAll() {
		gen.current += 1;
		getDeck().stopAll();
		setLive({});
	}
	function toggleFx(id) {
		setFx((current) => ({
			...current,
			[id]: {
				...current[id],
				on: !current[id].on
			}
		}));
	}
	function setAmount(id, amount) {
		setFx((current) => ({
			...current,
			[id]: {
				...current[id],
				amount
			}
		}));
	}
	async function onFile(file) {
		if (!file) return;
		const index = pickIndex.current;
		if (file.size > MAX_BYTES) {
			setError("Keep clips under 8 MB.");
			return;
		}
		try {
			const data = await file.arrayBuffer();
			const audio = await decodeClip(data);
			const name = clipLabel(file.name);
			setCustoms((current) => {
				const next = [...current];
				next[index] = audio;
				return next;
			});
			setNames((current) => {
				const next = [...current];
				next[index] = name;
				return next;
			});
			await writeClip(PADS[index].id, {
				name,
				data
			});
			setError(null);
		} catch {
			setError("That file could not be played. Try wav, mp3, or ogg.");
		}
	}
	async function restore(index) {
		setCustoms((current) => {
			const next = [...current];
			next[index] = null;
			return next;
		});
		setNames((current) => {
			const next = [...current];
			next[index] = PADS[index].name;
			return next;
		});
		try {
			await deleteClip(PADS[index].id);
		} catch {
			setError("The built-in is back, but the saved file could not be deleted.");
		}
	}
	const fxHot = FX_ROWS.some((row) => fx[row.id].on);
	const ready = Boolean(builtins) && !booting;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "deck-scroll mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 md:px-6 md:py-6",
		"data-fx": fxOpen ? "open" : "closed",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-4 flex flex-col gap-3 border-b border-lime pb-4 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs tracking-widest text-lime-dim",
						children: "10 PADS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold tracking-widest",
						children: "LIME DECK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-lime-dim",
						children: "Keys 1–0 play. Escape cuts the output."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-w-0 items-center gap-3 md:w-64",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
							className: "size-5 shrink-0",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xs tracking-widest",
							children: "VOL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							suppressHydrationWarning: true,
							className: "deck-range min-w-0 flex-1",
							type: "range",
							min: 0,
							max: 1,
							step: .01,
							value: volume,
							"aria-label": "Volume",
							onChange: (event) => setVolume(Number(event.target.value))
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 min-h-6 text-sm text-lime-dim",
				role: "status",
				children: error ? error : booting ? "Warming the pads…" : "Upload replaces a pad. The corner arrow restores the built-in."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-5",
				children: PADS.map((pad, index) => {
					const Icon = pad.icon;
					const custom = customs[index] !== null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "pad font-display",
								"data-live": live[index] ? "true" : "false",
								disabled: !ready,
								"aria-keyshortcuts": pad.key,
								"aria-label": `Play ${names[index]}`,
								onClick: () => void play(index),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute top-2 left-2 text-xs tracking-widest",
										children: pad.key
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-7",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-full truncate text-sm font-bold tracking-wide uppercase",
										children: names[index]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "corner absolute right-0 bottom-0",
								"aria-label": `Load a sound onto ${pad.name}`,
								onClick: () => {
									pickIndex.current = index;
									fileRef.current?.click();
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
									className: "size-4",
									"aria-hidden": "true"
								})
							}),
							custom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "corner absolute top-0 right-0",
								"aria-label": `Restore built-in ${pad.name}`,
								onClick: () => void restore(index),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									className: "size-4",
									"aria-hidden": "true"
								})
							}) : null
						]
					}, pad.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock mt-4",
				children: [fxOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: "sound-effects",
					className: "fx-panel order-1 mb-3 md:order-2 md:mt-3 md:mb-0",
					"aria-label": "Sound effects",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display mb-2 text-xs tracking-widest text-lime-dim",
						children: "SOUND EFFECTS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: FX_ROWS.map((row) => {
							const state = fx[row.id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "fx-toggle shrink-0",
									"aria-pressed": state.on,
									onClick: () => toggleFx(row.id),
									children: state.on ? "ON" : "OFF"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-sm tracking-wide",
											children: row.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-xs text-lime-dim",
											children: Math.round(state.amount * 100)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "deck-range",
										type: "range",
										min: 0,
										max: 1,
										step: .01,
										value: state.amount,
										disabled: !state.on,
										"aria-label": `${row.label} amount`,
										onChange: (event) => setAmount(row.id, Number(event.target.value))
									})]
								})]
							}, row.id);
						})
					})]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "order-2 flex gap-3 md:order-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "transport flex-1",
						onClick: stopAll,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
							className: "size-4 fill-current",
							"aria-hidden": "true"
						}), "STOP"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "transport",
						"data-hot": fxHot ? "true" : "false",
						"aria-expanded": fxOpen,
						"aria-controls": "sound-effects",
						onClick: () => setFxOpen((open) => !open),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
							className: "size-4",
							"aria-hidden": "true"
						}), "EFFECTS"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				suppressHydrationWarning: true,
				ref: fileRef,
				className: "sr-only",
				type: "file",
				accept: "audio/*",
				"aria-hidden": "true",
				tabIndex: -1,
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					onFile(file);
				}
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Soundboard, {});
}
//#endregion
export { Home as component };
