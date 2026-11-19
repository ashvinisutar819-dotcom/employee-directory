import type { CSSProperties } from "react";

const hash = (text: string) => [...text].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 360, 7);

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/** Deterministic gradient so each person keeps the same avatar colour. */
export function avatarStyle(name: string): CSSProperties {
  const h = hash(name);
  return { background: `linear-gradient(135deg, hsl(${h} 75% 58%), hsl(${(h + 45) % 360} 75% 45%))` };
}

/** Exposes a hue as a CSS variable so badges can theme themselves for light/dark. */
export const hueStyle = (text: string) => ({ "--h": hash(text) }) as CSSProperties;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
