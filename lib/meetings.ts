import type { Meeting, Member, TimeSlot } from "./types";
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
  // Get slots that are free for ALL participants
  const candidateSlots = allSlots.filter((s) =>
    participants.every((p) => isSlotFreeForMember(p, s))
  );
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
