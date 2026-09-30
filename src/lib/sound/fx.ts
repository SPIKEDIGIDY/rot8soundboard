export type FxId = "reverb" | "flange" | "echo" | "bass";

export type FxRow = { on: boolean; amount: number };

export type FxState = Record<FxId, FxRow>;

export const FX_ROWS: { id: FxId; label: string }[] = [
  { id: "reverb", label: "Reverb" },
  { id: "flange", label: "Flange" },
  { id: "echo", label: "Echo" },
  { id: "bass", label: "Bass boost" },
];

export function defaultFx(): FxState {
  return {
    reverb: { on: false, amount: 0.65 },
    flange: { on: false, amount: 0.55 },
    echo: { on: false, amount: 0.5 },
    bass: { on: false, amount: 0.7 },
  };
}

const SETTINGS_KEY = "lime-soundboard-settings";

export type DeckSettings = { volume: number; fx: FxState };

function clamp01(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}

export function loadSettings(): DeckSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { volume?: unknown; fx?: Partial<Record<FxId, FxRow>> };
    const base = defaultFx();
    for (const row of FX_ROWS) {
      const saved = parsed.fx?.[row.id];
      if (!saved) continue;
      base[row.id] = {
        on: Boolean(saved.on),
        amount: clamp01(saved.amount, base[row.id].amount),
      };
    }
    return { volume: clamp01(parsed.volume, 0.85), fx: base };
  } catch {
    return null;
  }
}

export function saveSettings(settings: DeckSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
