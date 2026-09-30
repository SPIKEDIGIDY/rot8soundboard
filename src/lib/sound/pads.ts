import {
  ArrowDown,
  AudioLines,
  Bell,
  Bomb,
  Coins,
  Disc3,
  Megaphone,
  Siren,
  Sparkles,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type PadDef = {
  id: string;
  name: string;
  key: string;
  icon: LucideIcon;
};

export const PADS: PadDef[] = [
  { id: "airhorn", name: "AIRHORN", key: "1", icon: Megaphone },
  { id: "crickets", name: "CRICKETS", key: "2", icon: Zap },
  { id: "fat fart", name: "FATFART", key: "3", icon: Bomb },
  { id: "whistle", name: "WHISTLE", key: "4", icon: Coins },
  { id: "ripscream1", name: "SCREAM1", key: "5", icon: Siren },
  { id: "ripscream2", name: "SCREAM2", key: "6", icon: Wind },
  { id: "ripfuck", name: "FUCK", key: "7", icon: ArrowDown },
  { id: "ripbitch", name: "BITCH", key: "8", icon: Sparkles },
  { id: "dayne1", name: "DAYNELAUGH1", key: "9", icon: Bell },
  { id: "dayne2", name: "DAYNELAUGH2", key: "0", icon: Disc3 },
];

const LAYOUT_KEY = "lime-soundboard-layout";
const MAX_PADS = 30;

const ICONS = new Map(PADS.map((pad) => [pad.id, pad]));

export function createPad(count: number): PadDef {
  return {
    id: `extra-${crypto.randomUUID()}`,
    name: `PAD ${count}`,
    key: "",
    icon: AudioLines,
  };
}

export function loadLayout(): PadDef[] | null {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > MAX_PADS) return null;
    const pads: PadDef[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") return null;
      const record = row as { id?: unknown; name?: unknown; key?: unknown };
      const id = typeof record.id === "string" ? record.id : "";
      const name = typeof record.name === "string" ? record.name.slice(0, 24) : "";
      const key = typeof record.key === "string" ? record.key.slice(0, 1) : "";
      if (!id || !name) return null;
      const known = ICONS.get(id);
      pads.push({
        id,
        name,
        key: known ? known.key : key,
        icon: known?.icon ?? AudioLines,
      });
    }
    return pads;
  } catch {
    return null;
  }
}

export function saveLayout(pads: PadDef[]) {
  const slim = pads.map((pad) => ({ id: pad.id, name: pad.name, key: pad.key }));
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(slim));
}

export { MAX_PADS };