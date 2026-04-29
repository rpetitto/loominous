import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractLoomId(url: string): string | null {
  const patterns = [
    /loom\.com\/share\/([a-zA-Z0-9]+)/,
    /loom\.com\/v\/([a-zA-Z0-9]+)/,
    /loom\.com\/embed\/([a-zA-Z0-9]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function isValidLoomUrl(url: string): boolean {
  return !!extractLoomId(url);
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "Unknown";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
