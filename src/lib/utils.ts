import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format remaining purse — e.g. ₹50k, ₹49.5k */
export function formatPurse(amount: number): string {
  if (amount >= 1000) {
    const k = Math.round((amount / 1000) * 10) / 10;
    const text = Number.isInteger(k) ? String(k) : k.toFixed(1);
    return `₹${text}k`;
  }
  return `₹${amount.toLocaleString()}`;
}
