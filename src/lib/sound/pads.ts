import {
  ArrowDown,
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
  { id: "airhorn", name: "Airhorn", key: "1", icon: Megaphone },
  { id: "laser", name: "Laser", key: "2", icon: Zap },
  { id: "boom", name: "Boom", key: "3", icon: Bomb },
  { id: "coin", name: "Coin", key: "4", icon: Coins },
  { id: "siren", name: "Siren", key: "5", icon: Siren },
  { id: "whoosh", name: "Whoosh", key: "6", icon: Wind },
  { id: "drop", name: "Drop", key: "7", icon: ArrowDown },
  { id: "zap", name: "Zap", key: "8", icon: Sparkles },
  { id: "alert", name: "Alert", key: "9", icon: Bell },
  { id: "scratch", name: "Scratch", key: "0", icon: Disc3 },
];

export const KEY_TO_INDEX: Record<string, number> = {
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
  Numpad0: 9,
};
