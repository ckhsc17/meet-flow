import type { Member, TimeSlot } from "./types";
import { DAYS, HOURS } from "./constants";
import { slot } from "./constants";

export { slot } from "./constants";

export function getCommonSlots(members: Member[]): TimeSlot[] {
  return DAYS.flatMap((_, d) =>
    HOURS.filter((h) =>
      members.every((m) => m.availability.includes(slot(d, h)))
    ).map((h) => slot(d, h))
  );
}

export function isSlotFreeForMember(member: Member, s: TimeSlot): boolean {
  return member.availability.includes(s);
}

export function getAllSlots(): TimeSlot[] {
  return DAYS.flatMap((_, d) => HOURS.map((h) => slot(d, h)));
}

/** Generate random free slots for a member (each slot included with probability ~0.5). */
export function generateRandomAvailability(): TimeSlot[] {
  const all = getAllSlots();
  return all.filter(() => Math.random() < 0.65);
}
