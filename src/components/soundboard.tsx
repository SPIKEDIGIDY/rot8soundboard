import { useEffect, useRef, useState } from "react";
import { RotateCcw, SlidersHorizontal, Square, Upload, Volume2 } from "lucide-react";
import { renderBuiltins } from "@/lib/sound/builtins";
import { getDeck } from "@/lib/sound/engine";
import { FX_ROWS, defaultFx, loadSettings, saveSettings, type FxState } from "@/lib/sound/fx";
import { MAX_PADS, PADS, createPad, loadLayout, saveLayout, type PadDef } from "@/lib/sound/pads";
import { decodeClip, deleteClip, readClips, writeClip } from "@/lib/sound/storage";

const MAX_BYTES = 8 * 1024 * 1024;

function clipLabel(fileName: string) {
  const bare = fileName.replace(/\.[a-z0-9]+$/i, "").trim() || "Custom";
  return bare.length > 14 ? `${bare.slice(0, 13)}…` : bare;
}

export function Soundboard() {
  const [pads, setPads] = useState<PadDef[]>(PADS);
  const [builtins, setBuiltins] = useState<AudioBuffer[] | null>(null);
  const [customs, setCustoms] = useState<(AudioBuffer | null)[]>(() => Array(PADS.length).fill(null));
  const [names, setNames] = useState(() => PADS.map((pad) => pad.name));
  const [live, setLive] = useState<Record<number, number>>({});
  const [fxOpen, setFxOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [fx, setFx] = useState<FxState>(defaultFx);
  const [volume, setVolume] = useState(0.85);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const gen = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickIndex = useRef(0);

  useEffect(() => {
    let cancel = false;
    renderBuiltins()
      .then((buffers) => {
        if (!cancel) setBuiltins(buffers);
      })
      .catch(() => {
        if (!cancel) setError("Could not prepare the built-in sounds.");
      })
      .finally(() => {
        if (!cancel) setBooting(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      setFx(saved.fx);
      setVolume(saved.volume);
    }
    let cancel = false;
    const layout = loadLayout();
    const nextPads = layout ?? PADS;
    setPads(nextPads);
    readClips()
      .then(async (stored) => {
        const nextBuffers = Array<AudioBuffer | null>(nextPads.length).fill(null);
        const nextNames = nextPads.map((pad) => pad.name);
        await Promise.all(
          nextPads.map(async (pad, index) => {
            const clip = stored.get(pad.id);
            if (!clip) return;
            try {
              nextBuffers[index] = await decodeClip(clip.data);
              nextNames[index] = clip.name;
            } catch {
              /* skip a clip the browser cannot decode */
            }
          }),
        );
        if (cancel) return;
        setCustoms(nextBuffers);
        setNames(nextNames);
      })
      .catch(() => {
        if (!cancel) setError("Saved clips could not be loaded.");
      })
      .finally(() => {
        if (!cancel) setHydrated(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings({ fx, volume });
    const deck = getDeck();
    deck.setFx(fx);
    deck.setVolume(volume);
  }, [fx, volume, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveLayout(pads);
  }, [pads, hydrated]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.code === "Escape") {
        event.preventDefault();
        stopAll();
        return;
      }
      const digit = event.code.startsWith("Digit") || event.code.startsWith("Numpad") ? event.code.slice(-1) : "";
      const index = pads.findIndex((pad) => pad.key === digit);
      if (!digit || index < 0) return;
      event.preventDefault();
      void play(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function bufferAt(index: number) {
    const id = pads[index]?.id;
    const builtinIndex = PADS.findIndex((pad) => pad.id === id);
    const builtin = builtinIndex < 0 ? null : builtins?.[builtinIndex];
    return customs[index] ?? builtin ?? null;
  }

  async function play(index: number) {
    const buffer = bufferAt(index);
    if (!buffer) {
      setError("Upload a sound onto this pad first.");
      return;
    }
    const token = gen.current;
    setError(null);
    try {
      await getDeck().resume();
    } catch {
      setError("Audio could not start. Tap the pad again.");
      return;
    }
    if (gen.current !== token) return;
    setLive((current) => ({ ...current, [index]: (current[index] ?? 0) + 1 }));
    getDeck().play(buffer, () => {
      if (gen.current !== token) return;
      setLive((current) => {
        const nextCount = (current[index] ?? 1) - 1;
        if (nextCount <= 0) {
          const next = { ...current };
          delete next[index];
          return next;
        }
        return { ...current, [index]: nextCount };
      });
    });
  }

  function stopAll() {
    gen.current += 1;
    getDeck().stopAll();
    setLive({});
  }

  function toggleFx(id: keyof FxState) {
    setFx((current) => ({
      ...current,
      [id]: { ...current[id], on: !current[id].on },
    }));
  }

  function setAmount(id: keyof FxState, amount: number) {
    setFx((current) => ({
      ...current,
      [id]: { ...current[id], amount },
    }));
  }

  async function onFile(file: File | undefined) {
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
      await writeClip(pads[index].id, { name, data });
      setError(null);
    } catch {
      setError("That file could not be played. Try wav, mp3, or ogg.");
    }
  }

  async function restore(index: number) {
    setCustoms((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
    setNames((current) => {
      const next = [...current];
      next[index] = pads[index].name;
      return next;
    });
    try {
      await deleteClip(pads[index].id);
    } catch {
      setError("The built-in is back, but the saved file could not be deleted.");
    }
  }

  function addPad() {
    if (pads.length >= MAX_PADS) return;
    const pad = createPad(pads.length + 1);
    setPads((current) => [...current, pad]);
    setCustoms((current) => [...current, null]);
    setNames((current) => [...current, pad.name]);
  }

  function removePad() {
    if (pads.length <= 1) return;
    const last = pads[pads.length - 1];
    setPads((current) => current.slice(0, -1));
    setCustoms((current) => current.slice(0, -1));
    setNames((current) => current.slice(0, -1));
    setLive({});
    void deleteClip(last.id).catch(() => {
      setError("The pad is gone, but its saved file could not be deleted.");
    });
  }

  const fxHot = FX_ROWS.some((row) => fx[row.id].on);
  const ready = Boolean(builtins) && !booting;

  return (
    <main
      className="deck-scroll mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 md:px-6 md:py-6"
      data-fx={fxOpen ? "open" : "closed"}
    >
      <header className="mb-4 flex flex-col gap-3 border-b border-lime pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xs tracking-widest text-lime-dim">{pads.length} PADS</p>
          <h1 className="font-display text-3xl font-bold tracking-widest">LIME DECK</h1>
          <p className="text-sm text-lime-dim">Keys 1–0 play. Escape cuts the output.</p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-64">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="pad-edit"
              aria-expanded={editOpen}
              aria-pressed={editOpen}
              onClick={() => setEditOpen((open) => !open)}
            >
              PADS
            </button>
            {editOpen ? (
              <>
                <button
                  type="button"
                  className="pad-edit"
                  disabled={pads.length >= MAX_PADS}
                  onClick={addPad}
                >
                  ADD
                </button>
                <button
                  type="button"
                  className="pad-edit"
                  disabled={pads.length <= 1}
                  onClick={removePad}
                >
                  REMOVE
                </button>
              </>
            ) : null}
          </div>
          <label className="flex min-w-0 items-center gap-3">
          <Volume2 className="size-5 shrink-0" aria-hidden="true" />
          <span className="font-display text-xs tracking-widest">VOL</span>
          <input
            suppressHydrationWarning
            className="deck-range min-w-0 flex-1"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            aria-label="Volume"
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>
        </div>
      </header>

      <p className="mb-3 min-h-6 text-sm text-lime-dim" role="status">
        {error
          ? error
          : booting
            ? "Warming the pads…"
            : "Upload replaces a pad. The corner arrow restores the built-in."}
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {pads.map((pad, index) => {
          const Icon = pad.icon;
          const custom = customs[index] !== null;
          const label = custom && names[index] ? names[index] : pad.name;
          return (
            <div key={pad.id} className="relative">
              <button
                type="button"
                className="pad font-display"
                data-live={live[index] ? "true" : "false"}
                disabled={!ready}
                aria-keyshortcuts={pad.key}
                aria-label={`Play ${label}`}
                onClick={() => void play(index)}
              >
                <span className="absolute top-2 left-2 text-xs tracking-widest">{pad.key}</span>
                <Icon className="size-7" aria-hidden="true" />
                <span className="max-w-full truncate text-sm font-bold tracking-wide uppercase">
                  {label}
                </span>
              </button>
              <button
                type="button"
                className="corner absolute right-0 bottom-0"
                aria-label={`Load a sound onto ${pad.name}`}
                onClick={() => {
                  pickIndex.current = index;
                  fileRef.current?.click();
                }}
              >
                <Upload className="size-4" aria-hidden="true" />
              </button>
              {custom ? (
                <button
                  type="button"
                  className="corner absolute top-0 right-0"
                  aria-label={`Restore built-in ${pad.name}`}
                  onClick={() => void restore(index)}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="dock mt-4">
        {fxOpen ? (
          <section
            id="sound-effects"
            className="fx-panel order-1 mb-3 md:order-2 md:mt-3 md:mb-0"
            aria-label="Sound effects"
          >
            <h2 className="font-display mb-2 text-xs tracking-widest text-lime-dim">SOUND EFFECTS</h2>
            <ul className="flex flex-col gap-2">
              {FX_ROWS.map((row) => {
                const state = fx[row.id];
                return (
                  <li key={row.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      className="fx-toggle shrink-0"
                      aria-pressed={state.on}
                      onClick={() => toggleFx(row.id)}
                    >
                      {state.on ? "ON" : "OFF"}
                    </button>
                    <label className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-sm tracking-wide">{row.label}</span>
                        <span className="font-display text-xs text-lime-dim">
                          {Math.round(state.amount * 100)}
                        </span>
                      </span>
                      <input
                        className="deck-range"
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={state.amount}
                        disabled={!state.on}
                        aria-label={`${row.label} amount`}
                        onChange={(event) => setAmount(row.id, Number(event.target.value))}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className="order-2 flex gap-3 md:order-1">
          <button type="button" className="transport flex-1" onClick={stopAll}>
            <Square className="size-4 fill-current" aria-hidden="true" />
            STOP
          </button>
          <button
            type="button"
            className="transport"
            data-hot={fxHot ? "true" : "false"}
            aria-expanded={fxOpen}
            aria-controls="sound-effects"
            onClick={() => setFxOpen((open) => !open)}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            EFFECTS
          </button>
        </div>
      </div>

      <input
        suppressHydrationWarning
        ref={fileRef}
        className="sr-only"
        type="file"
        accept="audio/*"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onFile(file);
        }}
      />
    </main>
  );
}
