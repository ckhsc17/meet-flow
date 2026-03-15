import type { TimeSlot } from "./types";

export const DAYS = ["週一", "週二", "週三", "週四", "週五"] as const;
export const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17] as const;

export const COLORS = [
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-cyan-500",
] as const;

export function slot(day: number, hour: number): TimeSlot {
  return `${day}-${hour}`;
}
