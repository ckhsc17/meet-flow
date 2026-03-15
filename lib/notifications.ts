import type { Meeting, Notification, TimeSlot } from "./types";
import { DAYS } from "./constants";

export function createRescheduleNotification(
  meeting: Meeting,
  oldSlot: TimeSlot,
  newSlot: TimeSlot,
  memberName?: string
): Omit<Notification, "id"> {
  const reason = memberName ? `（因 ${memberName} 的時段變更）` : "";
  const [newD, newH] = newSlot.split("-").map(Number);
  const newStr = `${DAYS[newD]} ${newH}:00`;
  const title = meeting.title ?? "會議";
  return {
    type: "reschedule",
    meetingId: meeting.id,
    message: `${title} 已改至 ${newStr}${reason}`,
    read: false,
    createdAt: Date.now(),
  };
}
