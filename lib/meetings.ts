import type { Meeting, Member, TimeSlot } from "./types";
import type { MeetingWeight } from "./types";
import { getAllSlots, isSlotFreeForMember } from "./slots";

const MIN_PARTICIPANTS_FOR_AUTO_RESCHEDULE = 3;

/**
 * Returns meetings that have >= 3 participants and whose current slot
 * is no longer free for at least one participant.
 */
export function getMeetingsWithConflict(
  members: Member[],
  meetings: Meeting[]
): Meeting[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return meetings.filter((meeting) => {
    if (meeting.participantIds.length < MIN_PARTICIPANTS_FOR_AUTO_RESCHEDULE)
      return false;
    const participants = meeting.participantIds
      .map((id) => memberMap.get(id))
      .filter((m): m is Member => m != null);
    return participants.some((p) => !isSlotFreeForMember(p, meeting.slot));
  });
}

/**
 * Exclusion method: find first slot (in order) where all participants are free.
 * Optionally prefers slots adjacent to existing meetings (batching) by sorting.
 */
export function findBestRescheduleSlot(
  meeting: Meeting,
  members: Member[],
  existingMeetings: Meeting[]
): TimeSlot | null {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const participants = meeting.participantIds
    .map((id) => memberMap.get(id))
    .filter((m): m is Member => m != null);
  if (participants.length === 0) return null;

  const allSlots = getAllSlots();
  let candidateSlots = allSlots.filter((s) =>
    participants.every((p) => isSlotFreeForMember(p, s))
  );

  if (meeting.weight === "low") {
    const deepWorkSet = new Set<TimeSlot>();
    for (const p of participants) {
      for (const ds of p.deepWorkSlots ?? []) deepWorkSet.add(ds);
    }
    candidateSlots = candidateSlots.filter((s) => !deepWorkSet.has(s));
  }
  if (candidateSlots.length === 0) return null;

  // Batching: prefer slots adjacent to existing meetings of these participants
  const participantIdsSet = new Set(meeting.participantIds);
  const otherMeetingSlots = existingMeetings
    .filter(
      (m) =>
        m.id !== meeting.id &&
        m.participantIds.some((id) => participantIdsSet.has(id))
    )
    .map((m) => m.slot);
  const slotOrder = [...candidateSlots].sort((a, b) => {
    const aAdjacent = otherMeetingSlots.some((os) => isAdjacent(a, os));
    const bAdjacent = otherMeetingSlots.some((os) => isAdjacent(b, os));
    if (aAdjacent && !bAdjacent) return -1;
    if (!aAdjacent && bAdjacent) return 1;
    return 0;
  });
  return slotOrder[0] ?? null;
}

function isAdjacent(slotA: TimeSlot, slotB: TimeSlot): boolean {
  const [dA, hA] = slotA.split("-").map(Number);
  const [dB, hB] = slotB.split("-").map(Number);
  if (dA !== dB) return false;
  return Math.abs(hA - hB) === 1;
}

export function applyReschedule(meeting: Meeting, newSlot: TimeSlot): Meeting {
  return { ...meeting, slot: newSlot };
}

export type RecommendedSlot = { slot: TimeSlot; reason: string };

/**
 * Get top N recommended slots for a meeting: all participants free,
 * for low weight exclude deep work slots, sort by batching, attach reason.
 */
export function getTopRecommendedSlots(
  participantIds: string[],
  members: Member[],
  existingMeetings: Meeting[],
  meetingWeight: MeetingWeight,
  options: { top: number }
): RecommendedSlot[] {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const participants = participantIds
    .map((id) => memberMap.get(id))
    .filter((m): m is Member => m != null);
  if (participants.length === 0) return [];

  const allSlots = getAllSlots();
  let candidates = allSlots.filter((s) =>
    participants.every((p) => isSlotFreeForMember(p, s))
  );

  if (meetingWeight === "low") {
    const deepWorkSet = new Set<TimeSlot>();
    for (const p of participants) {
      for (const ds of p.deepWorkSlots ?? []) deepWorkSet.add(ds);
    }
    candidates = candidates.filter((s) => !deepWorkSet.has(s));
  }

  const participantIdsSet = new Set(participantIds);
  const otherMeetings = existingMeetings.filter((m) =>
    m.participantIds.some((id) => participantIdsSet.has(id))
  );

  const sorted = [...candidates].sort((a, b) => {
    const aAdj = otherMeetings.some((m) => isAdjacent(a, m.slot));
    const bAdj = otherMeetings.some((m) => isAdjacent(b, m.slot));
    if (aAdj && !bAdj) return -1;
    if (!aAdj && bAdj) return 1;
    return 0;
  });

  const top = sorted.slice(0, options.top);
  return top.map((s) => ({
    slot: s,
    reason: getSlotReason(s, otherMeetings, meetingWeight),
  }));
}

function getSlotReason(
  s: TimeSlot,
  adjacentMeetings: Meeting[],
  weight: MeetingWeight
): string {
  const adj = adjacentMeetings.find((m) => isAdjacent(s, m.slot));
  if (adj) {
    const title = adj.title ?? "會議";
    return `緊鄰「${title}」`;
  }
  if (weight === "low")
    return "無深度工作區衝突，時段空閒";
  return "時段空閒";
}
